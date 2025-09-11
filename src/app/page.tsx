'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    // Simple validation - in real app, you'd authenticate with backend
    if (email && password) {
      router.push('/home');
    }
  };

  return (
    <div className="max-w-md mx-auto h-screen bg-black flex flex-col justify-center p-6">
      <div className="text-center mb-12">
        <i className="fas fa-shield-halved text-6xl text-amber-300"></i>
        <h1 className="text-4xl font-extrabold tracking-tight mt-4">Apat-Sahay</h1>
        <p className="text-gray-500">Crowdsourced Ocean Hazard Reporting</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-gray-400">Email</label>
          <input 
            type="email" 
            id="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input mt-1 w-full p-3 rounded-xl" 
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium text-gray-400">Password</label>
          <input 
            type="password" 
            id="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input mt-1 w-full p-3 rounded-xl" 
            placeholder="••••••••"
          />
        </div>
      </div>

      <div className="mt-8">
        <button 
          onClick={handleLogin}
          className="primary-btn w-full bg-amber-300 hover:bg-amber-400 text-black font-bold py-3 px-4 rounded-xl"
        >
          Login
        </button>
      </div>

      <div className="text-center mt-6">
        <a href="#" className="text-sm text-amber-300 hover:underline">Forgot Password?</a>
        <p className="text-gray-500 mt-2">
          Don't have an account? 
          <a href="/register" className="text-amber-300 font-semibold hover:underline ml-1">Sign Up</a>
        </p>
      </div>
    </div>
  );
}
