'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100">
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
              {user ? (
                <>
                  <Link href="/employees" className="text-gray-700 hover:text-primary-600 font-medium">
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
                  <span className="text-gray-600">
                    {user.first_name} {user.last_name}
                  </span>
                  <button onClick={logout} className="btn btn-secondary">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn btn-secondary">
                    Login
                  </Link>
                  <Link href="/register" className="btn btn-primary">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to BenchList
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A modern platform for managing and sharing bench employee availability across companies.
            Connect talented professionals with opportunities seamlessly.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="card text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">Manage Employees</h3>
            <p className="text-gray-600">
              List and manage your bench employees with detailed profiles, skills, and availability.
            </p>
          </div>

          <div className="card text-center">
            <div className="text-4xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold mb-2">Company Network</h3>
            <p className="text-gray-600">
              Connect with other companies and discover talented professionals ready for new opportunities.
            </p>
          </div>

          <div className="card text-center">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">Request System</h3>
            <p className="text-gray-600">
              Streamlined request and approval workflow for hiring bench employees across organizations.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        {!user && (
          <div className="card bg-primary-600 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg mb-6 opacity-90">
              Join BenchList today and start connecting with talented professionals.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Create Account
              </Link>
              <Link href="/login" className="bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-800 transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        )}

        {user && (
          <div className="card text-center">
            <h2 className="text-3xl font-bold mb-4">Welcome back, {user.first_name}!</h2>
            <p className="text-lg text-gray-600 mb-6">
              What would you like to do today?
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/employees" className="btn btn-primary">
                Browse Employees
              </Link>
              <Link href="/employees/add" className="btn btn-secondary">
                Add Employee
              </Link>
              <Link href="/requests" className="btn btn-secondary">
                View Requests
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white mt-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2025 BenchList. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
