# Database Schema Overview

This document describes all the data stored in the PostgreSQL database for the Bench List application.

## Database: `bench_list_db`

All application data is stored in PostgreSQL. Here's what gets stored:

---

## Tables and Data Storage

### 1. **Users Table** (`accounts_user`)
Stores all user account information.

**Stored Data:**
- ✅ Email address (unique, used for login)
- ✅ Hashed password (secure, never stored in plain text)
- ✅ First name and last name
- ✅ User role (Admin or Company User)
- ✅ Account status (active/inactive)
- ✅ Staff and superuser flags
- ✅ Date joined timestamp
- ✅ Last login timestamp

**Example Data:**
```
id: 1
email: john.doe@example.com
first_name: John
last_name: Doe
role: company_user
is_active: True
date_joined: 2025-10-23 10:30:00
```

---

### 2. **Companies Table** (`companies_company`)
Stores all company/organization information.

**Stored Data:**
- ✅ Company name (unique)
- ✅ Email address (unique)
- ✅ Phone number
- ✅ Physical address
- ✅ Website URL
- ✅ Company description
- ✅ Admin user reference (who manages this company)
- ✅ Active status
- ✅ Created and updated timestamps

**Example Data:**
```
id: 1
name: Tech Solutions Inc.
email: contact@techsolutions.com
phone: +1-555-0100
address: 123 Tech Street, San Francisco, CA
website: https://techsolutions.com
admin_user_id: 1
is_active: True
created_at: 2025-10-23 10:35:00
```

---

### 3. **Employees Table** (`employees_employee`)
Stores all employee information and bench status.

**Stored Data:**
- ✅ First name and last name
- ✅ Email address (unique)
- ✅ Phone number
- ✅ Job title
- ✅ Years of experience
- ✅ Experience level (Junior, Mid, Senior, Lead)
- ✅ Skills (comma-separated list)
- ✅ Resume file (uploaded PDF/DOC)
- ✅ Company reference (which company they belong to)
- ✅ Status (Available, Requested, Allocated)
- ✅ Bench start date
- ✅ Expected availability end date
- ✅ Additional notes
- ✅ Active status
- ✅ Created and updated timestamps

**Example Data:**
```
id: 1
first_name: Jane
last_name: Smith
email: jane.smith@techsolutions.com
phone: +1-555-0101
job_title: Senior React Developer
experience_years: 5
experience_level: senior
skills: React, TypeScript, Node.js, AWS
resume: resumes/jane_smith_resume.pdf
company_id: 1
status: available
bench_start_date: 2025-10-20
is_active: True
created_at: 2025-10-23 11:00:00
```

---

### 4. **Bench Requests Table** (`employees_benchrequest`)
Stores all requests for bench employees between companies.

**Stored Data:**
- ✅ Employee reference (which employee is requested)
- ✅ Requesting company reference (which company wants the employee)
- ✅ Request status (Pending, Approved, Rejected, Cancelled)
- ✅ Request message (from requesting company)
- ✅ Response message (from employee's company)
- ✅ Request timestamp
- ✅ Response timestamp

**Example Data:**
```
id: 1
employee_id: 1
requesting_company_id: 2
status: pending
message: We need a senior React developer for a 3-month project
response: (null - not responded yet)
requested_at: 2025-10-23 14:00:00
responded_at: (null)
```

---

### 5. **File Storage** (`media/resumes/`)
Employee resumes are stored in the file system.

**Stored Files:**
- ✅ Resume PDFs, DOCs, DOCX
- ✅ Location: `backend/media/resumes/`
- ✅ File path stored in database

---

## Summary: What's Stored in PostgreSQL?

| Data Type | Storage Location | Examples |
|-----------|-----------------|----------|
| **User Accounts** | PostgreSQL | Emails, passwords (hashed), names, roles |
| **Companies** | PostgreSQL | Company info, contact details, admin assignments |
| **Employees** | PostgreSQL | Personal info, skills, experience, bench status |
| **Bench Requests** | PostgreSQL | Request details, statuses, messages |
| **Resume Files** | File System | PDF/DOC files in `media/resumes/` |
| **Session Data** | PostgreSQL | Django sessions (optional) |
| **Authentication Tokens** | localStorage (Frontend) | JWT access and refresh tokens |

---

## Data Relationships

```
User (Admin) ──┬──> Company ──┬──> Employee ──┬──> BenchRequest
               │              │               │
               │              └──> Employee   └──> BenchRequest
               │
               └──> Company ──> Employee
```

- **One User** can manage **multiple Companies** (one-to-many)
- **One Company** has **multiple Employees** (one-to-many)
- **One Employee** can have **multiple BenchRequests** (one-to-many)
- **One Company** can make **multiple BenchRequests** (one-to-many)

---

## Database Size Estimates

For reference, here's approximately how much data each record takes:

- **User:** ~500 bytes per record
- **Company:** ~1-2 KB per record
- **Employee:** ~2-3 KB per record (without resume)
- **Resume File:** 100-500 KB per file
- **BenchRequest:** ~1 KB per record

**Example:**
- 100 users + 50 companies + 500 employees + 200 requests
- Database size: ~2-5 MB
- Resume files: ~50-250 MB

---

## Data Backup Recommendations

To backup your PostgreSQL data:

```bash
# Full database backup
pg_dump -U bench_admin -d bench_list_db > backup.sql

# Restore from backup
psql -U bench_admin -d bench_list_db < backup.sql

# Backup with compression
pg_dump -U bench_admin -d bench_list_db | gzip > backup.sql.gz

# Restore compressed backup
gunzip < backup.sql.gz | psql -U bench_admin -d bench_list_db
```

Don't forget to also backup the `media/` directory containing resume files!

---

## Security Notes

✅ **Passwords:** Never stored in plain text - Django uses PBKDF2 with SHA256 hash
✅ **JWT Tokens:** Stored client-side (localStorage), not in database
✅ **Sensitive Data:** All database communication over localhost or encrypted connections
✅ **File Uploads:** Validated and stored securely in designated directory

---

## Viewing Your Data

You can view and manage your data through:

1. **Django Admin Panel:** http://localhost:8000/admin/
2. **API Endpoints:** http://localhost:8000/swagger/
3. **PostgreSQL Client:** `psql -U bench_admin -d bench_list_db`
4. **pgAdmin:** GUI tool for PostgreSQL management

---

**Last Updated:** 2025-10-23
