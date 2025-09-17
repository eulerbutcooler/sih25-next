"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { signOut } from "@/utils/auth";

interface UserPost {
  id: number;
  uuid: string;
  mediaUrl: string;
  hazardType: string;
  createdAt: string;
  status: "verified" | "pending" | "rejected" | "under_review";
  caption?: string;
  likesCount: number;
}

interface ProfileData {
  user: {
    id: number;
    uuid: string;
    username: string;
    fullName: string;
    email: string;
    role: string;
    organization?: string;
    avatarUrl: string;
    joinDate: string;
    verified: boolean;
  };
  stats: {
    totalPosts: number;
    verifiedPosts: number;
    pendingPosts: number;
    rejectedPosts: number;
    totalUpvotes: number;
    accuracyPercentage: number;
  };
  posts: UserPost[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const fetchProfileData = useCallback(
    async (page = 1, isInitial = false) => {
      try {
        if (isInitial) {
          setLoading(true);
          setCurrentPage(1);
        } else {
          setLoadingMorePosts(true);
        }

        const response = await fetch(`/api/profile?page=${page}&limit=6`);
        if (!response.ok) {
          if (response.status === 401) {
            router.push("/signin");
            return;
          }
          throw new Error("Failed to fetch profile data");
        }

        const data = await response.json();

        if (isInitial || page === 1) {
          setProfileData(data);
          setCurrentPage(1);
        } else {
          // Append new posts for pagination
          setProfileData((prev) =>
            prev
              ? {
                  ...data,
                  posts: [...prev.posts, ...data.posts],
                }
              : data
          );
          setCurrentPage(page);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
        setLoadingMorePosts(false);
      }
    },
    [router]
  );

  useEffect(() => {
    fetchProfileData(1, true);
  }, [fetchProfileData]);

  const loadMorePosts = () => {
    if (profileData?.pagination.hasNextPage && !loadingMorePosts) {
      fetchProfileData(currentPage + 1, false);
    }
  };

  const handleLogout = async () => {
    await signOut("/signin");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <i className="fas fa-check-circle text-green-400 text-xs"></i>;
      case "pending":
        return <i className="fas fa-clock text-yellow-400 text-xs"></i>;
      case "rejected":
      case "flagged":
        return <i className="fas fa-flag text-red-400 text-xs"></i>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "1 day ago";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-amber-300 mb-4"></i>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="max-w-md mx-auto h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <p className="text-gray-400 mb-4">
            {error || "Failed to load profile"}
          </p>
          <button
            onClick={() => fetchProfileData(1, true)}
            className="secondary-btn text-white font-bold py-2 px-4 rounded-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { user, stats, posts } = profileData;

  return (
    <div className="max-w-md mx-auto h-screen bg-black overflow-y-auto pb-20">
      <header className="sticky top-0 bg-black/70 backdrop-blur-lg z-20 p-4 border-b border-gray-800">
        <h1 className="text-xl font-extrabold tracking-tight text-center">
          Profile
        </h1>
      </header>

      <div className="p-6 mt-16">
        {/* User Info */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <Image
              src={user.avatarUrl}
              className="rounded-full border-4 border-gray-800"
              alt="User Profile"
            />
            {user.verified && (
              <div className="absolute bottom-0 flex items-center justify-center right-1 h-6 w-6 bg-green-500 rounded-full p-1">
                <i className="fas fa-check text-white text-sm"></i>
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold mt-4">{user.fullName}</h2>
          <p className="text-gray-500">{user.email}</p>
          <p className="text-sm text-amber-300 font-semibold">
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </p>
          <p className="text-xs text-gray-600 mt-1">Joined {user.joinDate}</p>

          <div className="mt-4 flex space-x-8">
            <div className="text-center">
              <p className="text-xl font-bold">{stats.totalPosts}</p>
              <p className="text-sm text-gray-500">Reports</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">
                {stats.totalUpvotes.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Upvotes</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{stats.accuracyPercentage}%</p>
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
            {posts.map((post: UserPost) => (
              <div key={post.id} className="relative">
                <Image
                  src={post.mediaUrl}
                  className="w-full h-full object-cover rounded-md post-thumbnail aspect-square"
                  alt="User post"
                />
                <div className="absolute top-1 right-1 bg-black/70 backdrop-blur-lg rounded-full p-1">
                  {getStatusIcon(post.status)}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 rounded-b-md">
                  <p className="text-xs text-white font-semibold">
                    {post.hazardType
                      .replace("-", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </p>
                  <p className="text-xs text-gray-300">
                    {formatDate(post.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {posts.length === 0 && (
            <div className="text-center py-12">
              <i className="fas fa-camera text-4xl text-gray-600 mb-4"></i>
              <p className="text-gray-500">No reports yet</p>
              <p className="text-sm text-gray-600 mt-2">
                Start documenting ocean conditions
              </p>
            </div>
          )}

          {/* Load more posts */}
          {profileData.pagination.hasNextPage && (
            <div className="col-span-3 text-center py-4">
              <button
                onClick={loadMorePosts}
                disabled={loadingMorePosts}
                className="secondary-btn text-white font-bold py-2 px-6 rounded-xl disabled:opacity-50"
              >
                {loadingMorePosts ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Loading...
                  </>
                ) : (
                  "Load More Posts"
                )}
              </button>
            </div>
          )}
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
      <BottomNav currentPage="profile" />
    </div>
  );
}
