'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

interface SearchUser {
  id: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  role: string;
}

interface Conversation {
  id: string;
  other_user: SearchUser;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export default function MessagesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await loadConversations(user);
      }
      setLoading(false);
    };

    getUser();
  }, []);

  const loadConversations = async (user: User) => {
    try {
      // For now, we'll just show an empty state
      // This can be expanded later to load actual conversations
      setConversations([]);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (response.ok && data.results) {
        setSearchResults(data.results);
      } else {
        console.error('Search error:', data);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search fetch error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchUsers(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto h-screen bg-black flex items-center justify-center">
        <div className="text-center text-gray-400">
          <i className="fas fa-spinner fa-spin text-2xl mb-4"></i>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please sign in to view messages</p>
          <Link href="/signin" className="text-amber-300 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto h-screen bg-black overflow-y-auto pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-black/90 backdrop-blur-lg z-10 p-4 border-b border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-white">Messages</h1>
          <Link href="/home">
            <button className="text-gray-400 hover:text-white">
              <i className="fas fa-home text-xl"></i>
            </button>
          </Link>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search users to start a conversation..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => {
              if (searchQuery.length >= 2) {
                setShowSearchResults(true);
              }
            }}
            className="w-full pl-10 pr-10 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && (
          <div className="absolute top-full left-4 right-4 bg-gray-900 border border-gray-700 rounded-xl mt-2 shadow-lg z-50 max-h-80 overflow-y-auto">
            {isSearching ? (
              <div className="p-4 text-center text-gray-400">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Searching users...
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <div className="p-3 border-b border-gray-700 text-sm text-gray-400 font-semibold">
                  <i className="fas fa-users mr-2"></i>
                  Users ({searchResults.length})
                </div>
                {searchResults.map((searchUser) => (
                  <Link
                    key={searchUser.id}
                    href={`/messages/${searchUser.id}`}
                    onClick={() => {
                      setShowSearchResults(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center p-3 hover:bg-gray-800 border-b border-gray-800 last:border-b-0"
                  >
                    <img
                      src={searchUser.avatar_url || `https://placehold.co/40x40/6b7280/ffffff?text=${searchUser.display_name[0]?.toUpperCase()}`}
                      alt={searchUser.display_name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-white text-sm">{searchUser.display_name}</p>
                      <p className="text-xs text-gray-400">{searchUser.email}</p>
                      {searchUser.role && (
                        <p className="text-xs text-amber-400 capitalize">{searchUser.role}</p>
                      )}
                    </div>
                    <i className="fas fa-paper-plane text-gray-400 text-sm"></i>
                  </Link>
                ))}
              </>
            ) : searchQuery.length >= 2 ? (
              <div className="p-4 text-center text-gray-400">
                <i className="fas fa-user-slash mr-2"></i>
                No users found for "{searchQuery}"
              </div>
            ) : null}
          </div>
        )}
      </header>

      {/* Content */}
      <main className="p-4">
        {conversations.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <i className="fas fa-comments text-4xl mb-4"></i>
            <p className="text-lg mb-2">No conversations yet</p>
            <p className="text-sm">Use the search bar above to find users and start conversations</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/messages/${conversation.other_user.id}`}
                className="block"
              >
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-900 hover:bg-gray-800 transition-colors border border-gray-800">
                  <img
                    src={conversation.other_user.avatar_url || `https://placehold.co/48x48/18181b/fcd34d?text=${conversation.other_user.display_name?.charAt(0)}`}
                    alt={conversation.other_user.display_name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-white">{conversation.other_user.display_name}</p>
                      <span className="text-xs text-gray-400">{conversation.last_message_time}</span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">{conversation.last_message}</p>
                  </div>
                  {conversation.unread_count > 0 && (
                    <div className="bg-amber-500 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {conversation.unread_count}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation Space */}
      <div className="h-20"></div>
    </div>
  );
}
