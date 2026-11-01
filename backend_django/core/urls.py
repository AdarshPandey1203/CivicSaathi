"""
CivicSaathi API URL Configuration
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ComplaintViewSet, HelpRequestViewSet, DonationListingViewSet,
    DirectoryServiceViewSet, OpportunityViewSet, CommunityEventViewSet,
    AnalyticsViewSet
)

router = DefaultRouter()
router.register(r'complaints', ComplaintViewSet)
router.register(r'help-requests', HelpRequestViewSet)
router.register(r'donations', DonationListingViewSet)
router.register(r'directory-services', DirectoryServiceViewSet)
router.register(r'opportunities', OpportunityViewSet)
router.register(r'events', CommunityEventViewSet)
router.register(r'analytics', AnalyticsViewSet, basename='analytics')

urlpatterns = [
    path('', include(router.urls)),
]
