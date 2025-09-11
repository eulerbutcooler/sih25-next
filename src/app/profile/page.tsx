'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserPost {
  id: number;
  image: string;
  type: string;
  date: string;
  status: 'verified' | 'pending' | 'flagged';
}

export default function ProfilePage() {
  const [user] = useState({
    name: 'Amit Singh',
    email: 'amit.singh@example.com',
    role: 'Citizen Reporter',
    avatar: 'https://placehold.co/96x96/18181b/fcd34d?text=AS',
    joinedDate: 'March 2024',
    postsCount: 12,
    upvotes: 4200,
    verified: true
  });

  const [userPosts] = useState<UserPost[]>([
    { id: 1, image: 'https://placehold.co/150x150/000000/FFFFFF?text=Post+1', type: 'Flooding', date: '2 days ago', status: 'verified' },
    { id: 2, image: 'https://placehold.co/150x150/1a202c/FFFFFF?text=Post+2', type: 'Red Tide', date: '5 days ago', status: 'pending' },
    { id: 3, image: 'https://placehold.co/150x150/2d3748/FFFFFF?text=Post+3', type: 'Jellyfish', date: '1 week ago', status: 'verified' },
    { id: 4, image: 'https://placehold.co/150x150/4a5568/FFFFFF?text=Post+4', type: 'Debris', date: '2 weeks ago', status: 'verified' },
    { id: 5, image: 'https://placehold.co/150x150/718096/FFFFFF?text=Post+5', type: 'Oil Spill', date: '3 weeks ago', status: 'flagged' },
    { id: 6, image: 'https://placehold.co/150x150/9ca3af/FFFFFF?text=Post+6', type: 'Erosion', date: '1 month ago', status: 'verified' },
  ]);

  const router = useRouter();

  const handleLogout = () => {
    // In a real app, you'd clear authentication tokens
    router.push('/');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <i className="fas fa-check-circle text-green-400 text-xs"></i>;
      case 'pending':
        return <i className="fas fa-clock text-yellow-400 text-xs"></i>;
      case 'flagged':
        return <i className="fas fa-flag text-red-400 text-xs"></i>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto h-screen bg-black overflow-y-auto pb-20">
      <header className="sticky top-0 bg-black/70 backdrop-blur-lg z-20 p-4 border-b border-gray-800">
        <h1 className="text-xl font-extrabold tracking-tight text-center">Profile</h1>
      </header>

      <div className="p-6">
        {/* User Info */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <img src={user.avatar} className="rounded-full border-4 border-gray-800" alt="User Profile" />
            {user.verified && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                <i className="fas fa-check text-white text-xs"></i>
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold mt-4">{user.name}</h2>
          <p className="text-gray-500">{user.email}</p>
          <p className="text-sm text-amber-300 font-semibold">{user.role}</p>
          <p className="text-xs text-gray-600 mt-1">Joined {user.joinedDate}</p>
          
          <div className="mt-4 flex space-x-8">
            <div className="text-center">
              <p className="text-xl font-bold">{user.postsCount}</p>
              <p className="text-sm text-gray-500">Reports</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{user.upvotes.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Upvotes</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">87%</p>
              <p className="text-sm text-gray-500">Accuracy</p>
            </div>
          </div>
          
          <button className="mt-6 w-full secondary-btn text-white font-bold py-2 px-4 rounded-xl">
            Edit Profile
          </button>
        </div>
        
        {/* Achievement Badges */}
        <div className="mt-8">
          <h3 className="font-bold text-lg mb-4">Achievements</h3>
          <div className="flex space-x-2 overflow-x-auto">
            <div className="flex-shrink-0 bg-amber-900/30 border border-amber-600 rounded-lg p-3 text-center min-w-[80px]">
              <i className="fas fa-medal text-amber-400 text-xl"></i>
              <p className="text-xs text-amber-300 mt-1">First Report</p>
            </div>
            <div className="flex-shrink-0 bg-green-900/30 border border-green-600 rounded-lg p-3 text-center min-w-[80px]">
              <i className="fas fa-shield-alt text-green-400 text-xl"></i>
              <p className="text-xs text-green-300 mt-1">Verified</p>
            </div>
            <div className="flex-shrink-0 bg-blue-900/30 border border-blue-600 rounded-lg p-3 text-center min-w-[80px]">
              <i className="fas fa-star text-blue-400 text-xl"></i>
              <p className="text-xs text-blue-300 mt-1">Top Reporter</p>
            </div>
          </div>
        </div>
        
        {/* My Reports */}
        <div className="mt-8">
          <h3 className="font-bold text-lg mb-4">My Reports</h3>
          <div className="grid grid-cols-3 gap-1">
            {userPosts.map((post) => (
              <div key={post.id} className="relative">
                <img 
                  src={post.image} 
                  className="w-full h-full object-cover rounded-md post-thumbnail aspect-square" 
                  alt="User post" 
                />
                <div className="absolute top-1 right-1 bg-black/70 backdrop-blur-lg rounded-full p-1">
                  {getStatusIcon(post.status)}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 rounded-b-md">
                  <p className="text-xs text-white font-semibold">{post.type}</p>
                  <p className="text-xs text-gray-300">{post.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settings Section */}
        <div className="mt-8 space-y-3">
          <h3 className="font-bold text-lg mb-4">Settings</h3>
          
          <button className="w-full secondary-btn text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <i className="fas fa-bell text-gray-400"></i>
              <span>Notifications</span>
            </div>
            <i className="fas fa-chevron-right text-gray-400"></i>
          </button>

          <button className="w-full secondary-btn text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <i className="fas fa-shield-alt text-gray-400"></i>
              <span>Privacy & Security</span>
            </div>
            <i className="fas fa-chevron-right text-gray-400"></i>
          </button>

          <button className="w-full secondary-btn text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <i className="fas fa-question-circle text-gray-400"></i>
              <span>Help & Support</span>
            </div>
            <i className="fas fa-chevron-right text-gray-400"></i>
          </button>

          <button className="w-full secondary-btn text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <i className="fas fa-info-circle text-gray-400"></i>
              <span>About</span>
            </div>
            <i className="fas fa-chevron-right text-gray-400"></i>
          </button>
        </div>

        {/* Logout Button */}
        <div className="mt-8">
          <button 
            onClick={handleLogout}
            className="w-full secondary-btn text-red-500 hover:text-red-400 font-bold py-3 px-4 rounded-xl"
          >
            <i className="fas fa-sign-out-alt mr-2"></i>
            Logout
          </button>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-black/70 backdrop-blur-lg border-t border-gray-800 flex justify-around p-2">
        <Link href="/home" className="text-gray-400 flex flex-col items-center justify-center w-full text-center p-2 rounded-lg">
          <i className="fas fa-home text-xl"></i>
          <span className="text-xs mt-1 font-semibold">Home</span>
        </Link>
        <Link href="/map" className="text-gray-400 flex flex-col items-center justify-center w-full text-center p-2 rounded-lg">
          <i className="fas fa-map-marked-alt text-xl"></i>
          <span className="text-xs mt-1 font-semibold">Map</span>
        </Link>
        <Link href="/messages" className="text-gray-400 flex flex-col items-center justify-center w-full text-center p-2 rounded-lg">
          <i className="fas fa-comments text-xl"></i>
          <span className="text-xs mt-1 font-semibold">Messages</span>
        </Link>
        <Link href="/profile" className="text-amber-300 flex flex-col items-center justify-center w-full text-center p-2 rounded-lg">
          <i className="fas fa-user-circle text-xl"></i>
          <span className="text-xs mt-1 font-semibold">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
