'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Post {
  id: number;
  author: string;
  location: string;
  time: string;
  content: string;
  image: string;
  likes: number;
  comments: number;
  status: 'verified' | 'pending' | 'flagged';
}

export default function HomePage() {
  const [posts] = useState<Post[]>([
    {
      id: 1,
      author: 'Amit Singh',
      location: 'Mumbai Coast, MH',
      time: '15m ago',
      content: 'Heavy flooding due to high tide near Marine Drive. Water is about waist-deep. Avoid this area. Strong currents detected.',
      image: 'https://placehold.co/600x400/000000/FFFFFF?text=Ocean+Flooding',
      likes: 214,
      comments: 32,
      status: 'verified'
    },
    {
      id: 2,
      author: 'Riya Sharma',
      location: 'Goa Beach, GA',
      time: '1h ago',
      content: 'Red tide warning! Unusual water coloration spotted near Calangute Beach. Marine life distress observed. Swimmers advised to stay out.',
      image: 'https://placehold.co/600x400/8B0000/FFFFFF?text=Red+Tide+Alert',
      likes: 98,
      comments: 12,
      status: 'pending'
    },
    {
      id: 3,
      author: 'Dr. Priya Nair',
      location: 'Kochi Harbor, KL',
      time: '2h ago',
      content: 'Jellyfish bloom detected in coastal waters. Multiple stings reported. Beach authorities have been notified. Exercise extreme caution.',
      image: 'https://placehold.co/600x400/4169E1/FFFFFF?text=Jellyfish+Warning',
      likes: 156,
      comments: 24,
      status: 'verified'
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <div className="flex items-center space-x-2 bg-green-900/50 text-green-300 px-3 py-1 rounded-full text-xs font-semibold">
            <i className="fas fa-check-circle"></i>
            <span>Verified</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center space-x-2 bg-yellow-900/50 text-yellow-300 px-3 py-1 rounded-full text-xs font-semibold">
            <i className="fas fa-clock"></i>
            <span>Pending</span>
          </div>
        );
      case 'flagged':
        return (
          <div className="flex items-center space-x-2 bg-red-900/50 text-red-300 px-3 py-1 rounded-full text-xs font-semibold">
            <i className="fas fa-flag"></i>
            <span>Flagged</span>
          </div>
        );
      default:
        return null;
    }
  };

  
  return (
  <div className="h-screen bg-black overflow-y-auto relative pb-20">
    {/* Header */}
    <header className="sticky top-0 left-0 right-0 max-w-400 mx-auto bg-black border-b border-[#27272a] flex justify-between items-center p-4 z-10">
      <h1 className="text-xl font-extrabold tracking-tight">Ocean Watch</h1>
      <div className="flex items-center space-x-5">
        <i className="fas fa-search text-gray-400 cursor-pointer icon-btn"></i>
        <i className="fas fa-bell text-gray-400 cursor-pointer icon-btn"></i>
      </div>
    </header>

    {/* Feed Content */}
    <div
      id="app-container"
      className="max-w-180 mx-auto pt-10 p-2 sm:p-4 space-y-3"
    >
      {posts.map((post) => (
        <div key={post.id} className="post-card bg-black rounded-xl overflow-hidden">
          <div className="p-4">
            <div className="flex items-start space-x-4">
              <img
                src={`https://placehold.co/48x48/18181b/fcd34d?text=${post.author
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}`}
                className="rounded-full"
                alt="User Avatar"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">{post.author}</p>
                    <p className="text-sm text-gray-500">
                      {post.location} &bull; {post.time}
                    </p>
                  </div>
                  {getStatusBadge(post.status)}
                </div>
                <p className="text-gray-300 mt-3">{post.content}</p>
              </div>
            </div>
          </div>
          <img src={post.image} className="w-full h-auto" alt="Post content" />
          <div className="p-4">
            <div className="flex justify-around items-center text-gray-500">
              <button className="icon-btn flex items-center space-x-2 text-sm">
                <i className="far fa-thumbs-up fa-lg"></i>
                <span>{post.likes}</span>
              </button>
              <button className="icon-btn flex items-center space-x-2 text-sm">
                <i className="far fa-comment-dots fa-lg"></i>
                <span>{post.comments}</span>
              </button>
              <button className="icon-btn flex items-center space-x-2 text-sm">
                <i className="far fa-share-square fa-lg"></i>
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Floating Action Button */}
    <Link href="/create-post">
      <button className="fab fixed bottom-24 right-6 bg-amber-300 text-black w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-amber-400">
        <i className="fas fa-plus"></i>
      </button>
    </Link>

    {/* Bottom Navbar */}
    <nav className="fixed bottom-0 left-0 right-0 max-w-400 mx-auto bg-black border-t border-[#27272a] flex justify-around p-2">
      <Link
        href="/home"
        className="text-amber-300 flex flex-col items-center justify-center w-full text-center p-2 py-4 rounded-lg"
      >
        <i className="fas fa-home text-xl"></i>
      </Link>
      <Link
        href="/map"
        className="text-gray-400 flex flex-col items-center justify-center w-full text-center p-2 py-4 rounded-lg"
      >
        <i className="fas fa-map-marked-alt text-xl"></i>
      </Link>
      <Link
        href="/messages"
        className="text-gray-400 flex flex-col items-center justify-center w-full text-center py-4 p-2 rounded-lg"
      >
        <i className="fas fa-comments text-xl"></i>
      </Link>
      <Link
        href="/profile"
        className="text-gray-400 flex flex-col items-center justify-center w-full text-center py-4 p-2 rounded-lg"
      >
        <i className="fas fa-user-circle text-xl"></i>
      </Link>
    </nav>
  </div>
);

  
}
