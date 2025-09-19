"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';
import BottomNav from '@/components/BottomNav';

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

  const loadConversations = useCallback(async () => {
    try {
      const response = await fetch('/api/conversations');
      const data = await response.json();
      
      if (response.ok && data.conversations) {
        setConversations(data.conversations);
      } else {
        console.error('Error loading conversations:', data);
        setConversations([]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (mounted) {
          setUser(user);
          if (user) {
            await loadConversations();
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting user:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getUser();

    return () => {
      mounted = false;
    };
  }, [loadConversations]);

  useEffect(() => {
    if (!user) return;

    let mounted = true;

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel(`conversations-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('New message received:', payload);
          // Only reload if component is still mounted
          if (mounted) {
            loadConversations();
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [user, loadConversations]);

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
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-amber-300 mb-4"></i>
          <p className="text-gray-400">Loading messages...</p>
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
      <header className=" top-0 bg-black fixed w-full z-10 p-4 border-b border-[#27272a]">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-white">Messages</h1>
          
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
            className="w-full pl-10 pr-10 py-3 bg-[#27272a] border border-[#27272a] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
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
          <div className="absolute top-full left-4 right-4 bg-[#27272a] border border-[#27272a] rounded-xl mt-2 shadow-lg z-50 max-h-80 overflow-y-auto">
            {isSearching ? (
              <div className="p-4 text-center text-gray-400">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Searching users...
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <div className="p-3 border-b border-gray-400/10 text-sm text-gray-400 font-semibold">
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
                    className="flex items-center p-3 hover:bg-[#27272a] border-b border-[#27272a] last:border-b-0"
                  >
                    <div className="w-10 h-10 bg-[#27272a] rounded-full mr-3 flex border-amber-300 border items-center justify-center text-white font-bold text-sm">
                      {(searchUser.display_name || 'UN').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white text-sm">{searchUser.display_name}</p>
                      <p className="text-xs text-gray-400">{searchUser.email}</p>
                      {searchUser.role && (
                        <p className="text-xs text-amber-300 capitalize">{searchUser.role}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </>
            ) : searchQuery.length >= 2 ? (
              <div className="p-4 text-center text-gray-400">
                <i className="fas fa-user-slash mr-2"></i>
                No users found for &quot;{searchQuery}&quot;
              </div>
            ) : null}
          </div>
        )}
      </header>

      {/* Content */}
      <main className="p-4 mt-32">
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
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-[#27272a] hover:bg-[#27272a] transition-colors border border-[#27272a]">
                  <div className="w-12 h-12 bg-[#27272a] border border-amber-300 rounded-full flex items-center justify-center text-amber-300 font-bold text-sm">
                    {(conversation.other_user.display_name || 'UN').substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-white">{conversation.other_user.display_name}</p>
                      <span className="text-xs text-gray-400">{conversation.last_message_time}</span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">{conversation.last_message}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav currentPage="messages" />
    </div>
  );
}
