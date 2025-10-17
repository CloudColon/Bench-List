from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Company
from .serializers import CompanySerializer, CompanyCreateSerializer


class CompanyViewSet(viewsets.ModelViewSet):
    """API endpoint for company management"""
    
    queryset = Company.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CompanyCreateSerializer
        return CompanySerializer
    
    def get_queryset(self):
        """Filter companies based on user role"""
        # Return base queryset for schema generation
        if getattr(self, 'swagger_fake_view', False):
            return Company.objects.none()

        user = self.request.user

        # Admins can see all companies
        if user.role == 'admin':
            return Company.objects.all()

        # Regular users can only see their own companies
        return Company.objects.filter(admin_user=user)
    
    def perform_create(self, serializer):
        """Set the admin_user to the current user"""
        serializer.save(admin_user=self.request.user)
