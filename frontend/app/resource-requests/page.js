'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { resourceRequestAPI } from '@/lib/api';
import ProfileDropdown from '@/components/ProfileDropdown';

export default function ResourceRequestsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('received'); // received, sent, all
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseData, setResponseData] = useState({
    status: '',
    response: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user, activeTab]);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (activeTab === 'received') {
        response = await resourceRequestAPI.getReceived();
      } else if (activeTab === 'sent') {
        response = await resourceRequestAPI.getSent();
      } else {
        response = await resourceRequestAPI.getAll();
      }
      // Handle both paginated and non-paginated responses
      const data = response.data.results || response.data || [];
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setError('Failed to load resource requests');
      setRequests([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (e) => {
    e.preventDefault();
    if (!respondingTo) return;

    setSubmitting(true);
    setError('');

    try {
      await resourceRequestAPI.respond(respondingTo.id, responseData);
      setRespondingTo(null);
      setResponseData({ status: '', response: '' });
      fetchRequests(); // Refresh the list
    } catch (err) {
      console.error('Failed to respond to request:', err);
      setError(err.response?.data?.detail || 'Failed to respond to request');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'badge-pending';
      case 'approved':
        return 'badge-approved';
      case 'rejected':
        return 'badge-rejected';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'badge-pending';
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
              <Link href="/post-resources" className="text-gray-700 hover:text-primary-600 font-medium">
                Post Resources
              </Link>
              <Link href="/resource-requests" className="text-primary-600 font-medium">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Resource Requests</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage incoming and outgoing requests for resource listings
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('received')}
              className={`${
                activeTab === 'received'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Received
              {activeTab === 'received' && requests.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs">
                  {requests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`${
                activeTab === 'sent'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Sent
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              All
            </button>
          </nav>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading requests...</div>
          </div>
        ) : requests.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">
              {activeTab === 'received' && 'No requests received yet.'}
              {activeTab === 'sent' && 'No requests sent yet.'}
              {activeTab === 'all' && 'No requests found.'}
            </p>
            {activeTab === 'sent' && (
              <a href="/listings" className="btn-primary mt-4 inline-block">
                Browse Listings
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.resource_listing_title}
                      </h3>
                      <span className={`${getStatusBadgeClass(request.status)} text-xs`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">Resource Owner:</span> {request.resource_company_name}
                      </p>
                      <p>
                        <span className="font-medium">Requesting Company:</span> {request.requesting_company_name}
                      </p>
                      <p>
                        <span className="font-medium">Resources:</span> {request.total_resources} employees
                      </p>
                      <p>
                        <span className="font-medium">Requested:</span> {formatDate(request.requested_at)}
                      </p>
                      {request.responded_at && (
                        <p>
                          <span className="font-medium">Responded:</span> {formatDate(request.responded_at)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action buttons for received requests */}
                  {activeTab === 'received' && request.status === 'pending' && (
                    <button
                      onClick={() => {
                        setRespondingTo(request);
                        setResponseData({ status: '', response: '' });
                      }}
                      className="btn-primary ml-4"
                    >
                      Respond
                    </button>
                  )}
                </div>

                {/* Skills */}
                {request.skills_summary && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Skills Requested:</p>
                    <div className="flex flex-wrap gap-2">
                      {request.skills_summary.split(',').slice(0, 8).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message */}
                {request.message && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-xs text-gray-500 mb-1 font-medium">Request Message:</p>
                    <p className="text-sm text-gray-700">{request.message}</p>
                  </div>
                )}

                {/* Response */}
                {request.response && (
                  <div className="p-3 bg-blue-50 rounded-md">
                    <p className="text-xs text-blue-600 mb-1 font-medium">Response:</p>
                    <p className="text-sm text-gray-700">{request.response}</p>
                  </div>
                )}

                {/* View Listing Link */}
                <div className="mt-4 pt-4 border-t">
                  <a
                    href={`/listings/${request.resource_listing}`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Full Listing →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Response Modal */}
      {respondingTo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Respond to Request
            </h3>

            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-900">{respondingTo.resource_listing_title}</p>
              <p className="text-xs text-gray-600 mt-1">
                From: {respondingTo.requesting_company_name}
              </p>
            </div>

            <form onSubmit={handleRespond} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Decision *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="approved"
                      checked={responseData.status === 'approved'}
                      onChange={(e) => setResponseData(prev => ({ ...prev, status: e.target.value }))}
                      className="mr-2"
                      required
                    />
                    <span className="text-sm">Approve</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="rejected"
                      checked={responseData.status === 'rejected'}
                      onChange={(e) => setResponseData(prev => ({ ...prev, status: e.target.value }))}
                      className="mr-2"
                      required
                    />
                    <span className="text-sm">Reject</span>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-1">
                  Response Message
                </label>
                <textarea
                  id="response"
                  rows="4"
                  value={responseData.response}
                  onChange={(e) => setResponseData(prev => ({ ...prev, response: e.target.value }))}
                  placeholder="Add a message to the requesting company..."
                  className="input w-full"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setRespondingTo(null);
                    setResponseData({ status: '', response: '' });
                  }}
                  className="btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting || !responseData.status}
                >
                  {submitting ? 'Submitting...' : 'Submit Response'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
