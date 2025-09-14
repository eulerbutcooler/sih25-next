'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Conversation {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  role?: string;
  online: boolean;
}

export default function MessagesPage() {
  const [conversations] = useState<Conversation[]>([
    {
      id: 1,
      name: 'Coast Guard Mumbai',
      avatar: 'https://placehold.co/48x48/1e40af/ffffff?text=CG',
      lastMessage: 'Report received. Rescue team dispatched to Marine Drive.',
      timestamp: '2m ago',
      unread: 1,
      role: 'Official',
      online: true
    },
    {
      id: 2,
      name: 'Dr. Priya Nair',
      avatar: 'https://placehold.co/48x48/059669/ffffff?text=PN',
      lastMessage: 'Thank you for the jellyfish bloom report. Very helpful!',
      timestamp: '15m ago',
      unread: 0,
      role: 'Marine Biologist',
      online: true
    },
    {
      id: 3,
      name: 'Emergency Response Team',
      avatar: 'https://placehold.co/48x48/dc2626/ffffff?text=ER',
      lastMessage: 'Area has been cordoned off. Thanks for the alert.',
      timestamp: '1h ago',
      unread: 0,
      role: 'Emergency Services',
      online: false
    },
    {
      id: 4,
      name: 'Riya Sharma',
      avatar: 'https://placehold.co/48x48/7c3aed/ffffff?text=RS',
      lastMessage: 'I saw similar conditions near Anjuna Beach',
      timestamp: '2h ago',
      unread: 2,
      online: true
    },
    {
      id: 5,
      name: 'Mumbai Port Authority',
      avatar: 'https://placehold.co/48x48/ea580c/ffffff?text=MP',
      lastMessage: 'Port operations have been suspended due to high waves.',
      timestamp: '3h ago',
      unread: 0,
      role: 'Port Authority',
      online: false
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role?: string) => {
    if (!role) return null;
    
    const roleColors: { [key: string]: string } = {
      'Official': 'bg-blue-900/50 text-blue-300',
      'Marine Biologist': 'bg-green-900/50 text-green-300',
      'Emergency Services': 'bg-red-900/50 text-red-300',
      'Port Authority': 'bg-orange-900/50 text-orange-300'
    };

    return (
      <span className={`text-xs px-2 py-1 rounded-full ${roleColors[role] || 'bg-gray-900/50 text-gray-300'}`}>
        {role}
      </span>
    );
  };

return (
  <div className="h-screen bg-black overflow-y-auto relative pb-20">
    {/* Header */}
    <header className="sticky top-0 left-0 right-0 max-w-400 mx-auto bg-black border-b border-[#27272a] p-4 z-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-extrabold tracking-tight">Messages</h1>
        <button className="text-gray-400 icon-btn">
          <i className="fas fa-edit text-xl"></i>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-100">
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input w-full pl-10 pr-4 py-2 rounded-xl"
        />
        <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
      </div>
    </header>

    {/* Feed Content */}
    <div className="max-w-400 mx-auto  pb-20">
      {/* Quick Actions */}
      <div className="p-4 border-b border-[#27272a]">
        <div className="flex space-x-3 overflow-x-auto">
          <button className="flex-shrink-0 bg-amber-300 text-black px-4 py-2 rounded-full text-sm font-semibold">
            <i className="fas fa-shield-alt mr-2"></i>
            Emergency Contacts
          </button>
          <button className="flex-shrink-0 bg-[#27272a] text-gray-300 px-4 py-2 rounded-full text-sm">
            <i className="fas fa-users mr-2"></i>
            Officials
          </button>
          <button className="flex-shrink-0 bg-[#27272a] text-gray-300 px-4 py-2 rounded-full text-sm">
            <i className="fas fa-science mr-2"></i>
            Experts
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="divide-y divide-[#27272a]">
        {filteredConversations.map((conversation) => (
          <Link href={`/messages/${conversation.id}`} key={conversation.id}>
            <div className="p-4 hover:bg-gray-900/50 transition-colors">
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <img
                    src={conversation.avatar}
                    className="w-12 h-12 rounded-full"
                    alt={conversation.name}
                  />
                  {conversation.online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-white truncate">
                        {conversation.name}
                      </h3>
                      {getRoleBadge(conversation.role)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {conversation.timestamp}
                      </span>
                      {conversation.unread > 0 && (
                        <div className="bg-amber-300 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {conversation.unread}
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 truncate">
                    {conversation.lastMessage}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Emergency Contact Section */}
      <div className="p-4 border-t border-[#27272a] mt-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">
          Emergency Contacts
        </h3>
        <div className="space-y-2">
          <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl flex items-center justify-center space-x-2">
            <i className="fas fa-phone"></i>
            <span>Emergency Helpline: 112</span>
          </button>
          <button className="w-full secondary-btn text-white font-semibold py-2 px-4 rounded-xl flex items-center justify-center space-x-2">
            <i className="fas fa-life-ring"></i>
            <span>Coast Guard: 1554</span>
          </button>
        </div>
      </div>

      {/* No conversations message */}
      {filteredConversations.length === 0 && (
        <div className="p-8 text-center">
          <i className="fas fa-comments text-4xl text-gray-600 mb-4"></i>
          <p className="text-gray-500">No conversations found</p>
          <p className="text-sm text-gray-600 mt-1">
            Try adjusting your search or start a new conversation
          </p>
        </div>
      )}
    </div>

    {/* Bottom Navigation Bar */}
    <nav className="fixed bottom-0 left-0 right-0 max-w-400 mx-auto bg-black border-t border-[#27272a] flex justify-around p-2">
      <Link
        href="/home"
        className="text-gray-400 py-4 flex flex-col items-center justify-center w-full text-center p-2 rounded-lg"
      >
        <i className="fas fa-home text-xl"></i>
      </Link>
      <Link
        href="/map"
        className="text-gray-400 py-4 flex flex-col items-center justify-center w-full text-center p-2 rounded-lg"
      >
        <i className="fas fa-map-marked-alt text-xl"></i>
      </Link>
      <Link
        href="/messages"
        className="text-amber-300 py-4 flex flex-col items-center justify-center w-full text-center p-2 rounded-lg"
      >
        <i className="fas fa-comments text-xl"></i>
      </Link>
      <Link
        href="/profile"
        className="text-gray-400 py-4 flex flex-col items-center justify-center w-full text-center p-2 rounded-lg"
      >
        <i className="fas fa-user-circle text-xl"></i>
      </Link>
    </nav>
  </div>
);}
