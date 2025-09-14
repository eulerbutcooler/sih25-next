'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'citizen',
    organization: '',
    agreeToTerms: false
  });
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleRegister = () => {
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.password) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    if (!formData.agreeToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    // In a real app, you'd send this data to your backend
    router.push('/home');
  };

  return (
    <div className="max-w-180 mx-auto h-screen bg-black overflow-y-auto p-6">
      <div className="text-center mb-8">
        <i className="fas fa-shield-halved text-5xl text-amber-300"></i>
        <h1 className="text-3xl font-extrabold tracking-tight mt-4">Join Apat-Sahay</h1>
        <p className="text-gray-500">Help protect our oceans together</p>
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="text-sm font-medium text-gray-400">Full Name</label>
          <input 
            type="text" 
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className="form-input mt-1 w-full p-3 rounded-xl" 
            placeholder="Your full name"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="text-sm font-medium text-gray-400">Email</label>
          <input 
            type="email" 
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="form-input mt-1 w-full p-3 rounded-xl" 
            placeholder="you@example.com"
          />
        </div>

        {/* Role Selection */}
        <div>
          <label htmlFor="role" className="text-sm font-medium text-gray-400">Role</label>
          <select 
            id="role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="form-input mt-1 w-full p-3 rounded-xl"
          >
            <option value="citizen">Citizen Reporter</option>
            <option value="official">Government Official</option>
            <option value="emergency">Emergency Services</option>
            <option value="scientist">Marine Scientist</option>
            <option value="authority">Port Authority</option>
          </select>
        </div>

        {/* Organization (conditional) */}
        {(formData.role !== 'citizen') && (
          <div>
            <label htmlFor="organization" className="text-sm font-medium text-gray-400">Organization</label>
            <input 
              type="text" 
              id="organization"
              name="organization"
              value={formData.organization}
              onChange={handleInputChange}
              className="form-input mt-1 w-full p-3 rounded-xl" 
              placeholder="Your organization name"
            />
          </div>
        )}

        {/* Password */}
        <div>
          <label htmlFor="password" className="text-sm font-medium text-gray-400">Password</label>
          <input 
            type="password" 
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="form-input mt-1 w-full p-3 rounded-xl" 
            placeholder="••••••••"
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-400">Confirm Password</label>
          <input 
            type="password" 
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="form-input mt-1 w-full p-3 rounded-xl" 
            placeholder="••••••••"
          />
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="agreeToTerms"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleInputChange}
            className="mt-1"
          />
          <label htmlFor="agreeToTerms" className="text-sm text-gray-400">
            I agree to the{' '}
            <a href="#" className="text-amber-300 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-amber-300 hover:underline">Privacy Policy</a>
          </label>
        </div>
      </div>

      {/* Role Benefits */}
      <div className="mt-6 p-4 bg-gray-900 rounded-xl border border-gray-800">
        <h3 className="text-sm font-semibold text-amber-300 mb-2">
          {formData.role === 'citizen' && 'Citizen Reporter Benefits:'}
          {formData.role === 'official' && 'Government Official Features:'}
          {formData.role === 'emergency' && 'Emergency Services Tools:'}
          {formData.role === 'scientist' && 'Scientist Resources:'}
          {formData.role === 'authority' && 'Authority Dashboard:'}
        </h3>
        <ul className="text-xs text-gray-400 space-y-1">
          {formData.role === 'citizen' && (
            <>
              <li>• Report ocean hazards and incidents</li>
              <li>• Access to real-time hazard maps</li>
              <li>• Connect with emergency services</li>
              <li>• Earn community recognition badges</li>
            </>
          )}
          {formData.role === 'official' && (
            <>
              <li>• Flag reports as verified/fake</li>
              <li>• Access to administrative dashboard</li>
              <li>• Coordinate emergency responses</li>
              <li>• Generate official reports</li>
            </>
          )}
          {formData.role === 'emergency' && (
            <>
              <li>• Priority notifications for emergencies</li>
              <li>• Direct communication with reporters</li>
              <li>• Resource allocation tools</li>
              <li>• Incident tracking system</li>
            </>
          )}
          {formData.role === 'scientist' && (
            <>
              <li>• Access to research data</li>
              <li>• Contribute to hazard analysis</li>
              <li>• Collaborate with other experts</li>
              <li>• Data visualization tools</li>
            </>
          )}
          {formData.role === 'authority' && (
            <>
              <li>• Monitor port area incidents</li>
              <li>• Issue safety advisories</li>
              <li>• Coordinate with coast guard</li>
              <li>• Manage maritime traffic alerts</li>
            </>
          )}
        </ul>
      </div>

      {/* Register Button */}
      <div className="mt-6">
        <button 
          onClick={handleRegister}
          className="primary-btn w-full bg-amber-300 hover:bg-amber-400 text-black font-bold py-3 px-4 rounded-xl"
        >
          Create Account
        </button>
      </div>

      {/* Login Link */}
      <div className="text-center mt-6">
        <p className="text-gray-500">
          Already have an account? 
          <Link href="/" className="text-amber-300 font-semibold hover:underline ml-1">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
