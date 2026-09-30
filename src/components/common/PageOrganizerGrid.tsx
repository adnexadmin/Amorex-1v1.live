import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  RotateCw,
  Maximize2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  X,
  ZoomIn,
  ZoomOut,
  FileText,
  Check,
  Undo2,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface PageItem {
  id: string;
  name?: string;
  thumbnailUrl: string;
  rotation: number; // 0, 90, 180, 270
  fileSize?: string;
  dimensions?: { width: number; height: number };
}

export interface PageOrganizerGridProps {
  pages: PageItem[];
  onChange: (newPages: PageItem[]) => void;
  onPageDelete?: (deletedPage: PageItem, index: number) => void;
  onPageRotate?: (pageId: string, newRotation: number) => void;
  title?: string;
  subtitle?: string;
  readOnly?: boolean;
}

export const PageOrganizerGrid: React.FC<PageOrganizerGridProps> = ({
  pages,
  onChange,
  onPageDelete,
  onPageRotate,
  title = 'Page Management Grid',
  subtitle = 'Press & hold (long-press) on mobile or drag on desktop to reorder pages. Tap quick actions to rotate or preview.',
  readOnly = false,
}) => {
  // Drag and drop states
  const [activeDragIndex, setActiveDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [isTouchDragging, setIsTouchDragging] = useState<boolean>(false);
  const [touchPos, setTouchPos] = useState<{ x: number; y: number } | null>(null);

  // Fullscreen preview state
  const [previewPageIndex, setPreviewPageIndex] = useState<number | null>(null);
  const [previewZoom, setPreviewZoom] = useState<number>(1);

  // Undo history for deletion
  const [lastDeleted, setLastDeleted] = useState<{ page: PageItem; index: number } | null>(null);

  // Touch tracking refs
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const activeDragIndexRef = useRef<number | null>(null);
  const pagesRef = useRef<PageItem[]>(pages);
  pagesRef.current = pages;
  activeDragIndexRef.current = activeDragIndex;

  // Grid container ref for touch hit-testing
  const gridContainerRef = useRef<HTMLDivElement | null>(null);

  // Rotate a page 90 degrees clockwise
  const handleRotate = useCallback(
    (index: number, e?: React.MouseEvent) => {
      e?.stopPropagation();
      const targetPage = pages[index];
      if (!targetPage) return;

      const nextRotation = (targetPage.rotation + 90) % 360;
      const updated = pages.map((p, i) => (i === index ? { ...p, rotation: nextRotation } : p));
      onChange(updated);
      onPageRotate?.(targetPage.id, nextRotation);
    },
    [pages, onChange, onPageRotate]
  );

  // Delete a page and re-index
  const handleDelete = useCallback(
    (index: number, e?: React.MouseEvent) => {
      e?.stopPropagation();
      const targetPage = pages[index];
      if (!targetPage) return;

      const updated = pages.filter((_, i) => i !== index);
      setLastDeleted({ page: targetPage, index });
      onChange(updated);
      onPageDelete?.(targetPage, index);

      // Auto dismiss undo after 4 seconds
      setTimeout(() => {
        setLastDeleted((curr) => (curr?.page.id === targetPage.id ? null : curr));
      }, 4000);
    },
    [pages, onChange, onPageDelete]
  );

  // Undo last delete
  const handleUndoDelete = useCallback(() => {
    if (!lastDeleted) return;
    const { page, index } = lastDeleted;
    const updated = [...pages];
    const insertIdx = Math.min(index, updated.length);
    updated.splice(insertIdx, 0, page);
    onChange(updated);
    setLastDeleted(null);
  }, [lastDeleted, pages, onChange]);

  // Fallback swap left/previous
  const handleSwapLeft = useCallback(
    (index: number, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (index <= 0) return;
      const updated = [...pages];
      const temp = updated[index - 1];
      updated[index - 1] = updated[index];
      updated[index] = temp;
      onChange(updated);
    },
    [pages, onChange]
  );

  // Fallback swap right/next
  const handleSwapRight = useCallback(
    (index: number, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (index >= pages.length - 1) return;
      const updated = [...pages];
      const temp = updated[index + 1];
      updated[index + 1] = updated[index];
      updated[index] = temp;
      onChange(updated);
    },
    [pages, onChange]
  );

  // Rotate all pages at once
  const handleRotateAll = useCallback(() => {
    const updated = pages.map((p) => ({ ...p, rotation: (p.rotation + 90) % 360 }));
    onChange(updated);
  }, [pages, onChange]);

  // ----------------------------------------------------
  // Touch Event Handlers (Native Mobile Long-Press & Drag)
  // ----------------------------------------------------
  const handleTouchStart = (index: number, e: React.TouchEvent) => {
    if (readOnly) return;
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };

    // Clear any previous timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    // Long press detector (260ms for fast, responsive mobile engagement)
    longPressTimerRef.current = setTimeout(() => {
      setActiveDragIndex(index);
      setIsTouchDragging(true);
      setTouchPos({ x: touch.clientX, y: touch.clientY });

      // Trigger subtle haptic vibration on mobile browsers if supported
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(35);
        } catch {
          // ignore
        }
      }
    }, 260);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const currentDrag = activeDragIndexRef.current;

    // If long-press is not yet active, detect if user is just scrolling
    if (currentDrag === null) {
      const deltaX = Math.abs(touch.clientX - touchStartPosRef.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartPosRef.current.y);
      if (deltaX > 8 || deltaY > 8) {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
      }
      return;
    }

    // Active touch drag in progress: prevent document scrolling to ensure 100% smooth dragging
    if (e.cancelable) {
      e.preventDefault();
    }
    setTouchPos({ x: touch.clientX, y: touch.clientY });

    // Identify which card is beneath the finger using elementFromPoint
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
    const cardElement = targetElement?.closest('[data-page-index]');

    if (cardElement) {
      const rawIndex = cardElement.getAttribute('data-page-index');
      if (rawIndex !== null) {
        const hoverIdx = parseInt(rawIndex, 10);
        if (!isNaN(hoverIdx) && hoverIdx !== currentDrag && hoverIdx >= 0 && hoverIdx < pagesRef.current.length) {
          // Real-time swap!
          const currentList = [...pagesRef.current];
          const [draggedItem] = currentList.splice(currentDrag, 1);
          currentList.splice(hoverIdx, 0, draggedItem);

          setActiveDragIndex(hoverIdx);
          setOverIndex(hoverIdx);
          onChange(currentList);

          // Subtle haptic tick on swap
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            try {
              navigator.vibrate(15);
            } catch {
              // ignore
            }
          }
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setActiveDragIndex(null);
    setOverIndex(null);
    setIsTouchDragging(false);
    setTouchPos(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  // ----------------------------------------------------
  // HTML5 Desktop Drag & Drop Handlers
  // ----------------------------------------------------
  const handleDragStart = (index: number, e: React.DragEvent) => {
    if (readOnly) return;
    setActiveDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (index: number, e: React.DragEvent) => {
    if (readOnly) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (overIndex !== index) {
      setOverIndex(index);
    }
  };

  const handleDrop = (targetIndex: number, e: React.DragEvent) => {
    if (readOnly) return;
    e.preventDefault();
    if (activeDragIndex === null || activeDragIndex === targetIndex) {
      setActiveDragIndex(null);
      setOverIndex(null);
      return;
    }

    const updated = [...pages];
    const [draggedItem] = updated.splice(activeDragIndex, 1);
    updated.splice(targetIndex, 0, draggedItem);

    onChange(updated);
    setActiveDragIndex(null);
    setOverIndex(null);
  };

  const handleDragEnd = () => {
    setActiveDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div className="w-full flex flex-col select-none">
      {/* Header Info & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-1">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <FileText size={18} className="text-pink-500 shrink-0" />
              <span>{title}</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20">
              {pages.length} {pages.length === 1 ? 'Page' : 'Pages'}
            </span>
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {/* Global Bulk Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRotateAll}
            disabled={pages.length === 0 || readOnly}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-700 dark:text-gray-200 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Rotate all pages 90° Clockwise"
          >
            <RefreshCw size={13} />
            <span>Rotate All</span>
          </button>
        </div>
      </div>

      {/* Floating Drag Overlay for Mobile Touch */}
      {isTouchDragging && activeDragIndex !== null && pages[activeDragIndex] && touchPos && (
        <div
          style={{
            position: 'fixed',
            left: touchPos.x - 60,
            top: touchPos.y - 80,
            pointerEvents: 'none',
            zIndex: 9999,
          }}
          className="w-32 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border-2 border-pink-500 bg-white dark:bg-slate-900 opacity-95 scale-105 transform rotate-3 transition-transform"
        >
          <img
            referrerPolicy="no-referrer"
            src={pages[activeDragIndex].thumbnailUrl}
            alt="Dragging thumbnail"
            style={{ transform: `rotate(${pages[activeDragIndex].rotation}deg)` }}
            className="w-full h-full object-cover transition-transform"
          />
          <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-pink-600 text-white font-mono text-[10px] font-black shadow-md">
            #{activeDragIndex + 1}
          </div>
        </div>
      )}

      {/* Undo Toast Notification */}
      <AnimatePresence>
        {lastDeleted && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="mb-4 p-2.5 rounded-xl bg-slate-900 text-white border border-pink-500/30 shadow-xl flex items-center justify-between gap-3 text-xs"
          >
            <span className="flex items-center gap-1.5 text-gray-200 truncate">
              <Trash2 size={14} className="text-pink-400 shrink-0" />
              <span>Page #{lastDeleted.index + 1} removed</span>
            </span>
            <button
              type="button"
              onClick={handleUndoDelete}
              className="px-3 py-1 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
            >
              <Undo2 size={13} />
              <span>Undo</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Compact Visual Thumbnail Grid: 2 columns on mobile, 3 on tablet, 4 on desktop */}
      <div
        ref={gridContainerRef}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 touch-pan-y"
      >
        {pages.map((page, index) => {
          const isBeingDragged = activeDragIndex === index;
          const isOver = overIndex === index && activeDragIndex !== null && activeDragIndex !== index;

          return (
            <div
              key={page.id}
              data-page-index={index}
              draggable={!readOnly}
              onDragStart={(e) => handleDragStart(index, e)}
              onDragOver={(e) => handleDragOver(index, e)}
              onDrop={(e) => handleDrop(index, e)}
              onDragEnd={handleDragEnd}
              onTouchStart={(e) => handleTouchStart(index, e)}
              className={`group relative rounded-2xl p-2.5 transition-all duration-200 flex flex-col justify-between border cursor-grab active:cursor-grabbing ${
                isBeingDragged
                  ? 'scale-105 z-30 shadow-2xl ring-2 ring-pink-500 border-pink-400 bg-pink-500/10 dark:bg-pink-950/40 opacity-90'
                  : isOver
                  ? 'scale-[1.02] border-dashed border-pink-500 bg-pink-500/5 ring-1 ring-pink-400/50'
                  : 'bg-white dark:bg-slate-900/90 border-gray-200 dark:border-white/10 hover:border-pink-500/50 hover:shadow-lg shadow-sm'
              }`}
            >
              {/* Card Header: Page Number Badge & Mobile Drag Handle Indicator */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  {/* Page number clearly on top: #1, #2, #3 */}
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-black font-mono tracking-tight shadow-sm ${
                      isBeingDragged
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    }`}
                  >
                    #{index + 1}
                  </span>
                  {page.rotation > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {page.rotation}°
                    </span>
                  )}
                </div>

                {/* Drag Grip Handle */}
                {!readOnly && (
                  <div
                    title="Drag to reorder (or hold on mobile)"
                    className="p-1 rounded text-gray-400 group-hover:text-pink-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <GripVertical size={15} />
                  </div>
                )}
              </div>

              {/* Thumbnail Container */}
              <div
                onClick={() => setPreviewPageIndex(index)}
                className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-800/80 border border-gray-200 dark:border-white/10 flex items-center justify-center cursor-pointer group-hover:border-pink-500/30 transition-all shadow-inner"
              >
                <img
                  referrerPolicy="no-referrer"
                  src={page.thumbnailUrl}
                  alt={page.name || `Page ${index + 1}`}
                  style={{
                    transform: `rotate(${page.rotation}deg)`,
                    transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  className="w-full h-full object-cover select-none pointer-events-none"
                  loading="lazy"
                />

                {/* Subtle Hover Tap to Preview Overlay */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1 shadow-lg">
                    <Maximize2 size={12} />
                    <span>View</span>
                  </span>
                </div>
              </div>

              {/* 3. Card Quick Actions: Rotate 90°, Fullscreen Preview, Delete, plus Fallback Swap Arrows */}
              <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-1">
                {/* Fallback Left Swap Arrow */}
                <button
                  type="button"
                  onClick={(e) => handleSwapLeft(index, e)}
                  disabled={index === 0 || readOnly}
                  title="Move left/previous"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft size={15} />
                </button>

                {/* Quick Action Buttons Group */}
                <div className="flex items-center gap-1">
                  {/* Rotate 90° Clockwise */}
                  <button
                    type="button"
                    onClick={(e) => handleRotate(index, e)}
                    disabled={readOnly}
                    title="Rotate 90° Clockwise"
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-pink-500 hover:text-white dark:hover:bg-pink-600 transition-colors cursor-pointer"
                  >
                    <RotateCw size={13} />
                  </button>

                  {/* Fullscreen Page Preview */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewPageIndex(index);
                    }}
                    title="Enlarge Page Preview"
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors cursor-pointer"
                  >
                    <Maximize2 size={13} />
                  </button>

                  {/* Delete Page */}
                  <button
                    type="button"
                    onClick={(e) => handleDelete(index, e)}
                    disabled={readOnly}
                    title="Delete Page"
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Fallback Right Swap Arrow */}
                <button
                  type="button"
                  onClick={(e) => handleSwapRight(index, e)}
                  disabled={index === pages.length - 1 || readOnly}
                  title="Move right/next"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {pages.length === 0 && (
        <div className="w-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50/50 dark:bg-slate-900/30 text-center p-6">
          <div className="w-14 h-14 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center mb-3">
            <FileText size={26} />
          </div>
          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">No pages remaining</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mb-4">
            Upload new photos or documents, or undo your last action to restore pages.
          </p>
          {lastDeleted && (
            <button
              type="button"
              onClick={handleUndoDelete}
              className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
            >
              <Undo2 size={14} />
              <span>Restore Page #{lastDeleted.index + 1}</span>
            </button>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Fullscreen Page Preview Lightbox Modal */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {previewPageIndex !== null && pages[previewPageIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col justify-between p-4"
            onClick={() => {
              setPreviewPageIndex(null);
              setPreviewZoom(1);
            }}
          >
            {/* Modal Header */}
            <div
              className="w-full flex items-center justify-between gap-2 max-w-5xl mx-auto text-white z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-pink-600 text-white font-mono text-xs font-black shadow-md">
                  Page #{previewPageIndex + 1} of {pages.length}
                </span>
                <span className="text-xs text-gray-400 font-mono hidden sm:inline">
                  Rotation: {pages[previewPageIndex].rotation}°
                </span>
              </div>

              {/* Lightbox Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewZoom((z) => Math.max(0.5, z - 0.25))}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="text-xs font-mono text-gray-300 w-12 text-center">
                  {Math.round(previewZoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewZoom((z) => Math.min(3, z + 0.25))}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleRotate(previewPageIndex)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Rotate 90° Clockwise"
                >
                  <RotateCw size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewPageIndex(null);
                    setPreviewZoom(1);
                  }}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer ml-2"
                  title="Close Preview"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Image Body with Zoom & Rotation */}
            <div
              className="flex-1 flex items-center justify-center overflow-hidden my-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  transform: `scale(${previewZoom}) rotate(${pages[previewPageIndex].rotation}deg)`,
                  transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                className="max-w-[90vw] max-h-[75vh] flex items-center justify-center shadow-2xl rounded-lg overflow-hidden border border-white/20 bg-white"
              >
                <img
                  referrerPolicy="no-referrer"
                  src={pages[previewPageIndex].thumbnailUrl}
                  alt={`Enlarged Page ${previewPageIndex + 1}`}
                  className="max-w-full max-h-[75vh] object-contain select-none"
                />
              </div>
            </div>

            {/* Modal Navigation Footer */}
            <div
              className="w-full max-w-xl mx-auto flex items-center justify-between gap-4 text-white z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                disabled={previewPageIndex <= 0}
                onClick={() => {
                  setPreviewPageIndex((curr) => (curr !== null && curr > 0 ? curr - 1 : curr));
                  setPreviewZoom(1);
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span>Previous Page</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (previewPageIndex !== null) {
                    handleDelete(previewPageIndex);
                    if (previewPageIndex >= pages.length - 1) {
                      setPreviewPageIndex(pages.length - 2 >= 0 ? pages.length - 2 : null);
                    }
                  }
                }}
                className="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-red-500/30"
              >
                <Trash2 size={14} />
                <span>Delete Page</span>
              </button>

              <button
                type="button"
                disabled={previewPageIndex >= pages.length - 1}
                onClick={() => {
                  setPreviewPageIndex((curr) => (curr !== null && curr < pages.length - 1 ? curr + 1 : curr));
                  setPreviewZoom(1);
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Next Page</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
