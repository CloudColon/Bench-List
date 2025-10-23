from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, AdminRequest
from .serializers import (
    UserSerializer,
    CompanyUserRegistrationSerializer,
    AdminRegistrationSerializer,
    AdminRequestSerializer,
    AdminRequestResponseSerializer,
    ChangePasswordSerializer
)

User = get_user_model()


class CompanyUserRegistrationView(generics.CreateAPIView):
    """API endpoint for Company User registration with company creation"""

    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = CompanyUserRegistrationSerializer


class AdminRegistrationView(generics.CreateAPIView):
    """API endpoint for Admin registration with company selection"""

    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = AdminRegistrationSerializer


class UserViewSet(viewsets.ModelViewSet):
    """API endpoint for user management"""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter users based on role"""
        # Return base queryset for schema generation
        if getattr(self, 'swagger_fake_view', False):
            return User.objects.none()

        user = self.request.user
        if user.role == 'admin':
            return User.objects.all()
        return User.objects.filter(id=user.id)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user details"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change password for current user"""
        serializer = ChangePasswordSerializer(data=request.data)

        if serializer.is_valid():
            user = request.user

            # Check old password
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {'old_password': ['Wrong password.']},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Set new password
            user.set_password(serializer.validated_data['new_password'])
            user.save()

            return Response(
                {'message': 'Password updated successfully'},
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminRequestViewSet(viewsets.ModelViewSet):
    """API endpoint for admin access request management"""

    queryset = AdminRequest.objects.all()
    serializer_class = AdminRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter admin requests based on user role"""
        # Return base queryset for schema generation
        if getattr(self, 'swagger_fake_view', False):
            return AdminRequest.objects.none()

        user = self.request.user

        if user.role == 'company_user':
            # Company users see requests for their companies
            return AdminRequest.objects.filter(
                company__admin_user=user
            ).select_related('user', 'company')
        else:
            # Admins see their own requests
            return AdminRequest.objects.filter(
                user=user
            ).select_related('user', 'company')

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending admin requests"""
        pending_requests = self.get_queryset().filter(status='pending')
        serializer = self.get_serializer(pending_requests, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def respond(self, request, pk=None):
        """Respond to an admin access request (approve/reject)"""
        admin_request = self.get_object()
        serializer = AdminRequestResponseSerializer(data=request.data)

        if serializer.is_valid():
            # Check if user is the company owner
            if admin_request.company.admin_user != request.user:
                return Response(
                    {'error': 'You do not have permission to respond to this request.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Check if already responded
            if admin_request.status != 'pending':
                return Response(
                    {'error': 'This request has already been responded to.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Update request status
            admin_request.status = serializer.validated_data['status']
            admin_request.response_message = serializer.validated_data.get('response_message', '')
            admin_request.responded_at = timezone.now()
            admin_request.save()

            # If approved, add user to company's approved_admins and activate user
            if admin_request.status == 'approved':
                admin_request.company.approved_admins.add(admin_request.user)
                admin_request.user.is_active = True
                admin_request.user.save()

            response_serializer = AdminRequestSerializer(admin_request)
            return Response(response_serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
