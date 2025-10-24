from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, BenchRequestViewSet, ResourceListingViewSet, ResourceRequestViewSet

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'requests', BenchRequestViewSet, basename='bench-request')
router.register(r'resource-listings', ResourceListingViewSet, basename='resource-listing')
router.register(r'resource-requests', ResourceRequestViewSet, basename='resource-request')

urlpatterns = router.urls
