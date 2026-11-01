"""
CivicSaathi Core Models
Django ORM implementation for Civic Issue Reporting, Community Assistance,
Donations/Reuse, Local Services Directory, Opportunities, and Moderation.
Compatible with Python 3.10+ and Django 4.2+ / 5.0+ using MySQL backend.
"""

import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class User(AbstractUser):
    class Roles(models.TextChoices):
        CITIZEN = 'citizen', 'Citizen'
        VOLUNTEER = 'volunteer', 'Volunteer / Service Provider'
        MODERATOR = 'moderator', 'Community Moderator'
        ADMIN = 'admin', 'System Administrator'

    role = models.CharField(max_length=20, choices=Roles.choices, default=Roles.CITIZEN)
    phone_number = models.CharField(max_length=30, blank=True, null=True)
    neighborhood = models.CharField(max_length=120, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    avatar_url = models.URLField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_moderator_or_admin(self):
        return self.role in [self.Roles.MODERATOR, self.Roles.ADMIN] or self.is_superuser


class ComplaintCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    department = models.CharField(max_length=100)
    sla_days = models.PositiveIntegerField(default=5)
    is_active = models.BooleanField(default=True)
    icon = models.CharField(max_length=50, default='alert-circle')

    class Meta:
        verbose_name_plural = 'Complaint Categories'

    def __str__(self):
        return f"{self.name} ({self.department})"


class Complaint(models.Model):
    class Statuses(models.TextChoices):
        SUBMITTED = 'submitted', 'Submitted'
        VERIFIED = 'verified', 'Verified by Moderator'
        ASSIGNED = 'assigned', 'Assigned to Municipal Team'
        IN_PROGRESS = 'in_progress', 'Work In Progress'
        RESOLVED = 'resolved', 'Resolved'
        REJECTED = 'rejected', 'Rejected'
        REOPENED = 'reopened', 'Reopened by Citizen'

    class UrgencyLevels(models.TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
        CRITICAL = 'critical', 'Critical Safety Hazard'

    reference_no = models.CharField(max_length=50, unique=True, editable=False)
    citizen = models.ForeignKey(User, on_delete=models.CASCADE, related_name='complaints')
    category = models.ForeignKey(ComplaintCategory, on_delete=models.PROTECT, related_name='complaints')
    title = models.CharField(max_length=255)
    description = models.TextField()
    area = models.CharField(max_length=150)
    address_text = models.CharField(max_length=255, blank=True, null=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    image = models.ImageField(upload_to='complaints/%Y/%m/', null=True, blank=True)
    urgency = models.CharField(max_length=20, choices=UrgencyLevels.choices, default=UrgencyLevels.MEDIUM)
    status = models.CharField(max_length=20, choices=Statuses.choices, default=Statuses.SUBMITTED)
    rejection_reason = models.TextField(blank=True, null=True)
    citizen_feedback_rating = models.PositiveSmallIntegerField(blank=True, null=True)
    citizen_feedback_notes = models.TextField(blank=True, null=True)
    is_flagged = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.reference_no:
            year = timezone.now().year
            rand_code = uuid.uuid4().hex[:6].upper()
            self.reference_no = f"CS-{year}-{rand_code}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.reference_no}] {self.title} ({self.status})"


class ComplaintUpdate(models.Model):
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='updates')
    actor = models.ForeignKey(User, on_delete=models.PROTECT, related_name='complaint_actions')
    previous_status = models.CharField(max_length=30, blank=True, null=True)
    new_status = models.CharField(max_length=30)
    remarks = models.TextField()
    evidence_image = models.ImageField(upload_to='evidence/%Y/%m/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.complaint.reference_no} updated to {self.new_status} by {self.actor.username}"


class ComplaintAssignment(models.Model):
    complaint = models.OneToOneField(Complaint, on_delete=models.CASCADE, related_name='assignment')
    assigned_to = models.ForeignKey(User, on_delete=models.PROTECT, related_name='assigned_tasks')
    assigned_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='assignments_made')
    department_team = models.CharField(max_length=150)
    target_resolution_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class HelpRequest(models.Model):
    class HelpCategories(models.TextChoices):
        SENIOR_CARE = 'senior_care', 'Elderly & Senior Assistance'
        ERRANDS = 'errands', 'Grocery & Pharmacy Errands'
        TECH_SUPPORT = 'tech_support', 'Digital Literacy & Tech Help'
        TUTORING = 'tutoring', 'Student Tutoring & Mentorship'
        EMERGENCY_FOOD = 'emergency_food', 'Community Food Ration'
        MOBILITY = 'mobility', 'Wheelchair / Accessibility Support'
        OTHER = 'other', 'General Non-Emergency Assistance'

    class Urgency(models.TextChoices):
        STANDARD = 'standard', 'Standard Request (Within 48h)'
        IMPORTANT = 'important', 'Important (Within 24h)'
        TIME_SENSITIVE = 'time_sensitive', 'Time-Sensitive'

    class Statuses(models.TextChoices):
        OPEN = 'open', 'Open for Volunteers'
        ACCEPTED = 'accepted', 'Volunteer Matched'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'

    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='help_requests')
    category = models.CharField(max_length=30, choices=HelpCategories.choices)
    title = models.CharField(max_length=255)
    description = models.TextField()
    area = models.CharField(max_length=150)
    urgency = models.CharField(max_length=20, choices=Urgency.choices, default=Urgency.STANDARD)
    safety_agreement = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=Statuses.choices, default=Statuses.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Help: {self.title} ({self.status})"


class HelpOffer(models.Model):
    class Statuses(models.TextChoices):
        OFFERED = 'offered', 'Offer Sent'
        ACCEPTED = 'accepted', 'Accepted by Requester'
        DECLINED = 'declined', 'Declined'
        COMPLETED = 'completed', 'Assistance Completed'

    request = models.ForeignKey(HelpRequest, on_delete=models.CASCADE, related_name='offers')
    volunteer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='help_offers')
    message = models.TextField()
    status = models.CharField(max_length=20, choices=Statuses.choices, default=Statuses.OFFERED)
    volunteer_notes = models.TextField(blank=True)
    completion_feedback = models.TextField(blank=True)
    rating = models.PositiveSmallIntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


