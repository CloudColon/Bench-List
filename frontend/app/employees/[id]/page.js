'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { employeeAPI } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import ProfileDropdown from '@/components/ProfileDropdown';

export default function EmployeeDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id;

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && employeeId) {
      fetchEmployee();
    }
  }, [user, employeeId]);

  const fetchEmployee = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await employeeAPI.getById(employeeId);
      setEmployee(response.data);
    } catch (err) {
      console.error('Failed to fetch employee:', err);
      if (err.response?.status === 404) {
        setError('Employee not found.');
      } else {
        setError('Failed to load employee details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    setDeleting(true);
    try {
      await employeeAPI.delete(employeeId);
      router.push('/employees');
    } catch (err) {
      console.error('Failed to delete employee:', err);
      setError('Failed to delete employee. Please try again.');
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'available':
        return 'badge-available';
      case 'requested':
        return 'badge-requested';
      case 'allocated':
        return 'badge-allocated';
      default:
        return 'badge-available';
    }
  };

  const getExperienceBadgeClass = (level) => {
    switch (level) {
      case 'junior':
        return 'bg-gray-100 text-gray-800';
      case 'mid':
        return 'bg-blue-100 text-blue-800';
      case 'senior':
        return 'bg-purple-100 text-purple-800';
      case 'lead':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (loading) {
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
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading employee details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !employee) {
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
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/employees" className="btn btn-primary">
              Back to Employees
            </Link>
          </div>
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/employees" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
            ← Back to Employees
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{employee.full_name}</h1>
              <p className="text-xl text-gray-600 mt-1">{employee.job_title}</p>
            </div>
            <span className={`badge ${getStatusBadgeClass(employee.status)}`}>
              {employee.status}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Personal Information */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
              <p className="text-gray-900">{employee.first_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
              <p className="text-gray-900">{employee.last_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <a href={`mailto:${employee.email}`} className="text-primary-600 hover:text-primary-700">
                {employee.email}
              </a>
            </div>
            {employee.phone && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                <a href={`tel:${employee.phone}`} className="text-primary-600 hover:text-primary-700">
                  {employee.phone}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Professional Information */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Professional Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Job Title</label>
              <p className="text-gray-900">{employee.job_title}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Experience</label>
              <div className="flex items-center gap-2">
                <p className="text-gray-900">{employee.experience_years} years</p>
                <span className={`badge ${getExperienceBadgeClass(employee.experience_level)}`}>
                  {employee.experience_level}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Company</label>
              <p className="text-gray-900">{employee.company_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
              <span className={`badge ${getStatusBadgeClass(employee.status)}`}>
                {employee.status}
              </span>
            </div>
          </div>

          {employee.skills && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-500 mb-2">Skills</label>
              <div className="flex flex-wrap gap-2">
                {employee.skills.split(',').map((skill, index) => (
                  <span key={index} className="badge bg-primary-100 text-primary-800">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {employee.resume && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-500 mb-2">Resume</label>
              <a
                href={employee.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary inline-flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Resume
              </a>
            </div>
          )}
        </div>

        {/* Employment Details */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Employment Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Bench Start Date</label>
              <p className="text-gray-900">
                {new Date(employee.bench_start_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            {employee.expected_availability_end && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Expected Availability End</label>
                <p className="text-gray-900">
                  {new Date(employee.expected_availability_end).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>

          {employee.notes && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-500 mb-2">Notes</label>
              <p className="text-gray-700 whitespace-pre-wrap">{employee.notes}</p>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
              <p className="text-gray-900">
                {new Date(employee.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
              <p className="text-gray-900">
                {new Date(employee.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="card">
          <div className="flex flex-wrap gap-4">
            {employee.status === 'available' && (
              <Link
                href={`/requests/create?employee=${employee.id}`}
                className="btn btn-primary"
              >
                Request Employee
              </Link>
            )}
            <Link href={`/employees/${employee.id}/edit`} className="btn btn-secondary">
              Edit Employee
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={`btn ${deleteConfirm ? 'btn-danger' : 'bg-red-100 text-red-700 hover:bg-red-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {deleting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </span>
              ) : deleteConfirm ? (
                'Click Again to Confirm Delete'
              ) : (
                'Delete Employee'
              )}
            </button>
            {deleteConfirm && (
              <button
                onClick={() => setDeleteConfirm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
