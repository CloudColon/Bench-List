'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { resourceListingAPI, resourceRequestAPI, companyAPI } from '@/lib/api';
import ProfileDropdown from '@/components/ProfileDropdown';

export default function ListingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [listing, setListing] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestData, setRequestData] = useState({
    requesting_company: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && params.id) {
      fetchListing();
      fetchCompanies();
    }
  }, [user, params.id]);

  const fetchListing = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await resourceListingAPI.getById(params.id);
      setListing(response.data);
    } catch (err) {
      console.error('Failed to fetch listing:', err);
      setError('Failed to load resource listing');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await companyAPI.getAll();
      setCompanies(response.data.results || response.data);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await resourceRequestAPI.create({
        resource_listing: parseInt(params.id),
        requesting_company: parseInt(requestData.requesting_company),
        message: requestData.message,
      });

      setSuccess(true);
      setShowRequestModal(false);
      setTimeout(() => {
        router.push('/listings');
      }, 2000);
    } catch (err) {
      console.error('Failed to create request:', err);
      setError(err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error && !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => router.push('/listings')} className="btn-primary">
            Back to Listings
          </button>
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
              <Link href="/companies" className="text-gray-700 hover:text-primary-600 font-medium">
                Companies
              </Link>
              <Link href="/listings" className="text-primary-600 font-medium">
                Listings
              </Link>
              <Link href="/post-resources" className="text-gray-700 hover:text-primary-600 font-medium">
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/listings')}
          className="mb-4 text-blue-600 hover:text-blue-700 flex items-center text-sm"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Listings
        </button>

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 text-sm">Request submitted successfully! Redirecting...</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {listing && (
          <>
            {/* Header Card */}
            <div className="card mb-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
                    <span className={`badge-${listing.status}`}>{listing.status}</span>
                  </div>
                  <p className="text-lg text-gray-700 font-medium">{listing.company_name}</p>
                </div>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="btn-primary text-lg px-6 py-3"
                  disabled={listing.status !== 'active'}
                >
                  Request Resources
                </button>
              </div>

              {listing.description && (
                <p className="text-gray-700 mt-4">{listing.description}</p>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Resource Information */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Resource Information</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Available Resources</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {listing.total_resources} {listing.total_resources === 1 ? 'Employee' : 'Employees'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="text-lg font-semibold text-gray-900">{formatDate(listing.start_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expected End Date</p>
                    <p className="text-lg font-semibold text-gray-900">{formatDate(listing.expected_end_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-lg font-semibold text-gray-900">{listing.locations || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Company Contact */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Contact</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Company Name</p>
                    <p className="text-lg font-semibold text-gray-900">{listing.company_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-lg text-blue-600">{listing.company_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-lg font-semibold text-gray-900">{listing.company_phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-lg font-semibold text-gray-900">{listing.company_address || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Available */}
            {listing.skills_summary && (
              <div className="card mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills Available</h2>
                <div className="flex flex-wrap gap-2">
                  {listing.skills_summary.split(',').map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-md"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Employee Details */}
            {listing.employee_details && listing.employee_details.length > 0 && (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Employees</h2>
                <div className="space-y-3">
                  {listing.employee_details.map((employee) => (
                    <div key={employee.id} className="border rounded-md p-4 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">{employee.full_name}</p>
                          <p className="text-sm text-gray-700">{employee.job_title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {employee.experience_level} • {employee.experience_years} years experience
                          </p>
                          <p className="text-xs text-gray-500">
                            Available from: {formatDate(employee.bench_start_date)}
                          </p>
                        </div>
                        <span className={`badge-${employee.status} text-xs`}>
                          {employee.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Request Resources</h3>

            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label htmlFor="requesting_company" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Company *
                </label>
                <select
                  id="requesting_company"
                  required
                  value={requestData.requesting_company}
                  onChange={(e) => setRequestData(prev => ({ ...prev, requesting_company: e.target.value }))}
                  className="input w-full"
                >
                  <option value="">Select your company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  rows="4"
                  value={requestData.message}
                  onChange={(e) => setRequestData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Describe your requirements and why you're interested in these resources..."
                  className="input w-full"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
