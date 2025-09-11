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

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
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
    <div className="post-card bg-black rounded-xl overflow-hidden">
      <div className="p-4">
        <div className="flex items-start space-x-4">
          <img 
            src={`https://placehold.co/48x48/18181b/fcd34d?text=${post.author.split(' ').map(n => n[0]).join('')}`} 
            className="rounded-full" 
            alt="User Avatar"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">{post.author}</p>
                <p className="text-sm text-gray-500">{post.location} &bull; {post.time}</p>
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
  );
}
