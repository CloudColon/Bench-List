'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ProfileDropdown from '@/components/ProfileDropdown';

// Mock data for resource requests (stub UI)
const mockRequests = [
  {
    id: 1,
    company: 'BAC',
    companyFullName: 'Bank of America Corporation',
    requested: 5,
    roles: [
      { name: 'Python Developer', count: 2 },
      { name: 'Java Developer', count: 3 }
    ],
    expectedDate: '2025-11-04',
    status: 'pending',
    description: 'Looking for experienced developers for a new banking application project.',
    priority: 'high',
    location: 'New York, NY',
    duration: '6 months'
  },
  {
    id: 2,
    company: 'Google',
    companyFullName: 'Google LLC',
    requested: 3,
    roles: [
      { name: 'React Developer', count: 2 },
      { name: 'DevOps Engineer', count: 1 }
    ],
    expectedDate: '2025-11-15',
    status: 'pending',
    description: 'Need frontend developers and DevOps engineer for cloud migration project.',
    priority: 'medium',
    location: 'Mountain View, CA',
    duration: '3 months'
  },
  {
    id: 3,
    company: 'Microsoft',
    companyFullName: 'Microsoft Corporation',
    requested: 4,
    roles: [
      { name: 'Full Stack Developer', count: 2 },
      { name: 'UI/UX Designer', count: 1 },
      { name: 'QA Engineer', count: 1 }
    ],
    expectedDate: '2025-11-20',
    status: 'approved',
    description: 'Azure platform enhancement team expansion.',
    priority: 'high',
    location: 'Redmond, WA',
    duration: '12 months'
  },
  {
    id: 4,
    company: 'Amazon',
    companyFullName: 'Amazon.com, Inc.',
    requested: 6,
    roles: [
      { name: 'Backend Developer', count: 3 },
      { name: 'Data Engineer', count: 2 },
      { name: 'ML Engineer', count: 1 }
    ],
    expectedDate: '2025-12-01',
    status: 'pending',
    description: 'E-commerce platform scaling and machine learning integration.',
    priority: 'high',
    location: 'Seattle, WA',
    duration: '9 months'
  },
  {
    id: 5,
    company: 'Apple',
    companyFullName: 'Apple Inc.',
    requested: 2,
    roles: [
      { name: 'iOS Developer', count: 2 }
    ],
    expectedDate: '2025-11-10',
    status: 'rejected',
    description: 'iOS app development for internal tools.',
    priority: 'low',
    location: 'Cupertino, CA',
    duration: '4 months'
  },
  {
    id: 6,
    company: 'Tesla',
    companyFullName: 'Tesla, Inc.',
    requested: 3,
    roles: [
      { name: 'Embedded Systems Engineer', count: 2 },
      { name: 'Software Engineer', count: 1 }
    ],
    expectedDate: '2025-11-25',
    status: 'pending',
    description: 'Autopilot software development team.',
    priority: 'medium',
    location: 'Palo Alto, CA',
    duration: '8 months'
  }
];

export default function RequestsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

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

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = mockRequests.filter(request => {
    // Filter by status
    if (filter !== 'all' && request.status !== filter) {
      return false;
    }
    // Filter by search query
    if (searchQuery && !request.company.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !request.companyFullName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

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
              <Link href="/requests" className="text-primary-600 font-medium">
                Requests
              </Link>
              {user?.role === 'company_user' && (
                <Link href="/admin-requests" className="text-gray-700 hover:text-primary-600 font-medium">
                  Admin Requests
                </Link>
              )}
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
          <h1 className="text-3xl font-bold text-gray-900">Resource Requests</h1>
          <p className="text-gray-600 mt-2">
            View and manage resource requests from different companies
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This is a preview UI with mock data. API integration coming soon!
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by company name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({mockRequests.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'pending'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending ({mockRequests.filter(r => r.status === 'pending').length})
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'approved'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Approved ({mockRequests.filter(r => r.status === 'approved').length})
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'rejected'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Rejected ({mockRequests.filter(r => r.status === 'rejected').length})
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredRequests.length === 0 && (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search query.' : 'No resource requests match your filters.'}
            </p>
          </div>
        )}

        {/* Request Cards */}
        {filteredRequests.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
              <div key={request.id} className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedRequest(request)}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{request.company}</h3>
                    <p className="text-sm text-gray-600">{request.companyFullName}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                      {request.status}
                    </span>
                    <span className={`badge text-xs ${getPriorityBadgeClass(request.priority)}`}>
                      {request.priority}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="font-medium">Requested: {request.requested} resources</span>
                  </div>

                  <div className="flex items-start text-sm text-gray-600 mb-2">
                    <svg className="w-5 h-5 mr-2 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-1">
                      <span className="font-medium">Roles:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {request.roles.map((role, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                            {role.count} {role.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>
                      <span className="font-medium">Expected:</span> {new Date(request.expectedDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{request.location}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      <span className="font-medium">Duration:</span> {request.duration}
                    </span>
                  </div>
                </div>

                {request.description && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 line-clamp-2">{request.description}</p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="w-full btn btn-primary text-sm">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedRequest(null)}>
            <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">{selectedRequest.company}</h2>
                  <p className="text-gray-600">{selectedRequest.companyFullName}</p>
                </div>
                <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <span className={`badge ${getStatusBadgeClass(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                  <span className={`badge ${getPriorityBadgeClass(selectedRequest.priority)}`}>
                    {selectedRequest.priority} priority
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedRequest.description}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Resources Requested</h3>
                  <p className="text-2xl font-bold text-gray-900">{selectedRequest.requested} professionals</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Required Roles</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.roles.map((role, idx) => (
                      <div key={idx} className="px-4 py-2 bg-primary-100 text-primary-800 rounded-lg">
                        <span className="font-semibold">{role.count}x</span> {role.name}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Expected Start Date</h3>
                    <p className="text-gray-900">
                      {new Date(selectedRequest.expectedDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Duration</h3>
                    <p className="text-gray-900">{selectedRequest.duration}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Location</h3>
                    <p className="text-gray-900">{selectedRequest.location}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Priority</h3>
                    <p className="text-gray-900 capitalize">{selectedRequest.priority}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex gap-4">
                    <button className="btn btn-primary flex-1">
                      Respond to Request
                    </button>
                    <button className="btn btn-secondary flex-1" onClick={() => setSelectedRequest(null)}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
