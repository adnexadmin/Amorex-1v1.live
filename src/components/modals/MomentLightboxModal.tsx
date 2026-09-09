import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MomentPost } from '../../types';
import { sound } from '../../utils/audio';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Gift,
  CheckCircle2,
  Share2,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MomentLightboxModalProps {
  post: MomentPost | null;
  onClose: () => void;
  onLikePost?: (postId: string) => void;
  onOpenComments?: (post: MomentPost) => void;
  onOpenGiftDrawer?: (authorName: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const MomentLightboxModal: React.FC<MomentLightboxModalProps> = ({
  post,
  onClose,
  onLikePost,
  onOpenComments,
  onOpenGiftDrawer,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState<boolean>(true);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom & pan whenever active post changes
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [post?.id]);

  // Lock body scroll while lightbox is open
  useEffect(() => {
    if (post) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [post]);

  const handleZoomIn = useCallback(() => {
    sound.playClick();
    setZoom((prev) => Math.min(prev + 0.5, 4));
  }, []);

  const handleZoomOut = useCallback(() => {
    sound.playClick();
    setZoom((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handleResetZoom = useCallback(() => {
    sound.playClick();
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleToggleDoubleClick = useCallback(() => {
    sound.playClick();
    if (zoom > 1) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    } else {
      setZoom(2.2);
    }
  }, [zoom]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!post) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && hasPrev && onPrev) {
        onPrev();
      } else if (e.key === 'ArrowRight' && hasNext && onNext) {
        onNext();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleResetZoom();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [post, onClose, hasPrev, hasNext, onPrev, onNext, handleZoomIn, handleZoomOut, handleResetZoom]);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom((prev) => Math.min(prev + 0.25, 4));
    } else {
      setZoom((prev) => {
        const next = Math.max(prev - 0.25, 1);
        if (next === 1) setPan({ x: 0, y: 0 });
        return next;
      });
    }
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pan handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom <= 1 || e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX - pan.x,
      y: e.touches[0].clientY - pan.y
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoom <= 1 || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleShare = () => {
    sound.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    }
  };

  if (!post) return null;

  return (
    <AnimatePresence>
      <div
        id="moment-lightbox-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl overflow-hidden select-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top Control Bar */}
        <div
          id="moment-lightbox-top-bar"
          className="absolute top-0 left-0 right-0 z-30 p-3 sm:p-4 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto"
        >
          {/* Post Author Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-pink-500/60 shrink-0">
              <img
                referrerPolicy="no-referrer"
                src={post.authorAvatar}
                alt={post.authorName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">{post.authorName}</h4>
                <span className="text-[9px] bg-[#FF2E93] text-white font-black px-1.5 py-0.5 rounded-full shrink-0">
                  Lv.{post.authorLevel}
                </span>
                {post.isVerified && (
                  <CheckCircle2 size={13} className="text-[#00D2FF] shrink-0" />
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] text-gray-400 block truncate">{post.timestamp}</span>
            </div>
          </div>

          {/* Zoom & Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Zoom Percentage Badge */}
            <div
              id="moment-lightbox-zoom-badge"
              className="px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-mono font-bold text-gray-200 hidden sm:block"
            >
              {Math.round(zoom * 100)}%
            </div>

            {/* Zoom Out */}
            <button
              id="moment-lightbox-zoom-out-btn"
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 1}
              aria-label="Zoom out"
              title="Zoom Out (-)"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 text-white flex items-center justify-center border border-white/15 transition-all cursor-pointer"
            >
              <ZoomOut size={16} />
            </button>

            {/* Zoom In */}
            <button
              id="moment-lightbox-zoom-in-btn"
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= 4}
              aria-label="Zoom in"
              title="Zoom In (+)"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 text-white flex items-center justify-center border border-white/15 transition-all cursor-pointer"
            >
              <ZoomIn size={16} />
            </button>

            {/* Reset Zoom */}
            {zoom > 1 && (
              <button
                id="moment-lightbox-reset-zoom-btn"
                type="button"
                onClick={handleResetZoom}
                aria-label="Reset zoom"
                title="Reset Zoom (0)"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 flex items-center justify-center border border-amber-400/30 transition-all cursor-pointer"
              >
                <RotateCcw size={15} />
              </button>
            )}

            {/* Close Button */}
            <button
              id="moment-lightbox-close-btn"
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              aria-label="Close full-screen image view"
              title="Close (Esc)"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-rose-500/80 hover:border-rose-400 text-white flex items-center justify-center border border-white/15 transition-all cursor-pointer ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Previous Image Navigation Arrow */}
        {hasPrev && onPrev && (
          <button
            id="moment-lightbox-prev-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sound.playClick();
              onPrev();
            }}
            aria-label="Previous image"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-[#FF2E93] text-white border border-white/20 hover:border-pink-400 flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Next Image Navigation Arrow */}
        {hasNext && onNext && (
          <button
            id="moment-lightbox-next-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sound.playClick();
              onNext();
            }}
            aria-label="Next image"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-[#FF2E93] text-white border border-white/20 hover:border-pink-400 flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95"
          >
            <ChevronRight size={24} />
          </button>
        )}

        {/* Center Zoomable Image View Container */}
        <div
          ref={containerRef}
          id="moment-lightbox-stage"
          className={`w-full h-full flex items-center justify-center p-4 sm:p-12 overflow-hidden ${
            zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
          }`}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onDoubleClick={handleToggleDoubleClick}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative max-w-full max-h-full flex items-center justify-center"
            style={{
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out'
            }}
          >
            <img
              id="moment-lightbox-image"
              referrerPolicy="no-referrer"
              src={post.mediaUrl}
              alt={post.content || 'Moment full image'}
              className="max-w-[92vw] max-h-[75vh] sm:max-h-[82vh] object-contain rounded-xl sm:rounded-2xl shadow-2xl pointer-events-none select-none"
              draggable={false}
            />
          </motion.div>
        </div>

        {/* Double-Click or Wheel Zoom Instruction Tooltip */}
        {zoom === 1 && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-gray-300 tracking-wide animate-pulse hidden sm:flex items-center gap-1.5">
            <Maximize2 size={11} className="text-pink-400" />
            <span>Double click or use mouse wheel / buttons to zoom</span>
          </div>
        )}

        {/* Bottom Context & Interaction Bar */}
        <div
          id="moment-lightbox-bottom-bar"
          className="absolute bottom-0 left-0 right-0 z-30 p-3 sm:p-5 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-auto"
        >
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Post Caption & Tags */}
            <div className="min-w-0 flex-1 pr-2">
              {post.content && (
                <p className="text-xs sm:text-sm text-gray-100 font-medium line-clamp-2 leading-snug">
                  {post.content}
                </p>
              )}
              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-semibold text-pink-400">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Interaction Buttons (Like, Comments, Gift, Share) */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-end sm:self-auto">
              {/* Like Button */}
              {onLikePost && (
                <button
                  id="moment-lightbox-like-btn"
                  type="button"
                  onClick={() => {
                    onLikePost(post.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border transition-all cursor-pointer text-xs font-bold ${
                    post.hasLiked
                      ? 'bg-pink-500/20 border-pink-500 text-[#FF2E93] shadow-[0_0_12px_rgba(255,46,147,0.4)]'
                      : 'bg-white/10 border-white/15 text-gray-200 hover:text-white hover:bg-white/15'
                  }`}
                >
                  <Heart
                    size={15}
                    fill={post.hasLiked ? '#FF2E93' : 'none'}
                    className={post.hasLiked ? 'animate-bounce text-[#FF2E93]' : ''}
                  />
                  <span>{post.likesCount}</span>
                </button>
              )}

              {/* Comments Button */}
              {onOpenComments && (
                <button
                  id="moment-lightbox-comments-btn"
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onOpenComments(post);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-gray-200 hover:text-white transition-all cursor-pointer text-xs font-bold"
                >
                  <MessageCircle size={15} className="text-cyan-400" />
                  <span>{post.commentsCount}</span>
                </button>
              )}

              {/* Gift Button */}
              {onOpenGiftDrawer && (
                <button
                  id="moment-lightbox-gift-btn"
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onOpenGiftDrawer(post.authorName);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-[#FF2E93] hover:opacity-90 text-white transition-all cursor-pointer text-xs font-black shadow-md"
                >
                  <Gift size={14} />
                  <span>Gift</span>
                </button>
              )}

              {/* Share Button */}
              <button
                id="moment-lightbox-share-btn"
                type="button"
                onClick={handleShare}
                aria-label="Share post"
                title="Share link"
                className="p-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-gray-300 hover:text-white transition-all cursor-pointer"
              >
                <Share2 size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Copied Link Toast Notification */}
        <AnimatePresence>
          {copiedNotification && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full bg-emerald-500/90 text-white text-xs font-bold shadow-lg flex items-center gap-1.5"
            >
              <CheckCircle2 size={14} />
              <span>Link copied to clipboard!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};
