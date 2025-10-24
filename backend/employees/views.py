from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Employee, BenchRequest, ResourceListing, ResourceRequest
from .serializers import (
    EmployeeSerializer,
    EmployeeCreateSerializer,
    EmployeeListSerializer,
    BenchRequestSerializer,
    BenchRequestCreateSerializer,
    BenchRequestResponseSerializer,
    ResourceListingSerializer,
    ResourceListingListSerializer,
    ResourceListingCreateSerializer,
    ResourceRequestSerializer,
    ResourceRequestCreateSerializer,
    ResourceRequestResponseSerializer
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


class ResourceListingViewSet(viewsets.ModelViewSet):
    """API endpoint for resource listing management"""

    queryset = ResourceListing.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'skills_summary', 'company__name']
    ordering_fields = ['created_at', 'start_date', 'total_resources']

    def get_serializer_class(self):
        if self.action == 'create':
            return ResourceListingCreateSerializer
        elif self.action == 'list':
            return ResourceListingListSerializer
        return ResourceListingSerializer

    def get_queryset(self):
        """
        Filter resource listings based on query parameters.

        VISIBILITY RULES:
        - All authenticated users can see ALL active listings (marketplace behavior)
        - This allows companies to discover and request resources from other companies
        - Users can optionally exclude their own company's listings
        """
        # Return base queryset for schema generation
        if getattr(self, 'swagger_fake_view', False):
            return ResourceListing.objects.none()

        queryset = ResourceListing.objects.select_related('company').prefetch_related('employees')

        # Filter by status if provided
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param)

        # Filter by company if provided
        company_id = self.request.query_params.get('company', None)
        if company_id:
            queryset = queryset.filter(company_id=company_id)

        # Option to exclude own company's listings (useful for browsing other companies)
        exclude_own = self.request.query_params.get('exclude_own', 'false').lower() == 'true'
        if exclude_own:
            user_companies = self.request.user.managed_companies.all()
            queryset = queryset.exclude(company__in=user_companies)

        # Only show active listings by default
        show_all = self.request.query_params.get('show_all', 'false').lower() == 'true'
        if not show_all:
            queryset = queryset.filter(is_active=True, status='active')

        return queryset

    @action(detail=False, methods=['get'])
    def my_listings(self, request):
        """Get resource listings for user's companies"""
        user_companies = request.user.managed_companies.all()
        listings = self.get_queryset().filter(company__in=user_companies)
        serializer = self.get_serializer(listings, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update the status of a resource listing"""
        listing = self.get_object()

        # Check if user has permission to update
        user_companies = request.user.managed_companies.all()
        if listing.company not in user_companies:
            return Response(
                {'error': 'You do not have permission to update this listing.'},
                status=status.HTTP_403_FORBIDDEN
            )

        new_status = request.data.get('status')
        if new_status not in ['active', 'inactive', 'closed']:
            return Response(
                {'error': 'Invalid status. Must be active, inactive, or closed.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        listing.status = new_status
        listing.save()

        serializer = self.get_serializer(listing)
        return Response(serializer.data)


class ResourceRequestViewSet(viewsets.ModelViewSet):
    """API endpoint for resource request management"""

    queryset = ResourceRequest.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return ResourceRequestCreateSerializer
        elif self.action == 'respond':
            return ResourceRequestResponseSerializer
        return ResourceRequestSerializer

    def get_queryset(self):
        """Filter resource requests based on user's companies"""
        # Return base queryset for schema generation
        if getattr(self, 'swagger_fake_view', False):
            return ResourceRequest.objects.none()

        user = self.request.user
        user_companies = user.managed_companies.all()

        # Get requests related to user's companies
        # Either as requesting company or as resource owner company
        queryset = ResourceRequest.objects.filter(
            requesting_company__in=user_companies
        ) | ResourceRequest.objects.filter(
            resource_listing__company__in=user_companies
        )

        return queryset.select_related(
            'resource_listing',
            'resource_listing__company',
            'requesting_company'
        )

    @action(detail=True, methods=['post'])
    def respond(self, request, pk=None):
        """Respond to a resource request (approve/reject)"""
        resource_request = self.get_object()
        serializer = ResourceRequestResponseSerializer(data=request.data)

        if serializer.is_valid():
            # Check if user has permission to respond
            user_companies = request.user.managed_companies.all()
            if resource_request.resource_listing.company not in user_companies:
                return Response(
                    {'error': 'You do not have permission to respond to this request.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Update request status
            resource_request.status = serializer.validated_data['status']
            resource_request.response = serializer.validated_data.get('response', '')
            resource_request.responded_at = timezone.now()
            resource_request.save()

            response_serializer = ResourceRequestSerializer(resource_request)
            return Response(response_serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending resource requests"""
        pending_requests = self.get_queryset().filter(status='pending')
        serializer = self.get_serializer(pending_requests, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def sent(self, request):
        """Get resource requests sent by user's companies"""
        user_companies = request.user.managed_companies.all()
        sent_requests = self.get_queryset().filter(requesting_company__in=user_companies)
        serializer = self.get_serializer(sent_requests, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def received(self, request):
        """Get resource requests received by user's companies"""
        user_companies = request.user.managed_companies.all()
        received_requests = self.get_queryset().filter(
            resource_listing__company__in=user_companies
        )
        serializer = self.get_serializer(received_requests, many=True)
        return Response(serializer.data)
