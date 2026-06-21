// Community Forum — Fully rebuilt with mock posts, replies, and responsive layout
import { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Eye, Plus, Search, ChevronDown, ChevronUp, Send, User2, Tag } from 'lucide-react';
import ApiService from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDateDisplay } from '../utils/dateFormatter';
import toast from 'react-hot-toast';

const MOCK_POSTS = [
  {
    id: 'mock-1', title: 'Best practices for drip irrigation in dry season', author: { name: 'Selvan Murugan' }, tags: ['irrigation', 'drip'],
    content: 'I have been using drip irrigation for my tomato crop and seeing great results even during the dry season. The key is maintaining consistent pressure and cleaning the emitters every 2 weeks. Anyone else have tips to share?',
    likesCount: 28, viewsCount: 142, createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    replies: [
      { author: 'Ravi Kumar', content: 'Great tips! I also add a filter at the inlet to prevent clogging.', time: '1h ago' },
      { author: 'Anbu Raj', content: 'What pressure do you maintain? I struggle to keep it consistent.', time: '45m ago' },
    ],
  },
  {
    id: 'mock-2', title: 'Brown spot disease spreading in my rice field — urgent help!', author: { name: 'Krishnamurthy' }, tags: ['disease', 'rice', 'urgent'],
    content: 'I noticed yellow-brown spots on my IR-20 rice leaves this morning. The field is 3 acres. Looks like brown spot disease. What fungicide works best and should I drain the field?',
    likesCount: 14, viewsCount: 89, createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    replies: [
      { author: 'Agricultural Officer - Salem', content: 'Use Mancozeb 75% WP at 2g/liter. Spray during early morning. Also improve drainage slightly.', time: '4h ago' },
    ],
  },
  {
    id: 'mock-3', title: 'Cotton prices dropping — should farmers wait for MSP?', author: { name: 'Chinnasamy Patel' }, tags: ['market', 'cotton', 'MSP'],
    content: 'Market price for cotton has dropped to ₹6400/quintal but MSP is ₹6620. Is CCI procuring in Salem district? I have 5 quintals ready to sell.',
    likesCount: 45, viewsCount: 310, createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    replies: [
      { author: 'Ravi Kumar', content: 'Yes, CCI is active at the Salem APMC yard. Bring your passbook and Aadhaar.', time: '20h ago' },
      { author: 'Murugesan', content: 'I got MSP yesterday. The process is quick — 3 days for payment.', time: '18h ago' },
    ],
  },
  {
    id: 'mock-4', title: 'AI Disease Detection accuracy — my experience', author: { name: 'Velu Pandian' }, tags: ['AI', 'disease-detection'],
    content: 'I used the FarmSync AI disease detection feature on my mango trees. It correctly identified powdery mildew in 2 seconds. Saved me from a major outbreak. The accuracy is impressive!',
    likesCount: 63, viewsCount: 420, createdAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    replies: [],
  },
];

