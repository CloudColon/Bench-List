from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from companies.models import Company
from .models import AdminRequest

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""

    accessible_companies = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'date_joined', 'accessible_companies')
        read_only_fields = ('id', 'date_joined')

    def get_accessible_companies(self, obj):
        """Get list of companies this user has access to"""
        companies = obj.get_accessible_companies()
        return [{'id': c.id, 'name': c.name} for c in companies]


class CompanyUserRegistrationSerializer(serializers.Serializer):
    """Serializer for Company User registration with company details"""

    # User fields
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    first_name = serializers.CharField(required=True, max_length=150)
    last_name = serializers.CharField(required=True, max_length=150)

    # Company fields
    company_name = serializers.CharField(required=True, max_length=255, write_only=True)
    company_email = serializers.EmailField(required=True, write_only=True)
    company_phone = serializers.CharField(required=False, allow_blank=True, max_length=20, write_only=True)
    company_address = serializers.CharField(required=False, allow_blank=True, write_only=True)
    company_website = serializers.URLField(required=False, allow_blank=True, write_only=True)
    company_description = serializers.CharField(required=False, allow_blank=True, write_only=True)

    def validate(self, attrs):
        # Validate passwords match
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        # Validate email uniqueness
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "A user with this email already exists."})

        # Validate company name uniqueness
        if Company.objects.filter(name=attrs['company_name']).exists():
            raise serializers.ValidationError({"company_name": "A company with this name already exists."})

        # Validate company email uniqueness
        if Company.objects.filter(email=attrs['company_email']).exists():
            raise serializers.ValidationError({"company_email": "A company with this email already exists."})

        return attrs

    def create(self, validated_data):
        # Extract company data
        company_data = {
            'name': validated_data.pop('company_name'),
            'email': validated_data.pop('company_email'),
            'phone': validated_data.pop('company_phone', ''),
            'address': validated_data.pop('company_address', ''),
            'website': validated_data.pop('company_website', ''),
            'description': validated_data.pop('company_description', ''),
        }

        # Remove password2
        validated_data.pop('password2')

        # Create user
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            role='company_user'
        )

        # Create company
        company = Company.objects.create(
            admin_user=user,
            **company_data
        )

        return user

    def to_representation(self, instance):
        """Return only user data in response"""
        return {
            'id': instance.id,
            'email': instance.email,
            'first_name': instance.first_name,
            'last_name': instance.last_name,
            'role': instance.role,
            'message': 'Registration successful! You can now login.'
        }


class AdminRegistrationSerializer(serializers.Serializer):
    """Serializer for Admin registration with company selection"""

    # User fields
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    first_name = serializers.CharField(required=True, max_length=150)
    last_name = serializers.CharField(required=True, max_length=150)

    # Company selection
    company = serializers.PrimaryKeyRelatedField(queryset=Company.objects.all(), required=True, write_only=True)
    message = serializers.CharField(required=False, allow_blank=True, help_text='Optional message to company', write_only=True)

    def validate(self, attrs):
        # Validate passwords match
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        # Validate email uniqueness
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "A user with this email already exists."})

        return attrs

    def create(self, validated_data):
        company = validated_data.pop('company')
        message = validated_data.pop('message', '')
        validated_data.pop('password2')

        # Create user with is_active=False until approved
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            role='admin',
            is_active=False  # Inactive until approved
        )

        # Create admin request
        AdminRequest.objects.create(
            user=user,
            company=company,
            message=message
        )

        return user

    def to_representation(self, instance):
        """Return only user data in response"""
        return {
            'id': instance.id,
            'email': instance.email,
            'first_name': instance.first_name,
            'last_name': instance.last_name,
            'role': instance.role,
            'is_active': instance.is_active,
            'message': 'Registration request submitted! Please wait for company approval.'
        }


class AdminRequestSerializer(serializers.ModelSerializer):
    """Serializer for AdminRequest model"""

    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)

    class Meta:
        model = AdminRequest
        fields = (
            'id', 'user', 'user_email', 'user_name', 'company', 'company_name',
            'status', 'message', 'response_message', 'requested_at', 'responded_at'
        )
        read_only_fields = ('id', 'requested_at', 'responded_at')


class AdminRequestResponseSerializer(serializers.Serializer):
    """Serializer for responding to admin requests"""

    status = serializers.ChoiceField(choices=['approved', 'rejected'], required=True)
    response_message = serializers.CharField(required=False, allow_blank=True)


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change"""

    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs
