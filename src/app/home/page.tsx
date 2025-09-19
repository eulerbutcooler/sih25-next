"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";

interface Post {
  id: number;
  uuid: string;
  author: string;
  authorUsername: string;
  authorRole: string;
  authorAvatar: string;
  location: string;
  time: string;
  content: string;
  image: string;
  mediaType: "image" | "video";
  hazardType: string;
  severity: string;
  likes: number;
  comments: number;
  status: "verified" | "pending" | "rejected" | "under_review";
  isLikedByUser: boolean;
  coordinates?: { lat: number; lng: number };
  createdAt: string;
}

interface HomeData {
  posts: Post[];
  stats?: {
    totalPosts: number;
    pendingReports: number;
    verifiedReports: number;
    activeIncidents: number;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: {
    severity?: string;
    hazardType?: string;
    status?: string;
  };
}

export default function HomePage() {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    fetchHomeData(1, true);
  }, []);

  // Auto-load more when scrolling near bottom
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop !==
        document.documentElement.offsetHeight
      )
        return;
      if (homeData?.pagination.hasNextPage && !loadingMore && !loading) {
        loadMorePosts();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [homeData?.pagination.hasNextPage, loadingMore, loading]);

  const fetchHomeData = async (page = 1, isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
        setCurrentPage(1);
      } else {
        setLoadingMore(true);
      }

      const response = await fetch(`/api/home?page=${page}&limit=10`);
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/signin");
          return;
        }
        
        // Try to get error details
        const errorData = await response.json().catch(() => null);
        console.error('Home API error:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        
        throw new Error(`Failed to fetch home data: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Home API Response:', data); // Debug log
      console.log('First post data:', data.posts?.[0]); // Debug log

      // Handle case where user needs to complete profile
      if (data.needsProfileSetup) {
        setHomeData({
          posts: [],
          stats: data.stats,
          pagination: data.pagination,
          filters: data.filters
        });
        setCurrentPage(1);
        setLoadingMore(false);
        setLoading(false);
        return;
      }

      if (isInitial || page === 1) {
        setHomeData(data);
        setCurrentPage(1);
      } else {
        // Append new posts for pagination
        setHomeData((prev) =>
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
      setLoadingMore(false);
    }
  };

  const loadMorePosts = () => {
    if (homeData?.pagination.hasNextPage && !loadingMore) {
      fetchHomeData(currentPage + 1, false);
    }
  };

  const refreshFeed = async () => {
    await fetchHomeData(1, true);
  };

  const handleLike = async (postId: number) => {
    // Optimistic update - update UI immediately
    const originalPost = homeData?.posts.find((p) => p.id === postId);
    if (!originalPost) return;

    const optimisticUpdate = {
      ...originalPost,
      isLikedByUser: !originalPost.isLikedByUser,
      likes: originalPost.isLikedByUser
        ? originalPost.likes - 1
        : originalPost.likes + 1,
    };

    // Update UI immediately for better UX
    setHomeData((prev) =>
      prev
        ? {
            ...prev,
            posts: prev.posts.map((post) =>
              post.id === postId ? optimisticUpdate : post
            ),
          }
        : null
    );

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Revert optimistic update on error
        setHomeData((prev) =>
          prev
            ? {
                ...prev,
                posts: prev.posts.map((post) =>
                  post.id === postId ? originalPost : post
                ),
              }
            : null
        );

        throw new Error(
          `Failed to ${originalPost.isLikedByUser ? "unlike" : "like"} post`
        );
      }

      // If successful, the optimistic update was correct, so we're done
    } catch (error) {
      console.error("Error toggling like:", error);
      // Could add toast notification here for user feedback
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <div className="flex items-center space-x-2 bg-green-900/50 text-green-300 px-3 py-1 rounded-full text-xs font-semibold">
            <i className="fas fa-check-circle"></i>
            <span>Verified</span>
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center space-x-2 bg-yellow-900/50 text-yellow-300 px-3 py-1 rounded-full text-xs font-semibold">
            <i className="fas fa-clock"></i>
            <span>Pending</span>
          </div>
        );
      case "rejected":
      case "flagged":
        return (
          <div className="flex items-center space-x-2 bg-red-900/50 text-red-300 px-3 py-1 rounded-full text-xs font-semibold">
            <i className="fas fa-flag"></i>
            <span>Rejected</span>
          </div>
        );
      case "under_review":
        return (
          <div className="flex items-center space-x-2 bg-blue-900/50 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold">
            <i className="fas fa-eye"></i>
            <span>Under Review</span>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading && !homeData) {
    return (
      <div className="max-w-md mx-auto h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-amber-300 mb-4"></i>
          <p className="text-gray-400">Loading feed...</p>
        </div>
      </div>
    );
  }

  if (error && !homeData) {
    return (
      <div className="max-w-md mx-auto h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => fetchHomeData()}
            className="secondary-btn text-white font-bold py-2 px-4 rounded-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="app-container"
       style={{ height: "calc(100vh - 70px)" }}
      className="max-w-md mx-auto  bg-black overflow-y-auto relative "
    >
      {/* Header */}
      <header className="fixed w-full top-0 bg-black z-10 p-4 flex justify-between items-center border-b border-[#27272a]">
        <h1 className="text-xl font-extrabold tracking-tight">Ocean Watch</h1>
        <div className="flex items-center space-x-5">
          <i className="fas fa-search text-gray-400 cursor-pointer icon-btn"></i>
          <button
            onClick={refreshFeed}
            disabled={loading}
            className={`${
              loading ? "text-gray-600" : "text-gray-400"
            } cursor-pointer`}
          >
            <i
              className={`fas fa-sync-alt icon-btn ${loading ? "fa-spin" : ""}`}
            ></i>
          </button>
          <i className="fas fa-bell text-gray-400 cursor-pointer icon-btn"></i>
        </div>
      </header>

      {/* Feed Content */}
      <div className="p-2 sm:p-4 mt-16 space-y-3">{/* Removed mt-20 since header is now sticky */}
        {homeData &&
          homeData.posts.map((post: Post) => (
            <div
              key={post.id}
              className="post-card bg-black rounded-xl overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="rounded-full w-12 h-12 bg-[#27272a] text-amber-300 flex items-center justify-center font-bold text-lg">
                    {(post.author || 'UN').substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold">{post.author || 'No Author'}</p>
                        <p className="text-sm text-gray-500">
                          {post.location || 'No Location'} &bull; {post.time || 'No Time'}
                        </p>
                      </div>
                      {getStatusBadge(post.status)}
                    </div>
                    <p className="text-gray-300 mt-3">{post.content || 'No Content'}</p>
                  </div>
                </div>
              </div>
              {post.mediaType === "video" ? (
                <video src={post.image} className="w-full h-auto" controls />
              ) : (
                <Image
                  src={post.image}
                  width={400}
                  height={300}
                  className="w-full h-auto"
                  alt="Post content"
                />
              )}
              <div className="p-4">
                <div className="flex justify-around items-center text-gray-500">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`icon-btn flex items-center space-x-2 text-sm ${
                      post.isLikedByUser ? "text-red-400" : "text-gray-500"
                    }`}
                  >
                    <i
                      className={`fas fa-angle-double-up fa-xl ${
                        post.isLikedByUser ? "" : "opacity-60"
                      }`}
                    ></i>
                    <span>{post.likes}</span>
                  </button>
                  <button className="icon-btn flex items-center space-x-2 text-sm">
                    <i className="far fa-comments fa-lg"></i>
                    <span>{post.comments}</span>
                  </button>
                  <button className="icon-btn flex items-center space-x-2 text-sm">
                    <i className="fas fa-share fa-lg"></i>
                    
                  </button>
                </div>
              </div>
            </div>
          ))}

        {/* Loading more posts */}
        {loadingMore && (
          <div className="text-center py-4">
            <i className="fas fa-spinner fa-spin text-2xl text-amber-300"></i>
            <p className="text-sm text-gray-400 mt-2">Loading more posts...</p>
          </div>
        )}

        {/* Empty state */}
        {homeData && homeData.posts.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-waves text-4xl text-gray-600 mb-4"></i>
            <p className="text-gray-500">No reports available</p>
            <p className="text-sm text-gray-600 mt-2">
              Check back later for ocean updates
            </p>
          </div>
        )}

        {/* End of feed indicator */}
        {homeData &&
          !homeData.pagination.hasNextPage &&
          homeData.posts.length > 0 && (
            <div className="text-center py-8">
              <div className=" mb-16">
                <i className="fas fa-check-circle text-green-500 text-xl mb-2"></i>
                <p className="text-gray-500 text-sm">You&apos;re all caught up!</p>
              </div>
            </div>
          )}
      </div>

      {/* Floating Action Button to Create Post */}
      <Link href="/create-post">
        <button className="fab fixed bottom-24 right-6 bg-amber-300 text-black w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-amber-400">
          <i className="fas fa-plus"></i>
        </button>
      </Link>

      {/* Bottom Navigation Bar */}
      <BottomNav currentPage="home" />
    </div>
  );
}