'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI, companyAPI } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [companies, setCompanies] = useState([]);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [userForm, setUserForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password2: ''
  });

  const [companyForm, setCompanyForm] = useState({
    company_name: '',
    company_email: '',
    company_phone: '',
    company_address: '',
    company_website: '',
    company_description: ''
  });

  const [adminForm, setAdminForm] = useState({
    company: '',
    message: ''
  });

  useEffect(() => {
    if (role === 'admin') {
      fetchCompanies();
    }
  }, [role]);

  const fetchCompanies = async () => {
    try {
      const response = await companyAPI.getAll();
      setCompanies(response.data.results || response.data);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
    setError('');
  };

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleCompanyFormChange = (e) => {
    const { name, value } = e.target;
    setCompanyForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleAdminFormChange = (e) => {
    const { name, value } = e.target;
    setAdminForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateUserDetails = () => {
    if (!userForm.first_name.trim()) {
      setError('First name is required.');
      return false;
    }
    if (!userForm.last_name.trim()) {
      setError('Last name is required.');
      return false;
    }
    if (!userForm.email.trim()) {
      setError('Email is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userForm.email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!userForm.password) {
      setError('Password is required.');
      return false;
    }
    if (userForm.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return false;
    }
    if (userForm.password !== userForm.password2) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleUserDetailsNext = (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors
    if (validateUserDetails()) {
      // Auto-fill company email with user email for Company User
      if (role === 'company_user') {
        setCompanyForm(prev => ({
          ...prev,
          company_email: userForm.email
        }));
      }
      setStep(3);
    }
  };

  const validateCompanyDetails = () => {
    if (!companyForm.company_name.trim()) {
      setError('Company name is required.');
      return false;
    }
    if (!companyForm.company_email.trim()) {
      setError('Company email is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(companyForm.company_email)) {
      setError('Please enter a valid company email address.');
      return false;
    }
    if (companyForm.company_website && companyForm.company_website.trim()) {
      try {
        new URL(companyForm.company_website);
      } catch (e) {
        setError('Please enter a valid website URL (e.g., https://example.com).');
        return false;
      }
    }
    return true;
  };

  const validateAdminSelection = () => {
    if (!adminForm.company) {
      setError('Please select a company.');
      return false;
    }
    return true;
  };

  const handleCompanyUserSubmit = async (e) => {
    e.preventDefault();
    if (!validateCompanyDetails()) return;

    setLoading(true);
    setError('');

    try {
      // Normalize email to lowercase
      const submitData = {
        ...userForm,
        email: userForm.email.toLowerCase().trim(),
        ...companyForm,
        company_email: companyForm.company_email.toLowerCase().trim()
      };

      console.log('Submitting registration:', { ...submitData, password: '[HIDDEN]', password2: '[HIDDEN]' });

      await authAPI.registerCompanyUser(submitData);
      setSuccess(true);
      setSuccessMessage('Registration successful! You can now login with your credentials.');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      console.error('Registration failed:', err);
      console.error('Error response:', err.response?.data);

      if (err.response?.data) {
        const errorMessages = [];
        Object.keys(err.response.data).forEach(key => {
          const value = err.response.data[key];
          if (Array.isArray(value)) {
            errorMessages.push(`${key.replace('_', ' ')}: ${value.join(', ')}`);
          } else {
            errorMessages.push(`${key.replace('_', ' ')}: ${value}`);
          }
        });
        setError(errorMessages.join(' | '));
      } else if (err.message) {
        setError(`Registration failed: ${err.message}`);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (!validateAdminSelection()) return;

    setLoading(true);
    setError('');

    try {
      // Normalize email to lowercase
      const submitData = {
        ...userForm,
        email: userForm.email.toLowerCase().trim(),
        company: parseInt(adminForm.company),
        message: adminForm.message
      };

      console.log('Submitting admin registration:', { ...submitData, password: '[HIDDEN]', password2: '[HIDDEN]' });

      await authAPI.registerAdmin(submitData);
      setSuccess(true);
      setSuccessMessage('Registration submitted! The company will approve your request shortly. You will be notified via email once approved.');
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      console.error('Registration failed:', err);
      console.error('Error response:', err.response?.data);

      if (err.response?.data) {
        const errorMessages = [];
        Object.keys(err.response.data).forEach(key => {
          const value = err.response.data[key];
          if (Array.isArray(value)) {
            errorMessages.push(`${key.replace('_', ' ')}: ${value.join(', ')}`);
          } else {
            errorMessages.push(`${key.replace('_', ' ')}: ${value}`);
          }
        });
        setError(errorMessages.join(' | '));
      } else if (err.message) {
        setError(`Registration failed: ${err.message}`);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Success!</h2>
          <p className="text-gray-600 mb-4">{successMessage}</p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">BenchList</h1>
          <p className="text-gray-600">Create your account</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className={`flex items-center ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-300'}`}>1</div>
              <span className="ml-2 text-sm font-medium">Role</span>
            </div>
            <div className={`w-12 h-0.5 mx-4 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-300'}`}>2</div>
              <span className="ml-2 text-sm font-medium">Details</span>
            </div>
            <div className={`w-12 h-0.5 mx-4 ${step >= 3 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-300'}`}>3</div>
              <span className="ml-2 text-sm font-medium">Company</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {step === 1 && (
          <div className="card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select Your Role</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <button onClick={() => handleRoleSelect('company_user')} className="p-6 border-2 border-gray-300 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-all text-left">
                <div className="text-4xl mb-3">🏢</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Company User</h3>
                <p className="text-sm text-gray-600">Register your company and manage bench employees</p>
              </button>
              <button onClick={() => handleRoleSelect('admin')} className="p-6 border-2 border-gray-300 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-all text-left">
                <div className="text-4xl mb-3">👤</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin</h3>
                <p className="text-sm text-gray-600">Request access to manage an existing company</p>
              </button>
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">Already have an account? <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">Login here</Link></p>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleUserDetailsNext} className="card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Details</h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name <span className="text-red-500">*</span></label>
                  <input type="text" name="first_name" value={userForm.first_name} onChange={handleUserFormChange} className="input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name <span className="text-red-500">*</span></label>
                  <input type="text" name="last_name" value={userForm.last_name} onChange={handleUserFormChange} className="input" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                <input type="email" name="email" value={userForm.email} onChange={handleUserFormChange} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password <span className="text-red-500">*</span></label>
                <input type="password" name="password" value={userForm.password} onChange={handleUserFormChange} className="input" required minLength={8} />
                <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password <span className="text-red-500">*</span></label>
                <input type="password" name="password2" value={userForm.password2} onChange={handleUserFormChange} className="input" required minLength={8} />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button type="button" onClick={() => { setStep(1); setRole(''); }} className="btn btn-secondary flex-1">Back</button>
              <button type="submit" className="btn btn-primary flex-1">Next</button>
            </div>
          </form>
        )}

        {step === 3 && role === 'company_user' && (
          <form onSubmit={handleCompanyUserSubmit} className="card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Company Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name <span className="text-red-500">*</span></label>
                <input type="text" name="company_name" value={companyForm.company_name} onChange={handleCompanyFormChange} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Email <span className="text-red-500">*</span></label>
                <input type="email" name="company_email" value={companyForm.company_email} onChange={handleCompanyFormChange} className="input" required />
                <p className="text-xs text-gray-500 mt-1">Pre-filled from your email. You can change it if needed.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input type="tel" name="company_phone" value={companyForm.company_phone} onChange={handleCompanyFormChange} className="input" placeholder="+1 (555) 123-4567" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input type="url" name="company_website" value={companyForm.company_website} onChange={handleCompanyFormChange} className="input" placeholder="https://www.company.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea name="company_address" value={companyForm.company_address} onChange={handleCompanyFormChange} className="input" rows="2" placeholder="Street address, City, State, ZIP, Country" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea name="company_description" value={companyForm.company_description} onChange={handleCompanyFormChange} className="input" rows="3" placeholder="Brief description of the company..." />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button type="button" onClick={() => setStep(2)} className="btn btn-secondary flex-1">Back</button>
              <button type="submit" disabled={loading} className="btn btn-primary flex-1 disabled:opacity-50">{loading ? 'Registering...' : 'Complete Registration'}</button>
            </div>
          </form>
        )}

        {step === 3 && role === 'admin' && (
          <form onSubmit={handleAdminSubmit} className="card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select Company</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company <span className="text-red-500">*</span></label>
                <select name="company" value={adminForm.company} onChange={handleAdminFormChange} className="input" required>
                  <option value="">Select a company...</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Request will be sent to the company owner for approval</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                <textarea name="message" value={adminForm.message} onChange={handleAdminFormChange} className="input" rows="4" placeholder="Why do you want to join this company?..." />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button type="button" onClick={() => setStep(2)} className="btn btn-secondary flex-1">Back</button>
              <button type="submit" disabled={loading} className="btn btn-primary flex-1 disabled:opacity-50">{loading ? 'Submitting Request...' : 'Submit Request'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
