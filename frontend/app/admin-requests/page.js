'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { adminRequestAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import ProfileDropdown from '@/components/ProfileDropdown';

export default function AdminRequestsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseForm, setResponseForm] = useState({
    status: '',
    response_message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'company_user') {
      fetchRequests();
    } else if (user && user.role !== 'company_user') {
      // Redirect admins away from this page
      router.push('/employees');
    }
  }, [user, router]);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await adminRequestAPI.getAll();
      setRequests(response.data.results || response.data);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setError('Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = (request) => {
    setRespondingTo(request);
    setResponseForm({
      status: '',
      response_message: ''
    });
    setError('');
  };

  const handleResponseFormChange = (e) => {
    const { name, value } = e.target;
    setResponseForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();

    if (!responseForm.status) {
      setError('Please select approve or reject.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await adminRequestAPI.respond(respondingTo.id, responseForm);
      await fetchRequests(); // Refresh the list
      setRespondingTo(null);
      setResponseForm({ status: '', response_message: '' });
    } catch (err) {
      console.error('Failed to respond to request:', err);
      if (err.response?.data) {
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
        setError('Failed to respond to request. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'badge-pending';
      case 'approved':
        return 'badge-approved';
      case 'rejected':
        return 'badge-rejected';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
              <Link href="/requests" className="text-gray-700 hover:text-primary-600 font-medium">
                Requests
              </Link>
              <Link href="/admin-requests" className="text-primary-600 font-medium">
                Admin Requests
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Access Requests</h1>
          <p className="text-gray-600 mt-2">
            Review and manage admin access requests for your company
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="card mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({requests.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({requests.filter(r => r.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'approved'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved ({requests.filter(r => r.status === 'approved').length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'rejected'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected ({requests.filter(r => r.status === 'rejected').length})
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading requests...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredRequests.length === 0 && (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-600">
              {filter === 'all'
                ? 'You have no admin access requests yet.'
                : `You have no ${filter} admin access requests.`}
            </p>
          </div>
        )}

        {/* Requests List */}
        {!loading && filteredRequests.length > 0 && (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{request.user_name}</h3>
                      <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                        {request.status}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium w-24">Email:</span>
                        <span>{request.user_email}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium w-24">Company:</span>
                        <span>{request.company_name}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium w-24">Requested:</span>
                        <span>
                          {new Date(request.requested_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {request.responded_at && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-medium w-24">Responded:</span>
                          <span>
                            {new Date(request.responded_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    {request.message && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Message:</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{request.message}</p>
                      </div>
                    )}

                    {request.response_message && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Your Response:</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{request.response_message}</p>
                      </div>
                    )}
                  </div>

                  {request.status === 'pending' && (
                    <button
                      onClick={() => handleRespond(request)}
                      className="btn btn-primary ml-4"
                    >
                      Respond
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Response Modal */}
        {respondingTo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="card max-w-2xl w-full">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Respond to Admin Request
              </h2>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Applicant:</p>
                <p className="text-gray-900">{respondingTo.user_name}</p>
                <p className="text-sm text-gray-600">{respondingTo.user_email}</p>
                {respondingTo.message && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700">Their message:</p>
                    <p className="text-sm text-gray-600 mt-1">{respondingTo.message}</p>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmitResponse} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Decision <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setResponseForm(prev => ({ ...prev, status: 'approved' }))}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        responseForm.status === 'approved'
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-300 hover:border-green-600'
                      }`}
                    >
                      <div className="text-2xl mb-2">✅</div>
                      <div className="font-semibold">Approve</div>
                      <div className="text-xs text-gray-600">Grant admin access</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setResponseForm(prev => ({ ...prev, status: 'rejected' }))}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        responseForm.status === 'rejected'
                          ? 'border-red-600 bg-red-50'
                          : 'border-gray-300 hover:border-red-600'
                      }`}
                    >
                      <div className="text-2xl mb-2">❌</div>
                      <div className="font-semibold">Reject</div>
                      <div className="text-xs text-gray-600">Deny access</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response Message (Optional)
                  </label>
                  <textarea
                    name="response_message"
                    value={responseForm.response_message}
                    onChange={handleResponseFormChange}
                    className="input"
                    rows="4"
                    placeholder="Add an optional message for the applicant..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setRespondingTo(null);
                      setResponseForm({ status: '', response_message: '' });
                      setError('');
                    }}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!responseForm.status || submitting}
                    className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Response'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
