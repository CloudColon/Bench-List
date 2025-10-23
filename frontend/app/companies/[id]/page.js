'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { companyAPI, employeeAPI } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';

export default function CompanyDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const companyId = params.id;

  const [company, setCompany] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && companyId) {
      fetchCompany();
      fetchCompanyEmployees();
    }
  }, [user, companyId]);

  const fetchCompany = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await companyAPI.getById(companyId);
      setCompany(response.data);
    } catch (err) {
      console.error('Failed to fetch company:', err);
      if (err.response?.status === 404) {
        setError('Company not found.');
      } else {
        setError('Failed to load company details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyEmployees = async () => {
    setEmployeesLoading(true);
    try {
      // Fetch employees and filter by company on the client side if needed
      const response = await employeeAPI.getAll({ company: companyId });
      setEmployees(response.data.results || response.data);
    } catch (err) {
      console.error('Failed to fetch company employees:', err);
      // Don't show error for employees, just show empty state
    } finally {
      setEmployeesLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    setDeleting(true);
    try {
      await companyAPI.delete(companyId);
      router.push('/companies');
    } catch (err) {
      console.error('Failed to delete company:', err);
      setError('Failed to delete company. Please try again.');
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

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading company details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !company) {
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

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/companies" className="btn btn-primary">
              Back to Companies
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
              <Link href="/employees" className="text-gray-700 hover:text-primary-600 font-medium">
                Employees
              </Link>
              <Link href="/companies" className="text-primary-600 font-medium">
                Companies
              </Link>
              <Link href="/requests" className="text-gray-700 hover:text-primary-600 font-medium">
                Requests
              </Link>
              <Link href="/dashboard" className="text-gray-700 hover:text-primary-600 font-medium">
                Dashboard
              </Link>
              <span className="text-gray-600">
                {user.first_name} {user.last_name}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/companies" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
            ← Back to Companies
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
              {company.description && (
                <p className="text-lg text-gray-600 mt-2">{company.description}</p>
              )}
            </div>
            {company.is_active && (
              <span className="badge badge-available">Active</span>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Company Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <a href={`mailto:${company.email}`} className="text-primary-600 hover:text-primary-700">
                      {company.email}
                    </a>
                  </div>
                </div>

                {company.phone && (
                  <div className="flex items-start">
                    <svg className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Phone</label>
                      <a href={`tel:${company.phone}`} className="text-primary-600 hover:text-primary-700">
                        {company.phone}
                      </a>
                    </div>
                  </div>
                )}

                {company.website && (
                  <div className="flex items-start">
                    <svg className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Website</label>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {company.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}

                {company.address && (
                  <div className="flex items-start">
                    <svg className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Address</label>
                      <p className="text-gray-900 whitespace-pre-wrap">{company.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Company Employees */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Employees ({employees.length})
                </h2>
                <Link
                  href={`/employees/add?company=${company.id}`}
                  className="btn btn-secondary text-sm"
                >
                  + Add Employee
                </Link>
              </div>

              {employeesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading employees...</p>
                </div>
              ) : employees.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No employees found for this company.</p>
                  <Link
                    href={`/employees/add?company=${company.id}`}
                    className="btn btn-primary"
                  >
                    Add First Employee
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {employees.map((employee) => (
                    <div key={employee.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{employee.full_name}</h3>
                          <p className="text-sm text-gray-600">{employee.job_title}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-sm text-gray-500">{employee.experience_years} years exp</span>
                            <span className={`badge text-xs ${getStatusBadgeClass(employee.status)}`}>
                              {employee.status}
                            </span>
                          </div>
                        </div>
                        <Link
                          href={`/employees/${employee.id}`}
                          className="btn btn-secondary text-sm"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Admin & Actions */}
          <div className="space-y-6">
            {/* Admin Information */}
            {(company.admin_user_name || company.admin_user_email) && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Contact</h2>
                <div className="space-y-2">
                  {company.admin_user_name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Name</label>
                      <p className="text-gray-900">{company.admin_user_name}</p>
                    </div>
                  )}
                  {company.admin_user_email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Email</label>
                      <a href={`mailto:${company.admin_user_email}`} className="text-primary-600 hover:text-primary-700">
                        {company.admin_user_email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Created</label>
                  <p className="text-sm text-gray-900">
                    {new Date(company.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-sm text-gray-900">
                    {new Date(company.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <span className={`badge text-xs ${company.is_active ? 'badge-available' : 'bg-gray-100 text-gray-800'}`}>
                    {company.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-3">
                <Link href={`/companies/${company.id}/edit`} className="btn btn-secondary w-full">
                  Edit Company
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className={`btn w-full ${deleteConfirm ? 'btn-danger' : 'bg-red-100 text-red-700 hover:bg-red-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {deleting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </span>
                  ) : deleteConfirm ? (
                    'Click Again to Confirm'
                  ) : (
                    'Delete Company'
                  )}
                </button>
                {deleteConfirm && (
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="btn btn-secondary w-full"
                  >
                    Cancel Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
