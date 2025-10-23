from django.db import models
from django.conf import settings


class Company(models.Model):
    """Company model for organizations using the system"""

    name = models.CharField(max_length=255, unique=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    website = models.URLField(blank=True)
    description = models.TextField(blank=True)

    # Link to user who manages this company (Company User role)
    admin_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='managed_companies'
    )

    # Admins who have been approved to access this company
    approved_admins = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='accessible_companies',
        blank=True,
        help_text='Admin users who have been approved to access this company'
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Company'
        verbose_name_plural = 'Companies'
        ordering = ['-created_at']

    def __str__(self):
        return self.name
