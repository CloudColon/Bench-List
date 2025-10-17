from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import (
    UserSerializer, 
    UserRegistrationSerializer, 
    ChangePasswordSerializer
)

User = get_user_model()


class UserRegistrationView(generics.CreateAPIView):
    """API endpoint for user registration"""
    
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserRegistrationSerializer


class UserViewSet(viewsets.ModelViewSet):
    """API endpoint for user management"""
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter users based on role"""
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
