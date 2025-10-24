from rest_framework import serializers
from .models import Employee, BenchRequest, ResourceListing, ResourceRequest
from companies.serializers import CompanySerializer


class EmployeeSerializer(serializers.ModelSerializer):
    """Serializer for Employee model"""
    
    company_name = serializers.CharField(source='company.name', read_only=True)
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = Employee
        fields = (
            'id', 'first_name', 'last_name', 'full_name', 'email', 'phone',
            'job_title', 'experience_years', 'experience_level', 'skills',
            'resume', 'company', 'company_name', 'status', 'bench_start_date',
            'expected_availability_end', 'notes', 'is_active',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class EmployeeCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new employee"""
    
    class Meta:
        model = Employee
        fields = (
            'first_name', 'last_name', 'email', 'phone', 'job_title',
            'experience_years', 'experience_level', 'skills', 'resume',
            'company', 'status', 'bench_start_date', 'expected_availability_end',
            'notes'
        )


class EmployeeListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for employee listing"""
    
    company_name = serializers.CharField(source='company.name', read_only=True)
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = Employee
        fields = (
            'id', 'full_name', 'email', 'job_title', 'experience_years',
            'experience_level', 'company_name', 'status', 'bench_start_date'
        )


class BenchRequestSerializer(serializers.ModelSerializer):
    """Serializer for BenchRequest model"""
    
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    employee_job_title = serializers.CharField(source='employee.job_title', read_only=True)
    requesting_company_name = serializers.CharField(source='requesting_company.name', read_only=True)
    employee_company_name = serializers.CharField(source='employee.company.name', read_only=True)
    
    class Meta:
        model = BenchRequest
        fields = (
            'id', 'employee', 'employee_name', 'employee_job_title',
            'employee_company_name', 'requesting_company', 'requesting_company_name',
            'status', 'message', 'response', 'requested_at', 'responded_at'
        )
        read_only_fields = ('id', 'requested_at', 'responded_at')


class BenchRequestCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a bench request"""
    
    class Meta:
        model = BenchRequest
        fields = ('employee', 'requesting_company', 'message')
    
    def validate(self, attrs):
        # Check if employee is available
        employee = attrs.get('employee')
        if employee.status != 'available':
            raise serializers.ValidationError("Employee is not available for requests.")
        
        # Check if a pending request already exists
        requesting_company = attrs.get('requesting_company')
        existing_request = BenchRequest.objects.filter(
            employee=employee,
            requesting_company=requesting_company,
            status='pending'
        ).exists()
        
        if existing_request:
            raise serializers.ValidationError(
                "A pending request already exists for this employee from your company."
            )
        
        return attrs


class BenchRequestResponseSerializer(serializers.Serializer):
    """Serializer for responding to a bench request"""

    status = serializers.ChoiceField(choices=['approved', 'rejected'])
    response = serializers.CharField(required=False, allow_blank=True)


class ResourceListingSerializer(serializers.ModelSerializer):
    """Serializer for ResourceListing model"""

    company_name = serializers.CharField(source='company.name', read_only=True)
    company_email = serializers.EmailField(source='company.email', read_only=True)
    company_phone = serializers.CharField(source='company.phone', read_only=True)
    company_address = serializers.CharField(source='company.address', read_only=True)
    employee_details = EmployeeListSerializer(source='employees', many=True, read_only=True)

    class Meta:
        model = ResourceListing
        fields = (
            'id', 'company', 'company_name', 'company_email', 'company_phone',
            'company_address', 'employees', 'employee_details', 'title', 'description',
            'start_date', 'expected_end_date', 'total_resources', 'skills_summary',
            'locations', 'status', 'is_active', 'created_at', 'updated_at',
            'additional_params'
        )
        read_only_fields = ('id', 'total_resources', 'skills_summary', 'created_at', 'updated_at')


class ResourceListingListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for resource listing - for /listings page"""

    company_name = serializers.CharField(source='company.name', read_only=True)
    company_email = serializers.EmailField(source='company.email', read_only=True)
    company_phone = serializers.CharField(source='company.phone', read_only=True)
    company_address = serializers.CharField(source='company.address', read_only=True)

    class Meta:
        model = ResourceListing
        fields = (
            'id', 'company', 'company_name', 'company_email', 'company_phone',
            'company_address', 'title', 'description', 'start_date',
            'expected_end_date', 'total_resources', 'skills_summary',
            'locations', 'status', 'created_at'
        )


class ResourceListingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a resource listing"""

    class Meta:
        model = ResourceListing
        fields = (
            'company', 'employees', 'title', 'description', 'start_date',
            'expected_end_date', 'locations', 'status', 'additional_params'
        )

    def validate(self, attrs):
        # Ensure at least one employee is selected
        employees = attrs.get('employees', [])
        if not employees:
            raise serializers.ValidationError("At least one employee must be selected.")

        # Ensure all employees belong to the same company
        company = attrs.get('company')
        for employee in employees:
            if employee.company != company:
                raise serializers.ValidationError(
                    f"Employee {employee.get_full_name()} does not belong to the selected company."
                )

            # Check if employee is available
            if employee.status != 'available':
                raise serializers.ValidationError(
                    f"Employee {employee.get_full_name()} is not available (status: {employee.status})."
                )

        return attrs

    def create(self, validated_data):
        employees = validated_data.pop('employees')
        resource_listing = ResourceListing.objects.create(**validated_data)
        resource_listing.employees.set(employees)
        resource_listing.update_computed_fields()
        return resource_listing


class ResourceRequestSerializer(serializers.ModelSerializer):
    """Serializer for ResourceRequest model"""

    resource_listing_title = serializers.CharField(source='resource_listing.title', read_only=True)
    resource_company_name = serializers.CharField(source='resource_listing.company.name', read_only=True)
    requesting_company_name = serializers.CharField(source='requesting_company.name', read_only=True)
    total_resources = serializers.IntegerField(source='resource_listing.total_resources', read_only=True)
    skills_summary = serializers.CharField(source='resource_listing.skills_summary', read_only=True)

    class Meta:
        model = ResourceRequest
        fields = (
            'id', 'resource_listing', 'resource_listing_title', 'resource_company_name',
            'requesting_company', 'requesting_company_name', 'total_resources',
            'skills_summary', 'status', 'message', 'response', 'requested_at',
            'responded_at', 'additional_params'
        )
        read_only_fields = ('id', 'requested_at', 'responded_at')


class ResourceRequestCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a resource request"""

    class Meta:
        model = ResourceRequest
        fields = ('resource_listing', 'requesting_company', 'message', 'additional_params')

    def validate(self, attrs):
        resource_listing = attrs.get('resource_listing')
        requesting_company = attrs.get('requesting_company')

        # Check if listing is active
        if resource_listing.status != 'active':
            raise serializers.ValidationError("This resource listing is not active.")

        # Check if requesting company is not the owner
        if resource_listing.company == requesting_company:
            raise serializers.ValidationError("You cannot request your own resource listing.")

        # Check if a pending request already exists
        existing_request = ResourceRequest.objects.filter(
            resource_listing=resource_listing,
            requesting_company=requesting_company,
            status='pending'
        ).exists()

        if existing_request:
            raise serializers.ValidationError(
                "A pending request already exists for this resource listing."
            )

        return attrs


class ResourceRequestResponseSerializer(serializers.Serializer):
    """Serializer for responding to a resource request"""

    status = serializers.ChoiceField(choices=['approved', 'rejected'])
    response = serializers.CharField(required=False, allow_blank=True)
