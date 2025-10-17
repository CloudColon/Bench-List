from rest_framework import serializers
from .models import Employee, BenchRequest
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
