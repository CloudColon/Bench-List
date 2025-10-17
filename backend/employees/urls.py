from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, BenchRequestViewSet

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'requests', BenchRequestViewSet, basename='bench-request')

urlpatterns = router.urls
