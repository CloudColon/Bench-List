from django.contrib import admin
from .models import Employee, BenchRequest


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('get_full_name', 'email', 'job_title', 'company', 'status', 'experience_level', 'is_active')
    list_filter = ('status', 'experience_level', 'company', 'is_active', 'created_at')
    search_fields = ('first_name', 'last_name', 'email', 'job_title', 'skills')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('first_name', 'last_name', 'email', 'phone')
        }),
        ('Professional Information', {
            'fields': ('job_title', 'experience_years', 'experience_level', 'skills', 'resume')
        }),
        ('Employment Details', {
            'fields': ('company', 'status', 'bench_start_date', 'expected_availability_end')
        }),
        ('Additional Information', {
            'fields': ('notes', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(BenchRequest)
class BenchRequestAdmin(admin.ModelAdmin):
    list_display = ('employee', 'requesting_company', 'status', 'requested_at', 'responded_at')
    list_filter = ('status', 'requested_at', 'responded_at')
    search_fields = ('employee__first_name', 'employee__last_name', 'requesting_company__name')
    readonly_fields = ('requested_at', 'responded_at')
    
    fieldsets = (
        ('Request Details', {
            'fields': ('employee', 'requesting_company', 'status')
        }),
        ('Messages', {
            'fields': ('message', 'response')
        }),
        ('Timestamps', {
            'fields': ('requested_at', 'responded_at')
        }),
    )
