# API Documentation - Employee Management System

Base URL: `http://localhost:8000`

## Authentication

All endpoints require JWT authentication except for registration and login.

### Register
```
POST /api/auth/register/
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "securepass123",
    "password2": "securepass123",
    "first_name": "John",
    "last_name": "Doe",
    "role": "company_user"
}

Response: 201 Created
{
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "company_user"
}
```

### Login
```
POST /api/auth/login/
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "securepass123"
}

Response: 200 OK
{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Refresh Token
```
POST /api/auth/token/refresh/
Content-Type: application/json

{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

Response: 200 OK
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Get Current User
```
GET /api/auth/users/me/
Authorization: Bearer <access_token>

Response: 200 OK
{
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "company_user",
    "is_active": true,
    "date_joined": "2025-10-17T10:30:00Z"
}
```

### Change Password
```
POST /api/auth/users/change_password/
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "old_password": "oldpass123",
    "new_password": "newpass456",
    "new_password2": "newpass456"
}

Response: 200 OK
{
    "message": "Password updated successfully"
}
```

## Companies

### Create Company
```
POST /api/companies/
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "name": "Tech Corp",
    "email": "info@techcorp.com",
    "phone": "+1234567890",
    "address": "123 Tech Street, Silicon Valley",
    "website": "https://techcorp.com",
    "description": "Leading technology company"
}

Response: 201 Created
{
    "id": 1,
    "name": "Tech Corp",
    "email": "info@techcorp.com",
    "phone": "+1234567890",
    "address": "123 Tech Street, Silicon Valley",
    "website": "https://techcorp.com",
    "description": "Leading technology company",
    "admin_user": 1,
    "admin_user_email": "user@example.com",
    "admin_user_name": "John Doe",
    "is_active": true,
    "created_at": "2025-10-17T10:30:00Z",
    "updated_at": "2025-10-17T10:30:00Z"
}
```

### List Companies
```
GET /api/companies/
Authorization: Bearer <access_token>

Response: 200 OK
{
    "count": 1,
    "next": null,
    "previous": null,
    "results": [...]
}
```

### Get Company Details
```
GET /api/companies/{id}/
Authorization: Bearer <access_token>

Response: 200 OK
{
    "id": 1,
    "name": "Tech Corp",
    ...
}
```

### Update Company
```
PUT /api/companies/{id}/
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "name": "Tech Corp Updated",
    "email": "info@techcorp.com",
    ...
}

Response: 200 OK
```

## Employees

### Create Employee
```
POST /api/employees/
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@techcorp.com",
    "phone": "+1234567891",
    "job_title": "Senior Software Engineer",
    "experience_years": 5,
    "experience_level": "senior",
    "skills": "Python, Django, REST APIs, PostgreSQL",
    "company": 1,
    "status": "available",
    "bench_start_date": "2025-10-01",
    "expected_availability_end": "2025-12-31",
    "notes": "Expert in backend development"
}

Response: 201 Created
{
    "id": 1,
    "first_name": "Jane",
    "last_name": "Smith",
    "full_name": "Jane Smith",
    "email": "jane.smith@techcorp.com",
    "phone": "+1234567891",
    "job_title": "Senior Software Engineer",
    "experience_years": 5,
    "experience_level": "senior",
    "skills": "Python, Django, REST APIs, PostgreSQL",
    "resume": null,
    "company": 1,
    "company_name": "Tech Corp",
    "status": "available",
    "bench_start_date": "2025-10-01",
    "expected_availability_end": "2025-12-31",
    "notes": "Expert in backend development",
    "is_active": true,
    "created_at": "2025-10-17T10:30:00Z",
    "updated_at": "2025-10-17T10:30:00Z"
}
```

### List Employees
```
GET /api/employees/
Authorization: Bearer <access_token>

Query Parameters:
- status: available/requested/allocated
- experience_level: junior/mid/senior/lead
- search: search term
- ordering: created_at/-created_at/bench_start_date/experience_years

Example: GET /api/employees/?status=available&experience_level=senior

Response: 200 OK
{
    "count": 1,
    "next": null,
    "previous": null,
    "results": [...]
}
```

### Get Available Employees
```
GET /api/employees/available/
Authorization: Bearer <access_token>

Response: 200 OK
[
    {
        "id": 1,
        "full_name": "Jane Smith",
        "email": "jane.smith@techcorp.com",
        "job_title": "Senior Software Engineer",
        "experience_years": 5,
        "experience_level": "senior",
        "company_name": "Tech Corp",
        "status": "available",
        "bench_start_date": "2025-10-01"
    }
]
```

### Get Employee Details
```
GET /api/employees/{id}/
Authorization: Bearer <access_token>

Response: 200 OK
{
    "id": 1,
    "first_name": "Jane",
    ...
}
```

## Bench Requests

### Create Bench Request
```
POST /api/requests/
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "employee": 1,
    "requesting_company": 2,
    "message": "We would like to hire this employee for a project"
}

Response: 201 Created
{
    "id": 1,
    "employee": 1,
    "employee_name": "Jane Smith",
    "employee_job_title": "Senior Software Engineer",
    "employee_company_name": "Tech Corp",
    "requesting_company": 2,
    "requesting_company_name": "Digital Solutions",
    "status": "pending",
    "message": "We would like to hire this employee for a project",
    "response": "",
    "requested_at": "2025-10-17T10:30:00Z",
    "responded_at": null
}
```

### List Bench Requests
```
GET /api/requests/
Authorization: Bearer <access_token>

Response: 200 OK
{
    "count": 1,
    "next": null,
    "previous": null,
    "results": [...]
}
```

### Get Pending Requests
```
GET /api/requests/pending/
Authorization: Bearer <access_token>

Response: 200 OK
[
    {
        "id": 1,
        "employee_name": "Jane Smith",
        ...
    }
]
```

### Respond to Bench Request
```
POST /api/requests/{id}/respond/
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "status": "approved",
    "response": "We approve this request. Contact us for further details."
}

Response: 200 OK
{
    "id": 1,
    "employee": 1,
    "employee_name": "Jane Smith",
    "employee_job_title": "Senior Software Engineer",
    "employee_company_name": "Tech Corp",
    "requesting_company": 2,
    "requesting_company_name": "Digital Solutions",
    "status": "approved",
    "message": "We would like to hire this employee for a project",
    "response": "We approve this request. Contact us for further details.",
    "requested_at": "2025-10-17T10:30:00Z",
    "responded_at": "2025-10-17T11:00:00Z"
}
```

## Error Responses

### 400 Bad Request
```json
{
    "field_name": [
        "Error message"
    ]
}
```

### 401 Unauthorized
```json
{
    "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
    "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
    "detail": "Not found."
}
```

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Pagination is enabled with 10 items per page
- Use `page` query parameter for pagination: `?page=2`
- File uploads (resumes) should use `multipart/form-data` content type
