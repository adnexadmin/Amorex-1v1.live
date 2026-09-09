import React, { useState } from 'react';
import { MomentPost, UserProfile } from '../../types';
import { sound } from '../../utils/audio';
import {
  Heart,
  MessageCircle,
  Share2,
  Gift,
  Plus,
  Image as ImageIcon,
  Sparkles,
  X,
  Send,
  Lock,
  Globe,
  CheckCircle2,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MomentLightboxModal } from '../modals/MomentLightboxModal';

interface MomentsTabProps {
  posts: MomentPost[];
  user: UserProfile;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onOpenGiftDrawer: (authorName: string) => void;
  onCreatePost: (newPost: Omit<MomentPost, 'id' | 'likesCount' | 'commentsCount' | 'sharesCount' | 'timestamp'>) => void;
}

export const MomentsTab: React.FC<MomentsTabProps> = ({
  posts,
  user,
  onLikePost,
  onAddComment,
  onOpenGiftDrawer,
  onCreatePost
}) => {
  const [subTab, setSubTab] = useState<'Popular' | 'Video' | 'Follow'>('Popular');
  const [activeCommentPost, setActiveCommentPost] = useState<MomentPost | null>(null);
  const [commentText, setCommentText] = useState<string>('');

  // Lightbox Modal state for full-screen zoomable view
  const [selectedLightboxPostId, setSelectedLightboxPostId] = useState<string | null>(null);
  const selectedLightboxPost = posts.find((p) => p.id === selectedLightboxPostId) || null;

  // Publish Article Creator Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newContent, setNewContent] = useState<string>('');
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [visibility, setVisibility] = useState<'public' | 'friends'>('public');

  const filteredPosts = posts.filter((p) => {
    if (subTab === 'Video') return p.mediaType === 'video' || p.tags.includes('#Video');
    return true;
  });

  // Filter image posts for lightbox next/previous gallery traversal
  const imagePosts = filteredPosts.filter((p) => p.mediaType !== 'video' && p.mediaUrl);
  const currentImageIndex = selectedLightboxPost
    ? imagePosts.findIndex((p) => p.id === selectedLightboxPost.id)
    : -1;
  const hasPrevImage = currentImageIndex > 0;
  const hasNextImage = currentImageIndex >= 0 && currentImageIndex < imagePosts.length - 1;

  const handlePrevImage = () => {
    if (hasPrevImage) {
      sound.playClick();
      setSelectedLightboxPostId(imagePosts[currentImageIndex - 1].id);
    }
  };

  const handleNextImage = () => {
    if (hasNextImage) {
      sound.playClick();
      setSelectedLightboxPostId(imagePosts[currentImageIndex + 1].id);
    }
  };

  const handleLike = (postId: string) => {
    sound.playHeartLike();
    onLikePost(postId);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeCommentPost) return;
    sound.playClick();
    onAddComment(activeCommentPost.id, commentText.trim());
    setCommentText('');
  };

  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    sound.playCoinDrop();

    onCreatePost({
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
      authorLevel: user.level,
      isVerified: user.faceVerified || user.is_super_admin,
      content: newContent.trim(),
      mediaType,
      mediaUrl:
        mediaUrl.trim() ||
        'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80',
      tags: ['#AmorexMoments', '#Romance']
    });

    setNewContent('');
    setMediaUrl('');
    setIsCreateModalOpen(false);
  };

  return (
    <div className="pb-24 pt-2 max-w-2xl mx-auto px-3 sm:px-4 space-y-4">
      {/* Top Header & Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          {(['Popular', 'Video', 'Follow'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                sound.playClick();
                setSubTab(tab);
              }}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-all ${
                subTab === tab
                  ? 'bg-gradient-to-r from-[#FF2E93] to-[#9D00FF] text-white shadow-[0_0_10px_#FF2E93]'
                  : 'text-gray-400 hover:text-white bg-white/5'
              }`}
            >
              {tab === 'Popular' && '🔥 Popular'}
              {tab === 'Video' && '🎬 Videos'}
              {tab === 'Follow' && '💖 Following'}
            </button>
          ))}
        </div>

        {/* Top-Right Creator '+' Button */}
        <button
          id="publish-moment-btn"
          onClick={() => {
            sound.playClick();
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FF2E93] via-[#9D00FF] to-[#00D2FF] text-white text-xs font-black shadow-[0_0_12px_rgba(255,46,147,0.5)] hover:scale-105 transition-transform"
        >
          <Plus size={14} strokeWidth={3} />
          <span>Publish</span>
        </button>
      </div>

      {/* Stories Carousel */}
      <div className="flex items-center gap-3 overflow-x-auto py-1 no-scrollbar">
        {/* Your Story */}
        <div
          onClick={() => setIsCreateModalOpen(true)}
          className="flex flex-col items-center gap-1 cursor-pointer shrink-0"
        >
          <div className="relative w-14 h-14 rounded-full border-2 border-dashed border-pink-500 p-0.5 flex items-center justify-center">
            <img
              referrerPolicy="no-referrer"
              src={user.avatar}
              alt="Me"
              className="w-full h-full rounded-full object-cover"
            />
            <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#FF2E93] text-white flex items-center justify-center text-[10px] font-bold">
              +
            </div>
          </div>
          <span className="text-[10px] text-gray-300 font-medium truncate w-14 text-center">Add Story</span>
        </div>

        {/* Other Streamers Stories */}
        {[
          { name: 'Aanya', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
          { name: 'Layla', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80' },
          { name: 'Zoya', avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&auto=format&fit=crop&q=80' },
          { name: 'Nusrat', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80' },
          { name: 'Kabir', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' }
        ].map((story, i) => (
          <div key={i} className="flex flex-col items-center gap-1 cursor-pointer shrink-0">
            <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#FF2E93] via-[#FFD700] to-[#00D2FF]">
              <img
                referrerPolicy="no-referrer"
                src={story.avatar}
                alt={story.name}
                className="w-full h-full rounded-full object-cover border-2 border-[#090A15]"
              />
            </div>
            <span className="text-[10px] text-gray-300 font-medium truncate w-14 text-center">{story.name}</span>
          </div>
        ))}
      </div>

      {/* Feed Posts */}
      <section className="space-y-4">
        {filteredPosts.map((post) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-[#14162B]/85 border border-white/10 overflow-hidden backdrop-blur-xl shadow-lg"
          >
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-pink-500">
                  <img
                    referrerPolicy="no-referrer"
                    src={post.authorAvatar}
                    alt={post.authorName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-white">{post.authorName}</h3>
                    <span className="text-[9px] bg-[#FF2E93] text-white font-black px-1.5 rounded-full">
                      Lv.{post.authorLevel}
                    </span>
                    {post.isVerified && (
                      <CheckCircle2 size={13} className="text-[#00D2FF]" />
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400">{post.timestamp}</span>
                </div>
              </div>

              {/* Send Direct Gift Button */}
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenGiftDrawer(post.authorName);
                }}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-[#FF2E93] text-white text-xs font-black shadow-sm hover:scale-105 transition-transform"
              >
                <Gift size={13} />
                <span>Gift</span>
              </button>
            </div>

            {/* Post Media Content */}
            {post.mediaUrl && (
              <div className="relative aspect-video sm:aspect-[16/10] bg-black/60 overflow-hidden group">
                {post.mediaType === 'video' ? (
                  <video
                    src={post.mediaUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedLightboxPostId(post.id);
                    }}
                    className="w-full h-full text-left relative block cursor-zoom-in focus:outline-none overflow-hidden"
                    aria-label={`Open full-screen zoomable view for post by ${post.authorName}`}
                    title="Click to open in full-screen zoomable view"
                  >
                    <img
                      referrerPolicy="no-referrer"
                      src={post.mediaUrl}
                      alt={post.content || 'Moment'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Hover expand badge indicator */}
                    <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-[11px] font-bold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                      <Maximize2 size={12} className="text-pink-400" />
                      <span>Full screen view</span>
                    </div>
                  </button>
                )}
              </div>
            )}

            {/* Post Text & Tags */}
            <div className="p-4 space-y-2">
              <p className="text-xs text-gray-200 leading-relaxed font-normal">{post.content}</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-[10px] font-semibold text-pink-400">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Bar (Like, Comment, Share) */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-gray-300">
                <div className="flex items-center gap-4">
                  {/* Heart Like */}
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 transition-colors ${
                      post.hasLiked ? 'text-[#FF2E93] font-bold' : 'hover:text-pink-400'
                    }`}
                  >
                    <Heart size={18} fill={post.hasLiked ? '#FF2E93' : 'none'} className={post.hasLiked ? 'animate-bounce' : ''} />
                    <span>{post.likesCount}</span>
                  </button>

                  {/* Comment */}
                  <button
                    onClick={() => {
                      sound.playClick();
                      setActiveCommentPost(post);
                    }}
                    className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
                  >
                    <MessageCircle size={18} />
                    <span>{post.commentsCount}</span>
                  </button>

                  {/* Share */}
                  <button
                    onClick={() => {
                      sound.playClick();
                    }}
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <Share2 size={17} />
                    <span>{post.sharesCount}</span>
                  </button>
                </div>

                <span className="text-[10px] text-gray-400">Amorex Social Feed</span>
              </div>
            </div>
          </motion.article>
        ))}
      </section>

      {/* Publish Article Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-[#14162B] border border-pink-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-white relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-base font-black flex items-center gap-1.5">
                  <Sparkles size={16} className="text-pink-400" />
                  <span>Publish New Moment Article</span>
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handlePublishPost} className="space-y-3 mt-3">
                {/* 0/500 Character Text Area */}
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>What is on your mind?</span>
                    <span className={newContent.length >= 480 ? 'text-red-400 font-bold' : ''}>
                      {newContent.length}/500
                    </span>
                  </div>
                  <textarea
                    required
                    maxLength={500}
                    rows={4}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Share your romantic moments, thoughts, or song previews..."
                    className="w-full bg-[#090A15] border border-white/15 focus:border-[#FF2E93] rounded-2xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none resize-none"
                  />
                </div>

                {/* Media URL / Upload Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Attach Photo / Video Media URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="Paste image/video URL (or leave blank for romantic preset)"
                      className="flex-1 bg-[#090A15] border border-white/15 focus:border-[#FF2E93] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
                    />
                    <select
                      value={mediaType}
                      onChange={(e) => setMediaType(e.target.value as 'image' | 'video')}
                      className="bg-[#090A15] border border-white/15 text-xs text-white rounded-xl px-2 py-2"
                    >
                      <option value="image">Photo</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                </div>

                {/* Visibility Toggle */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-xs">
                    {visibility === 'public' ? <Globe size={15} className="text-cyan-400" /> : <Lock size={15} className="text-pink-400" />}
                    <span className="font-semibold text-gray-200">
                      Visibility: {visibility === 'public' ? 'Public (All Amorex)' : 'Friends Only'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVisibility(visibility === 'public' ? 'friends' : 'public')}
                    className="text-xs text-pink-400 hover:text-pink-300 font-bold underline"
                  >
                    Change
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF2E93] via-[#9D00FF] to-[#00D2FF] text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  <span>Publish to Moments Feed</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Comment Sheet Drawer */}
      <AnimatePresence>
        {activeCommentPost && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full max-w-lg bg-[#14162B] border-t sm:border border-white/15 rounded-t-3xl sm:rounded-3xl p-4 shadow-2xl flex flex-col max-h-[75vh]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-sm font-bold text-white">Comments ({activeCommentPost.comments?.length || 0})</h3>
                <button onClick={() => setActiveCommentPost(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white">
                  <X size={16} />
                </button>
              </div>

              {/* Comments list */}
              <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
                {activeCommentPost.comments && activeCommentPost.comments.length > 0 ? (
                  activeCommentPost.comments.map((c) => (
                    <div key={c.id} className="flex items-start gap-2.5 bg-white/5 p-2.5 rounded-2xl">
                      <img referrerPolicy="no-referrer" src={c.userAvatar} alt={c.userName} className="w-7 h-7 rounded-full object-cover" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-pink-300">{c.userName}</span>
                          <span className="text-[10px] text-gray-500">{c.time}</span>
                        </div>
                        <p className="text-xs text-white mt-0.5">{c.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-6 text-xs text-gray-500">No comments yet. Be the first to reply!</p>
                )}
              </div>

              {/* Add comment form */}
              <form onSubmit={handleSendComment} className="pt-2 border-t border-white/10 flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a sweet comment..."
                  className="flex-1 bg-[#090A15] border border-white/15 focus:border-[#FF2E93] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF2E93] hover:bg-pink-600 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Send
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full-Screen Zoomable Lightbox Modal */}
      {selectedLightboxPost && (
        <MomentLightboxModal
          post={selectedLightboxPost}
          onClose={() => setSelectedLightboxPostId(null)}
          onLikePost={handleLike}
          onOpenComments={(post) => {
            setSelectedLightboxPostId(null);
            setActiveCommentPost(post);
          }}
          onOpenGiftDrawer={(authorName) => {
            onOpenGiftDrawer(authorName);
          }}
          hasPrev={hasPrevImage}
          hasNext={hasNextImage}
          onPrev={handlePrevImage}
          onNext={handleNextImage}
        />
      )}
    </div>
  );
};
