from django.contrib import admin
from .models import Company


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'admin_user', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'email', 'admin_user__email')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Company Information', {
            'fields': ('name', 'email', 'phone', 'website', 'description')
        }),
        ('Address', {
            'fields': ('address',)
        }),
        ('Management', {
            'fields': ('admin_user', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