class DonationListing(models.Model):
    class ItemTypes(models.TextChoices):
        BOOKS = 'books', 'Books & Educational Material'
        CLOTHES = 'clothes', 'Clothing & Footwear'
        FURNITURE = 'furniture', 'Furniture & Study Desks'
        ELECTRONICS = 'electronics', 'Computers & Working Electronics'
        KITCHENWARE = 'kitchenware', 'Kitchenware & Utensils'
        TOYS = 'toys', 'Kids Toys & Games'
        MEDICAL_AID = 'medical_aid', 'Crutches, Walkers & Assistive Gear'
        OTHER = 'other', 'Other Useful Reusable Items'

    class Condition(models.TextChoices):
        BRAND_NEW = 'brand_new', 'Brand New'
        LIKE_NEW = 'like_new', 'Like New'
        GOOD = 'good', 'Good Working Condition'
        FAIR = 'fair', 'Fair / Functional'

    class Statuses(models.TextChoices):
        AVAILABLE = 'available', 'Available for Pickup'
        RESERVED = 'reserved', 'Reserved for Requester'
        COLLECTED = 'collected', 'Collected / Rehomed'
        WITHDRAWN = 'withdrawn', 'Withdrawn'

    donor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='donations')
    item_type = models.CharField(max_length=30, choices=ItemTypes.choices)
    title = models.CharField(max_length=255)
    description = models.TextField()
    condition = models.CharField(max_length=20, choices=Condition.choices)
    area = models.CharField(max_length=150)
    image = models.ImageField(upload_to='donations/%Y/%m/', null=True, blank=True)
    collection_method = models.CharField(max_length=100, default='Community Safe Spot / Center')
    status = models.CharField(max_length=20, choices=Statuses.choices, default=Statuses.AVAILABLE)
    reserved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='claimed_items')
    collected_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class DirectoryService(models.Model):
    class Categories(models.TextChoices):
        PRIMARY_CLINIC = 'primary_clinic', 'Primary Health Clinic'
        BLOOD_BANK = 'blood_bank', 'Licensed Blood Bank Directory'
        CIVIC_CENTER = 'civic_center', 'Municipal Citizen Center'
        SANITATION = 'sanitation', 'Sanitation & Waste Depot'
        PUBLIC_LIBRARY = 'public_library', 'Public Library / Community Room'
        WOMEN_SAFETY = 'women_safety', 'Women Helpline & Safe Shelter'
        HELPLINE = 'helpline', 'Official Helpline & Utility Desk'

    class VerificationState(models.TextChoices):
        VERIFIED = 'verified', 'Official / Verified'
        UNDER_REVIEW = 'under_review', 'Verification in Progress'
        UNVERIFIED = 'unverified', 'Community Submitted'

    name = models.CharField(max_length=255)
    category = models.CharField(max_length=30, choices=Categories.choices)
    description = models.TextField()
    area = models.CharField(max_length=150)
    address = models.CharField(max_length=255)
    phone = models.CharField(max_length=50)
    operating_hours = models.CharField(max_length=100)
    source = models.CharField(max_length=150, help_text="Official Department or Public Portal")
    external_link = models.URLField(max_length=500, blank=True, null=True)
    verification_status = models.CharField(max_length=20, choices=VerificationState.choices, default=VerificationState.VERIFIED)
    last_verified_date = models.DateField(default=timezone.now)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)


