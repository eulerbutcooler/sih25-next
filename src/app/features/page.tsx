'use client';

import Link from 'next/link';

export default function FeaturesPage() {
  const features = [
    {
      title: 'Login System',
      description: 'Secure authentication with role-based access',
      path: '/',
      icon: 'fas fa-sign-in-alt',
      color: 'bg-blue-600'
    },
    {
      title: 'Register',
      description: 'Multi-role registration for citizens and officials',
      path: '/register',
      icon: 'fas fa-user-plus',
      color: 'bg-green-600'
    },
    {
      title: 'Home Feed',
      description: 'Social media feed with ocean hazard reports',
      path: '/home',
      icon: 'fas fa-home',
      color: 'bg-amber-600'
    },
    {
      title: 'Hazard Map',
      description: 'Interactive map showing danger hotspots',
      path: '/map',
      icon: 'fas fa-map-marked-alt',
      color: 'bg-red-600'
    },
    {
      title: 'Report Hazard',
      description: 'Create new ocean hazard reports with photos',
      path: '/create-post',
      icon: 'fas fa-exclamation-triangle',
      color: 'bg-orange-600'
    },
    {
      title: 'Messages',
      description: 'Direct messaging with authorities and experts',
      path: '/messages',
      icon: 'fas fa-comments',
      color: 'bg-purple-600'
    },
    {
      title: 'Profile',
      description: 'User profile with achievements and settings',
      path: '/profile',
      icon: 'fas fa-user-circle',
      color: 'bg-indigo-600'
    },
    {
      title: 'Admin Dashboard',
      description: 'Government official dashboard for report verification',
      path: '/admin',
      icon: 'fas fa-shield-alt',
      color: 'bg-gray-600'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto min-h-screen bg-black p-6">
      <div className="text-center mb-12">
        <i className="fas fa-shield-halved text-6xl text-amber-300 mb-4"></i>
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Apat-Sahay</h1>
        <p className="text-xl text-gray-400 mb-2">Ocean Hazard Reporting Platform</p>
        <p className="text-gray-500">Explore all features of our comprehensive safety application</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {features.map((feature, index) => (
          <Link key={index} href={feature.path}>
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-amber-300 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer">
              <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <i className={`${feature.icon} text-white text-xl`}></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
              <div className="mt-4 flex items-center text-amber-300 text-sm font-semibold">
                <span>Explore</span>
                <i className="fas fa-arrow-right ml-2"></i>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Key Features</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-amber-300 mb-3">For Citizens</h3>
            <ul className="space-y-2 text-gray-400">
              <li>• Report ocean hazards with photos/videos</li>
              <li>• View real-time hazard maps</li>
              <li>• Connect with emergency services</li>
              <li>• Access community safety feed</li>
              <li>• Receive emergency alerts</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-300 mb-3">For Officials</h3>
            <ul className="space-y-2 text-gray-400">
              <li>• Verify and flag reports</li>
              <li>• Coordinate emergency responses</li>
              <li>• Manage incident dashboard</li>
              <li>• Generate safety advisories</li>
              <li>• Track response analytics</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-900/30 to-red-900/30 rounded-xl p-8 border border-amber-600/30 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Emergency Contacts</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-red-600 text-white py-3 px-4 rounded-lg font-semibold">
            <i className="fas fa-phone mb-2 block text-xl"></i>
            Emergency: 112
          </div>
          <div className="bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold">
            <i className="fas fa-life-ring mb-2 block text-xl"></i>
            Coast Guard: 1554
          </div>
          <div className="bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold">
            <i className="fas fa-anchor mb-2 block text-xl"></i>
            Marine Police
          </div>
        </div>
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-500">
          Built for Smart India Hackathon 2025 • Ocean Safety & Community Protection
        </p>
      </div>
    </div>
  );
}
