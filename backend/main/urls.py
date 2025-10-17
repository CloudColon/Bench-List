"""
URL configuration for main project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Swagger/OpenAPI Schema
schema_view = get_schema_view(
    openapi.Info(
        title="Employee Management System API",
        default_version='v1',
        description="""
        # Employee Management System API Documentation
        
        This API allows companies to manage their bench employees and request employees from other companies.
        
        ## Authentication
        This API uses JWT (JSON Web Token) authentication. To use authenticated endpoints:
        1. Register a new user at `/api/auth/register/`
        2. Login at `/api/auth/login/` to get your access token
        3. Click the 'Authorize' button (🔒) at the top right
        4. Enter: `Bearer <your_access_token>`
        5. Click 'Authorize' and 'Close'
        
        ## Key Features
        - User registration and authentication with email/password
        - Company management
        - Employee management with status tracking
        - Bench request system for inter-company employee allocation
        - Role-based access control (Admin, Company User)
        
        ## Roles
        - **Admin**: Full access to all resources
        - **Company User**: Access to their own company's data only
        """,
        terms_of_service="https://www.example.com/terms/",
        contact=openapi.Contact(email="contact@example.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Swagger/OpenAPI Documentation
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui-root'),  # Root URL shows Swagger
    
    # API endpoints
    path('api/auth/', include('accounts.urls')),
    path('api/companies/', include('companies.urls')),
    path('api/', include('employees.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