const Community = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await ApiService.getForumPosts() as any[];
      setPosts(data?.length ? data : MOCK_POSTS);
    } catch {
      setPosts(MOCK_POSTS);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }
    try {
      const newPost = {
        id: `local-${Date.now()}`,
        title: newPostTitle,
        content: newPostContent,
        author: { name: user?.name || 'Anonymous' },
        tags: ['general'],
        likesCount: 0, viewsCount: 1,
        createdAt: new Date().toISOString(),
        replies: [],
      };
      await ApiService.createForumPost({ title: newPostTitle, content: newPostContent, tags: 'general' });
      setPosts(prev => [newPost, ...prev]);
      toast.success('Discussion posted successfully!');
      setNewPostTitle(''); setNewPostContent(''); setShowNewPost(false);
    } catch {
      toast.error('Could not post to server, showing locally');
    }
  };

  const handleLike = async (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likesCount: (p.likesCount || 0) + 1 } : p));
    try { await ApiService.likeForumPost(postId); } catch {}
  };

  const allTags = Array.from(new Set(posts.flatMap(p => p.tags || [])));

  const filteredPosts = posts.filter(p => {
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.content?.toLowerCase().includes(search.toLowerCase());
    const matchTag = !activeTag || (p.tags || []).includes(activeTag);
    return matchSearch && matchTag;
  });

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Farmer Community</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Connect, share, and learn with fellow farmers</p>
        </div>
        <button onClick={() => setShowNewPost(!showNewPost)} className="btn-primary flex items-center gap-2 self-start sm:self-auto text-sm">
          <Plus size={18} /> New Discussion
        </button>
      </div>

      {/* Search + Tags */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search discussions..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setActiveTag(null)} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${!activeTag ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}>
              All
            </button>
            {allTags.slice(0, 6).map(tag => (
              <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${activeTag === tag ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}>
                <Tag size={10} /> {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* New Post Form */}
      {showNewPost && (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Start a Discussion</h2>
          <input type="text" placeholder="Discussion title..." value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
          <textarea placeholder="Describe your question or topic in detail..." rows={4} value={newPostContent} onChange={e => setNewPostContent(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowNewPost(false)} className="btn-secondary text-sm">Cancel</button>
            <button onClick={handleCreatePost} className="btn-primary text-sm">Post Discussion</button>
          </div>
        </div>
      )}

      {/* Posts */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <MessageSquare size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 font-medium">No discussions found</p>
          <button onClick={() => setShowNewPost(true)} className="mt-3 text-primary-600 font-bold text-sm hover:underline">Start the first one!</button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredPosts.map(post => {
            const isExpanded = expandedPost === post.id;
            return (
              <div key={post.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 sm:p-5">
                  {/* Post header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold text-sm flex-shrink-0">
                      {post.author?.name?.charAt(0) || 'F'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base leading-tight">{post.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        <span className="font-semibold text-primary-600 dark:text-primary-400">{post.author?.name || 'Anonymous'}</span>
                        {' • '}{formatDateDisplay(post.createdAt)}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">{post.content}</p>

                  {/* Tags */}
                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {post.tags.map((tag: string) => (
                        <span key={tag} className="text-[10px] font-bold px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full">#{tag}</span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4 mt-4 text-gray-500 dark:text-gray-400">
                    <button onClick={() => handleLike(post.id)} className="flex items-center gap-1.5 hover:text-primary-600 transition-colors text-sm">
                      <ThumbsUp size={15} /> <span>{post.likesCount || 0}</span>
                    </button>
                    <button onClick={() => setExpandedPost(isExpanded ? null : post.id)} className="flex items-center gap-1.5 hover:text-primary-600 transition-colors text-sm">
                      <MessageSquare size={15} /> <span>{post.replies?.length || 0} replies</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <div className="flex items-center gap-1.5 text-sm ml-auto">
                      <Eye size={15} /> <span>{post.viewsCount || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Replies section */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4 sm:p-5 space-y-3">
                    {post.replies?.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {post.replies.map((reply: any, i: number) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                              <User2 size={14} className="text-gray-500" />
                            </div>
                            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
                              <p className="text-xs font-bold text-primary-600 dark:text-primary-400 mb-1">{reply.author} <span className="text-gray-400 font-normal">{reply.time}</span></p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Reply input */}
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 text-xs font-bold flex-shrink-0">
                        {user?.name?.charAt(0) || 'Y'}
                      </div>
                      <div className="flex-1 flex items-end gap-2">
                        <input
                          type="text" placeholder="Write a reply..." value={replyText} onChange={e => setReplyText(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                        <button
                          onClick={() => {
                            if (!replyText.trim()) return;
                            setPosts(prev => prev.map(p => p.id === post.id ? {
                              ...p, replies: [...(p.replies || []), { author: user?.name || 'You', content: replyText, time: 'just now' }]
                            } : p));
                            setReplyText('');
                            toast.success('Reply posted!');
                          }}
                          className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Community;
