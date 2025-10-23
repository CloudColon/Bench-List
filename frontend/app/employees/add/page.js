'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { employeeAPI, companyAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import ProfileDropdown from '@/components/ProfileDropdown';

export default function AddEmployeePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job_title: '',
    experience_years: '',
    experience_level: 'mid',
    skills: '',
    company: '',
    status: 'available',
    bench_start_date: '',
    expected_availability_end: '',
    notes: ''
  });
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchCompanies();
      // Check for company parameter in URL
      const urlParams = new URLSearchParams(window.location.search);
      const companyParam = urlParams.get('company');
      if (companyParam) {
        setFormData(prev => ({ ...prev, company: companyParam }));
      }
    }
  }, [user]);

  const fetchCompanies = async () => {
    try {
      const response = await companyAPI.getAll();
      setCompanies(response.data.results || response.data);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
      setError('Failed to load companies. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a PDF or Word document for the resume.');
        e.target.value = '';
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Resume file size should not exceed 5MB.');
        e.target.value = '';
        return;
      }
      setResumeFile(file);
      setError('');
    }
  };

  const validateForm = () => {
    if (!formData.first_name.trim()) {
      setError('First name is required.');
      return false;
    }
    if (!formData.last_name.trim()) {
      setError('Last name is required.');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required.');
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!formData.job_title.trim()) {
      setError('Job title is required.');
      return false;
    }
    if (!formData.experience_years || formData.experience_years < 0) {
      setError('Please enter valid years of experience.');
      return false;
    }
    if (!formData.skills.trim()) {
      setError('Skills are required.');
      return false;
    }
    if (!formData.company) {
      setError('Please select a company.');
      return false;
    }
    if (!formData.bench_start_date) {
      setError('Bench start date is required.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        experience_years: parseInt(formData.experience_years),
        company: parseInt(formData.company),
      };

      // Remove empty optional fields
      if (!submitData.phone) delete submitData.phone;
      if (!submitData.expected_availability_end) delete submitData.expected_availability_end;
      if (!submitData.notes) delete submitData.notes;

      // Create the employee first
      const response = await employeeAPI.create(submitData);

      // If there's a resume file, upload it
      if (resumeFile && response.data.id) {
        try {
          await employeeAPI.uploadResume(response.data.id, resumeFile);
        } catch (uploadError) {
          console.error('Failed to upload resume:', uploadError);
          // Don't fail the entire operation if resume upload fails
        }
      }

      setSuccess(true);

      // Redirect to employees list after 2 seconds
      setTimeout(() => {
        router.push('/employees');
      }, 2000);

    } catch (err) {
      console.error('Failed to create employee:', err);
      if (err.response?.data) {
        // Handle validation errors from backend
        const errorMessages = [];
        Object.keys(err.response.data).forEach(key => {
          const value = err.response.data[key];
          if (Array.isArray(value)) {
            errorMessages.push(`${key}: ${value.join(', ')}`);
          } else {
            errorMessages.push(`${key}: ${value}`);
          }
        });
        setError(errorMessages.join(' | '));
      } else {
        setError('Failed to create employee. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card max-w-md text-center">
          <div className="text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Success!</h2>
          <p className="text-gray-600 mb-4">Employee has been added successfully.</p>
          <p className="text-sm text-gray-500">Redirecting to employees list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary-600">
                BenchList
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/employees" className="text-primary-600 font-medium">
                Employees
              </Link>
              <Link href="/companies" className="text-gray-700 hover:text-primary-600 font-medium">
                Companies
              </Link>
              <Link href="/requests" className="text-gray-700 hover:text-primary-600 font-medium">
                Requests
              </Link>
              <Link href="/dashboard" className="text-gray-700 hover:text-primary-600 font-medium">
                Dashboard
              </Link>
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/employees" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
            ← Back to Employees
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Add New Employee</h1>
          <p className="text-gray-600 mt-2">
            Fill in the details below to add a new bench employee
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="card">
          {/* Personal Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input"
                  placeholder="+1234567890"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Professional Information</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="job_title" className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="job_title"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., Senior Software Engineer"
                  required
                />
              </div>

              <div>
                <label htmlFor="experience_years" className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="experience_years"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleChange}
                  className="input"
                  min="0"
                  max="50"
                  required
                />
              </div>

              <div>
                <label htmlFor="experience_level" className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level <span className="text-red-500">*</span>
                </label>
                <select
                  id="experience_level"
                  name="experience_level"
                  value={formData.experience_level}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="junior">Junior</option>
                  <option value="mid">Mid-level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                </select>
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Company <span className="text-red-500">*</span>
                </label>
                <select
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="">Select a company...</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                Skills <span className="text-red-500">*</span>
              </label>
              <textarea
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className="input"
                rows="3"
                placeholder="Enter comma-separated skills (e.g., React, Node.js, Python, AWS)"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Enter skills separated by commas</p>
            </div>

            <div>
              <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-2">
                Resume (PDF or Word document)
              </label>
              <input
                type="file"
                id="resume"
                name="resume"
                onChange={handleFileChange}
                className="input"
                accept=".pdf,.doc,.docx"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum file size: 5MB</p>
            </div>
          </div>

          {/* Employment Details */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Employment Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="available">Available</option>
                  <option value="requested">Requested</option>
                  <option value="allocated">Allocated</option>
                </select>
              </div>

              <div>
                <label htmlFor="bench_start_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Bench Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="bench_start_date"
                  name="bench_start_date"
                  value={formData.bench_start_date}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label htmlFor="expected_availability_end" className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Availability End
                </label>
                <input
                  type="date"
                  id="expected_availability_end"
                  name="expected_availability_end"
                  value={formData.expected_availability_end}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="input"
                rows="4"
                placeholder="Any additional notes or comments..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding Employee...
                </span>
              ) : (
                'Add Employee'
              )}
            </button>
            <Link href="/employees" className="btn btn-secondary flex-1 text-center">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
