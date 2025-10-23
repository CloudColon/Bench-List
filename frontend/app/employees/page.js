'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { employeeAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import ProfileDropdown from '@/components/ProfileDropdown';

export default function EmployeesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    experience_level: '',
    search: '',
    ordering: '-created_at',
  });
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchEmployees();
    }
  }, [user, filters, currentPage]);

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        page: currentPage,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        ),
      };

      const response = await employeeAPI.getAll(params);
      setEmployees(response.data.results);
      setPagination({
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
      });
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setError('Failed to load employees. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setFilters(prev => ({
      ...prev,
      search: value
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      experience_level: '',
      search: '',
      ordering: '-created_at',
    });
    setCurrentPage(1);
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bench Employees</h1>
            <p className="text-gray-600 mt-2">
              Browse and manage bench employees across companies
            </p>
          </div>
          <Link href="/employees/add" className="btn btn-primary">
            + Add Employee
          </Link>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                name="search"
                placeholder="Search by name, skills, job title..."
                value={filters.search}
                onChange={handleSearchChange}
                className="input"
              />
            </div>

            <div className="min-w-[150px]">
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="input"
              >
                <option value="">All Status</option>
                <option value="available">Available</option>
                <option value="requested">Requested</option>
                <option value="allocated">Allocated</option>
              </select>
            </div>

            <div className="min-w-[150px]">
              <select
                name="experience_level"
                value={filters.experience_level}
                onChange={handleFilterChange}
                className="input"
              >
                <option value="">All Levels</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid-Level</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
              </select>
            </div>

            <div className="min-w-[150px]">
              <select
                name="ordering"
                value={filters.ordering}
                onChange={handleFilterChange}
                className="input"
              >
                <option value="-created_at">Newest First</option>
                <option value="created_at">Oldest First</option>
                <option value="bench_start_date">Bench Start Date</option>
                <option value="experience_years">Experience (Low-High)</option>
                <option value="-experience_years">Experience (High-Low)</option>
              </select>
            </div>

            <button
              onClick={clearFilters}
              className="btn btn-secondary whitespace-nowrap"
            >
              Clear Filters
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
            <p className="mt-4 text-gray-600">Loading employees...</p>
          </div>
        )}

        {/* Employee List */}
        {!loading && employees.length === 0 && (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">👤</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No employees found</h3>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.status || filters.experience_level
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by adding your first bench employee.'}
            </p>
            <Link href="/employees/add" className="btn btn-primary">
              Add Employee
            </Link>
          </div>
        )}

        {!loading && employees.length > 0 && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {employees.map((employee) => (
                <div key={employee.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {employee.full_name}
                      </h3>
                      <p className="text-sm text-gray-600">{employee.job_title}</p>
                    </div>
                    <span className={`badge ${getStatusBadgeClass(employee.status)}`}>
                      {employee.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium w-24">Company:</span>
                      <span>{employee.company_name}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium w-24">Experience:</span>
                      <span>{employee.experience_years} years</span>
                      <span className={`badge ml-2 ${getExperienceBadgeClass(employee.experience_level)}`}>
                        {employee.experience_level}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium w-24">Email:</span>
                      <span className="truncate">{employee.email}</span>
                    </div>
                    {employee.bench_start_date && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium w-24">Bench Since:</span>
                        <span>{new Date(employee.bench_start_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {employee.skills && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Skills:</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{employee.skills}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <Link
                      href={`/employees/${employee.id}`}
                      className="flex-1 btn btn-secondary text-center"
                    >
                      View Details
                    </Link>
                    {employee.status === 'available' && (
                      <Link
                        href={`/requests/create?employee=${employee.id}`}
                        className="flex-1 btn btn-primary text-center"
                      >
                        Request
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {(pagination.next || pagination.previous) && (
              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={!pagination.previous}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!pagination.next}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
