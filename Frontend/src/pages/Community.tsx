import { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Eye, Plus, Search } from 'lucide-react';
import ApiService from '../services/api';
import { formatDateDisplay } from '../utils/dateFormatter';
import toast from 'react-hot-toast';

const Community = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await ApiService.getForumPosts();
      setPosts(data);
    } catch (err) {
      toast.error('Failed to load community posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    try {
      await ApiService.createForumPost({
        title: newPostTitle,
        content: newPostContent,
        tags: 'general'
      });
      toast.success('Post created successfully!');
      setNewPostTitle('');
      setNewPostContent('');
      setShowNewPost(false);
      fetchPosts();
    } catch (err) {
      toast.error('Failed to create post');
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await ApiService.likeForumPost(postId);
      fetchPosts();
    } catch (err) {
      toast.error('Failed to like post');
    }
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Farmer Community</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Connect, share, and learn with other farmers</p>
        </div>
        <button onClick={() => setShowNewPost(!showNewPost)} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> New Discussion
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search discussions..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {showNewPost && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
          <h2 className="text-xl font-semibold">Start a Discussion</h2>
          <input 
            type="text" 
            placeholder="Title" 
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
          />
          <textarea 
            placeholder="What's on your mind?" 
            rows={4}
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
          />
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowNewPost(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreatePost} className="btn-primary">Post</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading community discussions...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          No discussions found. Be the first to start one!
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map(post => (
            <div key={post.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{post.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Posted by <span className="font-semibold text-primary-600">{post.author?.name || 'Unknown'}</span> • {formatDateDisplay(post.createdAt)}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">{post.content}</p>
              <div className="flex items-center gap-6 text-gray-500 dark:text-gray-400 text-sm">
                <button onClick={() => handleLike(post.id)} className="flex items-center gap-2 hover:text-primary-600 transition-colors">
                  <ThumbsUp size={16} /> {post.likesCount || 0}
                </button>
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} /> Reply
                </div>
                <div className="flex items-center gap-2">
                  <Eye size={16} /> {post.viewsCount || 0}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Community;
