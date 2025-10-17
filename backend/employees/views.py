from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Employee, BenchRequest
from .serializers import (
    EmployeeSerializer,
    EmployeeCreateSerializer,
    EmployeeListSerializer,
    BenchRequestSerializer,
    BenchRequestCreateSerializer,
    BenchRequestResponseSerializer
)


class EmployeeViewSet(viewsets.ModelViewSet):
    """API endpoint for employee management"""
    
    queryset = Employee.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['first_name', 'last_name', 'job_title', 'skills']
    ordering_fields = ['created_at', 'bench_start_date', 'experience_years']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EmployeeCreateSerializer
        elif self.action == 'list':
            return EmployeeListSerializer
        return EmployeeSerializer
    
    def get_queryset(self):
        """Filter employees based on user role and query parameters"""
        # Return base queryset for schema generation
        if getattr(self, 'swagger_fake_view', False):
            return Employee.objects.none()

        user = self.request.user
        queryset = Employee.objects.select_related('company')

        # Filter by status if provided
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param)

        # Filter by company if user is not admin
        if user.role != 'admin':
            # Users can only see employees from their own companies
            user_companies = user.managed_companies.all()
            queryset = queryset.filter(company__in=user_companies)

        # Filter by experience level if provided
        experience_level = self.request.query_params.get('experience_level', None)
        if experience_level:
            queryset = queryset.filter(experience_level=experience_level)

        return queryset.filter(is_active=True)
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get all available bench employees"""
        employees = self.get_queryset().filter(status='available')
        serializer = self.get_serializer(employees, many=True)
        return Response(serializer.data)


class BenchRequestViewSet(viewsets.ModelViewSet):
    """API endpoint for bench request management"""
    
    queryset = BenchRequest.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return BenchRequestCreateSerializer
        elif self.action == 'respond':
            return BenchRequestResponseSerializer
        return BenchRequestSerializer
    
    def get_queryset(self):
        """Filter bench requests based on user's companies"""
        # Return base queryset for schema generation
        if getattr(self, 'swagger_fake_view', False):
            return BenchRequest.objects.none()

        user = self.request.user
        user_companies = user.managed_companies.all()

        # Get requests related to user's companies
        # Either as requesting company or as employee's company
        queryset = BenchRequest.objects.filter(
            requesting_company__in=user_companies
        ) | BenchRequest.objects.filter(
            employee__company__in=user_companies
        )

        return queryset.select_related('employee', 'requesting_company', 'employee__company')
    
    @action(detail=True, methods=['post'])
    def respond(self, request, pk=None):
        """Respond to a bench request (approve/reject)"""
        bench_request = self.get_object()
        serializer = BenchRequestResponseSerializer(data=request.data)
        
        if serializer.is_valid():
            # Check if user has permission to respond
            user_companies = request.user.managed_companies.all()
            if bench_request.employee.company not in user_companies:
                return Response(
                    {'error': 'You do not have permission to respond to this request.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Update request status
            bench_request.status = serializer.validated_data['status']
            bench_request.response = serializer.validated_data.get('response', '')
            bench_request.responded_at = timezone.now()
            bench_request.save()
            
            # Update employee status if approved
            if bench_request.status == 'approved':
                bench_request.employee.status = 'allocated'
                bench_request.employee.save()
            
            response_serializer = BenchRequestSerializer(bench_request)
            return Response(response_serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending requests"""
        pending_requests = self.get_queryset().filter(status='pending')
        serializer = self.get_serializer(pending_requests, many=True)
        return Response(serializer.data)
