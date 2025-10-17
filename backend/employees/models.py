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
