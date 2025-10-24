'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { resourceListingAPI, employeeAPI, companyAPI } from '@/lib/api';
import ProfileDropdown from '@/components/ProfileDropdown';

export default function PostResourcesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [formData, setFormData] = useState({
    company: '',
    title: '',
    description: '',
    start_date: '',
    expected_end_date: '',
    locations: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (formData.company) {
      fetchEmployees(formData.company);
    }
  }, [formData.company]);

  const fetchCompanies = async () => {
    try {
      const response = await companyAPI.getAll();
      setCompanies(response.data.results || response.data);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
      setError('Failed to load companies');
    }
  };

  const fetchEmployees = async (companyId) => {
    try {
      const response = await employeeAPI.getAll({
        company: companyId,
        status: 'available'
      });
      setEmployees(response.data.results || response.data);
      setSelectedEmployees([]); // Reset selection when company changes
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setError('Failed to load employees');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmployeeToggle = (employeeId) => {
    setSelectedEmployees(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(emp => emp.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (selectedEmployees.length === 0) {
      setError('Please select at least one employee');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        employees: selectedEmployees,
        company: parseInt(formData.company),
      };

      await resourceListingAPI.create(payload);
      setSuccess(true);
      setTimeout(() => {
        router.push('/listings');
      }, 1500);
    } catch (err) {
      console.error('Failed to create resource listing:', err);
      setError(err.response?.data?.detail || err.response?.data?.employees?.[0] || 'Failed to create resource listing');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
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
              <Link href="/companies" className="text-gray-700 hover:text-primary-600 font-medium">
                Companies
              </Link>
              <Link href="/listings" className="text-gray-700 hover:text-primary-600 font-medium">
                Listings
              </Link>
              <Link href="/post-resources" className="text-primary-600 font-medium">
                Post Resources
              </Link>
              <Link href="/resource-requests" className="text-gray-700 hover:text-primary-600 font-medium">
                Resource Requests
              </Link>
              <Link href="/requests" className="text-gray-700 hover:text-primary-600 font-medium">
                Employee Requests
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Post Bench Resources</h2>
            <p className="mt-2 text-sm text-gray-600">
              Select employees and create a resource listing for other companies to view and request.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 text-sm">Resource listing created successfully! Redirecting...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Selection */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                Company *
              </label>
              <select
                id="company"
                name="company"
                required
                value={formData.company}
                onChange={handleInputChange}
                className="input w-full"
              >
                <option value="">Select a company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Listing Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Senior Developers - Available Immediately"
                className="input w-full"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the available resources, their expertise, and any specific requirements..."
                className="input w-full"
              />
            </div>

            {/* Date Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  required
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="input w-full"
                />
              </div>
              <div>
                <label htmlFor="expected_end_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Expected End Date
                </label>
                <input
                  type="date"
                  id="expected_end_date"
                  name="expected_end_date"
                  value={formData.expected_end_date}
                  onChange={handleInputChange}
                  className="input w-full"
                />
              </div>
            </div>

            {/* Locations */}
            <div>
              <label htmlFor="locations" className="block text-sm font-medium text-gray-700 mb-1">
                Locations
              </label>
              <input
                type="text"
                id="locations"
                name="locations"
                value={formData.locations}
                onChange={handleInputChange}
                placeholder="e.g., Remote, New York, San Francisco"
                className="input w-full"
              />
              <p className="mt-1 text-xs text-gray-500">Comma-separated locations</p>
            </div>

            {/* Employee Selection */}
            {formData.company && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Employees * ({selectedEmployees.length} selected)
                  </label>
                  {employees.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      {selectedEmployees.length === employees.length ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                </div>

                {employees.length === 0 ? (
                  <div className="border rounded-md p-4 bg-gray-50">
                    <p className="text-sm text-gray-600">No available employees found for this company.</p>
                  </div>
                ) : (
                  <div className="border rounded-md max-h-96 overflow-y-auto">
                    {employees.map((employee) => (
                      <div
                        key={employee.id}
                        className="border-b last:border-b-0 p-3 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleEmployeeToggle(employee.id)}
                      >
                        <div className="flex items-start">
                          <input
                            type="checkbox"
                            checked={selectedEmployees.includes(employee.id)}
                            onChange={() => handleEmployeeToggle(employee.id)}
                            className="mt-1 mr-3"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-900">{employee.full_name}</p>
                              <span className="badge-available text-xs">{employee.status}</span>
                            </div>
                            <p className="text-sm text-gray-600">{employee.job_title}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {employee.experience_level} • {employee.experience_years} years
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => router.push('/listings')}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || selectedEmployees.length === 0}
              >
                {loading ? 'Creating...' : 'Create Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
