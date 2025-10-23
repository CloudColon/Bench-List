from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    CompanyUserRegistrationView,
    AdminRegistrationView,
    AdminRequestViewSet
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'admin-requests', AdminRequestViewSet, basename='admin-request')

urlpatterns = [
    # Registration endpoints
    path('register/company-user/', CompanyUserRegistrationView.as_view(), name='company-user-registration'),
    path('register/admin/', AdminRegistrationView.as_view(), name='admin-registration'),

    # Authentication endpoints
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
] + router.urls
