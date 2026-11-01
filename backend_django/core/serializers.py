"""
Django REST Framework Serializers for CivicSaathi
"""
from rest_framework import serializers
from .models import (
    User, ComplaintCategory, Complaint, ComplaintUpdate, ComplaintAssignment,
    HelpRequest, HelpOffer, DonationListing, DirectoryService, Opportunity,
    CommunityEvent, ContentFlag, Notification
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone_number', 'neighborhood', 'avatar_url', 'is_verified', 'created_at']
        read_only_fields = ['id', 'created_at', 'is_verified']


class ComplaintCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplaintCategory
        fields = '__all__'


class ComplaintUpdateSerializer(serializers.ModelSerializer):
    actor_name = serializers.ReadOnlyField(source='actor.get_full_name')
    actor_role = serializers.ReadOnlyField(source='actor.role')

    class Meta:
        model = ComplaintUpdate
        fields = ['id', 'complaint', 'actor', 'actor_name', 'actor_role', 'previous_status', 'new_status', 'remarks', 'evidence_image', 'created_at']
        read_only_fields = ['id', 'created_at']


class ComplaintSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    department = serializers.ReadOnlyField(source='category.department')
    citizen_name = serializers.ReadOnlyField(source='citizen.get_full_name')
    updates = ComplaintUpdateSerializer(many=True, read_only=True)

    class Meta:
        model = Complaint
        fields = [
            'id', 'reference_no', 'citizen', 'citizen_name', 'category', 'category_name',
            'department', 'title', 'description', 'area', 'address_text', 'latitude',
            'longitude', 'image', 'urgency', 'status', 'rejection_reason',
            'citizen_feedback_rating', 'citizen_feedback_notes', 'is_flagged',
            'created_at', 'updated_at', 'updates'
        ]
        read_only_fields = ['id', 'reference_no', 'citizen', 'status', 'created_at', 'updated_at']


class HelpOfferSerializer(serializers.ModelSerializer):
    volunteer_name = serializers.ReadOnlyField(source='volunteer.get_full_name')

    class Meta:
        model = HelpOffer
        fields = '__all__'
        read_only_fields = ['id', 'volunteer', 'created_at']


class HelpRequestSerializer(serializers.ModelSerializer):
    requester_name = serializers.ReadOnlyField(source='requester.get_full_name')
    offers = HelpOfferSerializer(many=True, read_only=True)

    class Meta:
        model = HelpRequest
        fields = '__all__'
        read_only_fields = ['id', 'requester', 'created_at', 'updated_at']


class DonationListingSerializer(serializers.ModelSerializer):
    donor_name = serializers.ReadOnlyField(source='donor.get_full_name')
    reserved_by_name = serializers.ReadOnlyField(source='reserved_by.get_full_name')

    class Meta:
        model = DonationListing
        fields = '__all__'
        read_only_fields = ['id', 'donor', 'created_at']


class DirectoryServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DirectoryService
        fields = '__all__'


class OpportunitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Opportunity
        fields = '__all__'


class CommunityEventSerializer(serializers.ModelSerializer):
    organizer_name = serializers.ReadOnlyField(source='organizer.get_full_name')

    class Meta:
        model = CommunityEvent
        fields = '__all__'
        read_only_fields = ['id', 'organizer', 'current_rsvps', 'created_at']


class ContentFlagSerializer(serializers.ModelSerializer):
    reporter_name = serializers.ReadOnlyField(source='reporter.get_full_name')

    class Meta:
        model = ContentFlag
        fields = '__all__'
        read_only_fields = ['id', 'reporter', 'created_at']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['id', 'created_at']