class Opportunity(models.Model):
    class Types(models.TextChoices):
        SCHOLARSHIP = 'scholarship', 'Government / NGO Scholarship'
        INTERNSHIP = 'internship', 'Civic / Tech Internship'
        FELLOWSHIP = 'fellowship', 'Community Leadership Fellowship'
        COURSE = 'course', 'Free Skill Development Course'
        VOLUNTEER = 'volunteer', 'Youth Civic Volunteering'
        WORKSHOP = 'workshop', 'Civic Workshop'

    title = models.CharField(max_length=255)
    type = models.CharField(max_length=30, choices=Types.choices)
    organization = models.CharField(max_length=200)
    eligibility_notes = models.TextField()
    description = models.TextField()
    application_deadline = models.DateField(null=True, blank=True)
    official_link = models.URLField(max_length=500)
    is_verified = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)


class CommunityEvent(models.Model):
    class Categories(models.TextChoices):
        CLEANLINESS = 'cleanliness_drive', 'Neighborhood Cleanliness Drive'
        TREE_PLANTATION = 'tree_plantation', 'Urban Tree Plantation'
        BLOOD_DRIVE = 'blood_donation_camp', 'Licensed Blood Donation Camp'
        AWARENESS = 'awareness_workshop', 'Civic Rights & Waste Segregation'
        RECYCLING = 'recycling_meet', 'E-Waste & Plastic Swap Meet'

    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organized_events')
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=30, choices=Categories.choices)
    description = models.TextField()
    venue = models.CharField(max_length=255)
    area = models.CharField(max_length=150)
    event_date = models.DateTimeField()
    max_participants = models.PositiveIntegerField(default=100)
    current_rsvps = models.PositiveIntegerField(default=0)
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)


class ContentFlag(models.Model):
    class FlagReasons(models.TextChoices):
        SPAM = 'spam', 'Spam / Commercial Promotion'
        INACCURATE = 'inaccurate', 'Inaccurate / Misleading'
        ABUSIVE = 'abusive', 'Harassment or Inappropriate'
        DUPLICATE = 'duplicate', 'Duplicate Submission'
        OUTDATED = 'outdated', 'Information is Outdated'

    class Statuses(models.TextChoices):
        PENDING = 'pending', 'Pending Moderator Review'
        REVIEWED = 'reviewed', 'Reviewed - No Action'
        DISMISSED = 'dismissed', 'Dismissed'
        ACTION_TAKEN = 'action_taken', 'Content Removed / Corrected'

    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reported_flags')
    target_type = models.CharField(max_length=30)
    target_id = models.PositiveIntegerField()
    reason = models.CharField(max_length=20, choices=FlagReasons.choices)
    details = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Statuses.choices, default=Statuses.PENDING)
    moderator_notes = models.TextField(blank=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_flags')
    created_at = models.DateTimeField(auto_now_add=True)


class Notification(models.Model):
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    event_type = models.CharField(max_length=50)
    title = models.CharField(max_length=200)
    message = models.TextField()
    target_link = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
