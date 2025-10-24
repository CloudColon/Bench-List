from django.db import models
from companies.models import Company


class Employee(models.Model):
    """Employee model for bench employees"""
    
    STATUS_CHOICES = (
        ('available', 'Available'),
        ('requested', 'Requested'),
        ('allocated', 'Allocated'),
    )
    
    EXPERIENCE_LEVEL_CHOICES = (
        ('junior', 'Junior'),
        ('mid', 'Mid-level'),
        ('senior', 'Senior'),
        ('lead', 'Lead'),
    )
    
    # Personal Information
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    
    # Professional Information
    job_title = models.CharField(max_length=255)
    experience_years = models.PositiveIntegerField(help_text="Total years of experience")
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_LEVEL_CHOICES, default='mid')
    skills = models.TextField(help_text="Comma-separated skills")
    resume = models.FileField(upload_to='resumes/', blank=True, null=True)
    
    # Employment Details
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='employees')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    bench_start_date = models.DateField(help_text="Date when employee became available on bench")
    expected_availability_end = models.DateField(blank=True, null=True)
    
    # Additional Information
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Employee'
        verbose_name_plural = 'Employees'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.job_title}"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"


class BenchRequest(models.Model):
    """Request model for companies to request bench employees"""

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    )

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='requests')
    requesting_company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='employee_requests'
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    message = models.TextField(blank=True, help_text="Message from requesting company")
    response = models.TextField(blank=True, help_text="Response from employee's company")

    requested_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        verbose_name = 'Bench Request'
        verbose_name_plural = 'Bench Requests'
        ordering = ['-requested_at']
        unique_together = ['employee', 'requesting_company', 'status']

    def __str__(self):
        return f"Request for {self.employee.get_full_name()} by {self.requesting_company.name}"


class ResourceListing(models.Model):
    """Model for companies to post batch bench resources"""

    STATUS_CHOICES = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('closed', 'Closed'),
    )

    # Company posting the resources
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='resource_listings'
    )

    # Selected employees for this listing
    employees = models.ManyToManyField(
        Employee,
        related_name='resource_listings',
        help_text="Employees included in this resource listing"
    )

    # Listing details
    title = models.CharField(
        max_length=255,
        help_text="Title for the resource listing"
    )
    description = models.TextField(
        blank=True,
        help_text="Description of the resources and requirements"
    )

    # Availability information
    start_date = models.DateField(
        help_text="Date from which resources are available"
    )
    expected_end_date = models.DateField(
        blank=True,
        null=True,
        help_text="Expected end date of availability"
    )

    # Aggregated information (computed from employees)
    total_resources = models.PositiveIntegerField(
        default=0,
        help_text="Total number of resources in this listing"
    )
    skills_summary = models.TextField(
        blank=True,
        help_text="Comma-separated summary of available skills"
    )
    locations = models.TextField(
        blank=True,
        help_text="Available locations (extensible field for future use)"
    )

    # Status and metadata
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Extensible JSON field for future parameters
    additional_params = models.JSONField(
        default=dict,
        blank=True,
        help_text="Extensible field for additional parameters"
    )

    class Meta:
        verbose_name = 'Resource Listing'
        verbose_name_plural = 'Resource Listings'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['company', 'status']),
            models.Index(fields=['start_date']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"{self.title} - {self.company.name} ({self.total_resources} resources)"

    def update_computed_fields(self):
        """Update computed fields based on selected employees"""
        self.total_resources = self.employees.count()

        # Aggregate skills
        skills_set = set()
        for emp in self.employees.all():
            if emp.skills:
                skills_list = [s.strip() for s in emp.skills.split(',')]
                skills_set.update(skills_list)
        self.skills_summary = ', '.join(sorted(skills_set))

        self.save()


class ResourceRequest(models.Model):
    """Request model for companies to request resource listings"""

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    )

    # The resource listing being requested
    resource_listing = models.ForeignKey(
        ResourceListing,
        on_delete=models.CASCADE,
        related_name='requests'
    )

    # Company making the request
    requesting_company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='resource_requests'
    )

    # Request details
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    message = models.TextField(
        blank=True,
        help_text="Message from requesting company"
    )
    response = models.TextField(
        blank=True,
        help_text="Response from resource owner company"
    )

    # Timestamps
    requested_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(blank=True, null=True)

    # Extensible JSON field for future parameters
    additional_params = models.JSONField(
        default=dict,
        blank=True,
        help_text="Extensible field for additional request parameters"
    )

    class Meta:
        verbose_name = 'Resource Request'
        verbose_name_plural = 'Resource Requests'
        ordering = ['-requested_at']
        unique_together = ['resource_listing', 'requesting_company', 'status']
        indexes = [
            models.Index(fields=['requesting_company', 'status']),
            models.Index(fields=['resource_listing', 'status']),
        ]

    def __str__(self):
        return f"Request for {self.resource_listing.title} by {self.requesting_company.name}"
