from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, AdminRequest


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom admin for User model"""

    list_display = ('email', 'first_name', 'last_name', 'role', 'is_active', 'is_staff')
    list_filter = ('is_active', 'is_staff', 'role', 'date_joined')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('-date_joined',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('date_joined', 'last_login')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2', 'role', 'is_active', 'is_staff'),
        }),
    )

    readonly_fields = ('date_joined', 'last_login')


@admin.register(AdminRequest)
class AdminRequestAdmin(admin.ModelAdmin):
    """Admin for AdminRequest model"""

    list_display = ('user', 'company', 'status', 'requested_at', 'responded_at')
    list_filter = ('status', 'requested_at', 'responded_at')
    search_fields = ('user__email', 'company__name', 'message')
    ordering = ('-requested_at',)
    readonly_fields = ('requested_at', 'responded_at')

    fieldsets = (
        (None, {'fields': ('user', 'company', 'status')}),
        ('Messages', {'fields': ('message', 'response_message')}),
        ('Timestamps', {'fields': ('requested_at', 'responded_at')}),
    )
