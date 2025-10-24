'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { resourceListingAPI } from '@/lib/api';
import ProfileDropdown from '@/components/ProfileDropdown';

export default function ListingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    status: 'active',
    exclude_own: 'true', // By default, hide own company's listings
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchListings();
    }
  }, [user, currentPage, filters]);

  const fetchListings = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: currentPage,
        search: filters.search || undefined,
        status: filters.status || undefined,
        exclude_own: filters.exclude_own || undefined,
      };

      const response = await resourceListingAPI.getAll(params);
      setListings(response.data.results || response.data);

      if (response.data.count) {
        setTotalPages(Math.ceil(response.data.count / 10));
      }
    } catch (err) {
      console.error('Failed to fetch listings:', err);
      setError('Failed to load resource listings');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchListings();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Resource Listings</h2>
            <p className="mt-1 text-sm text-gray-600">
              Browse available bench resources from companies
            </p>
          </div>
          <a href="/post-resources" className="btn-primary">
            Post Resources
          </a>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by title, company, skills..."
                  className="input w-full"
                />
              </div>
              <div className="w-full md:w-48">
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="input w-full"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <button type="submit" className="btn-primary whitespace-nowrap">
                Search
              </button>
            </div>

            {/* Toggle for showing own company listings */}
            <div className="flex items-center gap-2 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="exclude_own"
                  checked={filters.exclude_own === 'true'}
                  onChange={(e) => {
                    setFilters(prev => ({
                      ...prev,
                      exclude_own: e.target.checked ? 'true' : 'false'
                    }));
                    setCurrentPage(1);
                  }}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-gray-700">
                  Hide my company&apos;s listings (show only from other companies)
                </span>
              </label>
            </div>
          </form>
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
            <div className="text-gray-600">Loading listings...</div>
          </div>
        ) : listings.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">No resource listings found.</p>
            <a href="/post-resources" className="btn-primary mt-4 inline-block">
              Post Your First Listing
            </a>
          </div>
        ) : (
          <>
            {/* Listings Grid */}
            <div className="grid grid-cols-1 gap-6 mb-6">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="card hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/listings/${listing.id}`)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {listing.title}
                        </h3>
                        <span className={`badge-${listing.status} text-xs`}>
                          {listing.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">
                        {listing.company_name}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/listings/${listing.id}`);
                      }}
                      className="btn-primary"
                    >
                      Request
                    </button>
                  </div>

                  {listing.description && (
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                      {listing.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Available Resources</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {listing.total_resources} {listing.total_resources === 1 ? 'Employee' : 'Employees'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Start Date</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(listing.start_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Expected End</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(listing.expected_end_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Location</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {listing.locations || 'Not specified'}
                      </p>
                    </div>
                  </div>

                  {listing.skills_summary && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Skills Available</p>
                      <div className="flex flex-wrap gap-2">
                        {listing.skills_summary.split(',').slice(0, 6).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                        {listing.skills_summary.split(',').length > 6 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{listing.skills_summary.split(',').length - 6} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                      <div>
                        <span className="font-medium">Contact:</span> {listing.company_email}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span> {listing.company_phone || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
