"""
Django REST API Views for CivicSaathi
Implements role-based security, status transitions, audit logging,
search, filtering, and aggregate analytics.
"""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone
from .models import (
    User, ComplaintCategory, Complaint, ComplaintUpdate,
    HelpRequest, HelpOffer, DonationListing, DirectoryService,
    Opportunity, CommunityEvent, ContentFlag, Notification
)
from .serializers import (
    UserSerializer, ComplaintCategorySerializer, ComplaintSerializer,
    ComplaintUpdateSerializer, HelpRequestSerializer, HelpOfferSerializer,
    DonationListingSerializer, DirectoryServiceSerializer, OpportunitySerializer,
    CommunityEventSerializer, ContentFlagSerializer, NotificationSerializer
)


class IsModeratorOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role in ['moderator', 'admin'] or request.user.is_staff))


class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all().select_related('citizen', 'category').prefetch_related('updates')
    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        complaint = serializer.save(citizen=self.request.user)
        # Audit record
        ComplaintUpdate.objects.create(
            complaint=complaint,
            actor=self.request.user,
            previous_status=None,
            new_status=Complaint.Statuses.SUBMITTED,
            remarks="Issue report initially submitted by citizen."
        )

    @action(detail=True, methods=['post'], permission_classes=[IsModeratorOrAdmin])
    def update_status(self, request, pk=None):
        complaint = self.get_object()
        new_status = request.data.get('status')
        remarks = request.data.get('remarks', '')
        if not new_status or not remarks:
            return Response({'error': 'Status and remarks are required for status update.'}, status=status.HTTP_400_BAD_REQUEST)

        prev_status = complaint.status
        complaint.status = new_status
        if new_status == Complaint.Statuses.REJECTED:
            complaint.rejection_reason = remarks
        complaint.save()

        # Save audit history record
        ComplaintUpdate.objects.create(
            complaint=complaint,
            actor=request.user,
            previous_status=prev_status,
            new_status=new_status,
            remarks=remarks
        )

        # Notify reporter
        Notification.objects.create(
            recipient=complaint.citizen,
            event_type='complaint_status_update',
            title=f"Report {complaint.reference_no} updated",
            message=f"Status changed to {new_status.replace('_', ' ').title()}: {remarks}",
            target_link=f"/reports/{complaint.id}"
        )

        return Response(ComplaintSerializer(complaint).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def provide_feedback(self, request, pk=None):
        complaint = self.get_object()
        if complaint.citizen != request.user and not request.user.is_staff:
            return Response({'error': 'Only the original reporter can submit resolution feedback.'}, status=status.HTTP_403_FORBIDDEN)

        rating = request.data.get('rating')
        notes = request.data.get('notes', '')
        reopen = request.data.get('reopen', False)

        complaint.citizen_feedback_rating = rating
        complaint.citizen_feedback_notes = notes

        if reopen:
            prev_status = complaint.status
            complaint.status = Complaint.Statuses.REOPENED
            ComplaintUpdate.objects.create(
                complaint=complaint,
                actor=request.user,
                previous_status=prev_status,
                new_status=Complaint.Statuses.REOPENED,
                remarks=f"Citizen flagged resolution as incomplete/unresolved: {notes}"
            )

        complaint.save()
        return Response(ComplaintSerializer(complaint).data)


class HelpRequestViewSet(viewsets.ModelViewSet):
    queryset = HelpRequest.objects.all().select_related('requester').prefetch_related('offers')
    serializer_class = HelpRequestSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(requester=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def offer_help(self, request, pk=None):
        help_request = self.get_object()
        message = request.data.get('message', 'I would be happy to assist you with this.')
        offer = HelpOffer.objects.create(
            request=help_request,
            volunteer=request.user,
            message=message
        )
        return Response(HelpOfferSerializer(offer).data, status=status.HTTP_201_CREATED)


class DonationListingViewSet(viewsets.ModelViewSet):
    queryset = DonationListing.objects.all().select_related('donor', 'reserved_by')
    serializer_class = DonationListingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(donor=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reserve(self, request, pk=None):
        listing = self.get_object()
        if listing.status != 'available':
            return Response({'error': 'Item is no longer available'}, status=status.HTTP_400_BAD_REQUEST)
        listing.status = 'reserved'
        listing.reserved_by = request.user
        listing.save()
        return Response(DonationListingSerializer(listing).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def mark_collected(self, request, pk=None):
        listing = self.get_object()
        if listing.donor != request.user and not request.user.is_staff:
            return Response({'error': 'Only the donor can mark as collected.'}, status=status.HTTP_403_FORBIDDEN)
        listing.status = 'collected'
        listing.collected_at = timezone.now()
        listing.save()
        return Response(DonationListingSerializer(listing).data)


class DirectoryServiceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DirectoryService.objects.all()
    serializer_class = DirectoryServiceSerializer


class OpportunityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Opportunity.objects.all()
    serializer_class = OpportunitySerializer


class CommunityEventViewSet(viewsets.ModelViewSet):
    queryset = CommunityEvent.objects.all().select_related('organizer')
    serializer_class = CommunityEventSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def rsvp(self, request, pk=None):
        event = self.get_object()
        if event.current_rsvps < event.max_participants:
            event.current_rsvps += 1
            event.save()
            return Response({'message': 'RSVP successful', 'current_rsvps': event.current_rsvps})
        return Response({'error': 'Event venue is at capacity'}, status=status.HTTP_400_BAD_REQUEST)


class AnalyticsViewSet(viewsets.ViewSet):
    """Aggregate statistics for Admin/Public Dashboard (FR-11)"""
    def list(self, request):
        total_reports = Complaint.objects.count()
        resolved_reports = Complaint.objects.filter(status=Complaint.Statuses.RESOLVED).count()
        in_progress = Complaint.objects.filter(status=Complaint.Statuses.IN_PROGRESS).count()
        pending = Complaint.objects.filter(status=Complaint.Statuses.SUBMITTED).count()

        by_category = Complaint.objects.values('category__name').annotate(count=Count('id'))
        by_area = Complaint.objects.values('area').annotate(count=Count('id')).order_by('-count')[:5]

        return Response({
            'total_reports': total_reports,
            'resolved_reports': resolved_reports,
            'in_progress': in_progress,
            'pending_review': pending,
            'resolution_rate_percent': round((resolved_reports / total_reports * 100), 1) if total_reports > 0 else 0,
            'by_category': by_category,
            'top_areas': by_area,
            'community_help_count': HelpRequest.objects.count(),
            'active_donations': DonationListing.objects.filter(status='available').count()
        })
