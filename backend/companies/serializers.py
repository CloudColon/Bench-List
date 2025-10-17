from rest_framework import serializers
from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    """Serializer for Company model"""
    
    admin_user_email = serializers.EmailField(source='admin_user.email', read_only=True)
    admin_user_name = serializers.CharField(source='admin_user.get_full_name', read_only=True)
    
    class Meta:
        model = Company
        fields = (
            'id', 'name', 'email', 'phone', 'address', 'website', 
            'description', 'admin_user', 'admin_user_email', 'admin_user_name',
            'is_active', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class CompanyCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new company"""
    
    class Meta:
        model = Company
        fields = ('name', 'email', 'phone', 'address', 'website', 'description')
    
    def create(self, validated_data):
        # Admin user is set from the request context
        validated_data['admin_user'] = self.context['request'].user
        return super().create(validated_data)
