import React, { useState, useRef } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Plus,
  Upload,
  Download,
  CheckCircle2,
  Sparkles,
  X,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PageOrganizerGrid, PageItem } from '../common/PageOrganizerGrid';

export interface PhotoToPdfOrganizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'organize_pdf' | 'photo_to_pdf';
}

const INITIAL_SAMPLE_PAGES: PageItem[] = [
  {
    id: 'page-1',
    name: 'Cover_Page.jpg',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    rotation: 0,
    fileSize: '1.2 MB',
  },
  {
    id: 'page-2',
    name: 'Contract_Clause_1.jpg',
    thumbnailUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
    rotation: 0,
    fileSize: '890 KB',
  },
  {
    id: 'page-3',
    name: 'Financial_Schedule.jpg',
    thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    rotation: 0,
    fileSize: '1.4 MB',
  },
  {
    id: 'page-4',
    name: 'Signatures_Appendix.jpg',
    thumbnailUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80',
    rotation: 0,
    fileSize: '950 KB',
  },
  {
    id: 'page-5',
    name: 'Receipt_Verification.jpg',
    thumbnailUrl: 'https://images.unsplash.com/photo-1554415707-9e4966a604f7?w=600&auto=format&fit=crop&q=80',
    rotation: 0,
    fileSize: '720 KB',
  },
  {
    id: 'page-6',
    name: 'Audit_Summary.jpg',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
    rotation: 0,
    fileSize: '1.1 MB',
  },
];

export const PhotoToPdfOrganizerModal: React.FC<PhotoToPdfOrganizerModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'organize_pdf',
}) => {
  const [activeMode, setActiveMode] = useState<'organize_pdf' | 'photo_to_pdf'>(initialMode);
  const [pages, setPages] = useState<PageItem[]>(INITIAL_SAMPLE_PAGES);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPages: PageItem[] = Array.from(files).map((file, idx) => {
      const url = URL.createObjectURL(file);
      return {
        id: `custom-page-${Date.now()}-${idx}`,
        name: file.name,
        thumbnailUrl: url,
        rotation: 0,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      };
    });

    setPages((prev) => [...prev, ...newPages]);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportPDF = () => {
    if (pages.length === 0) return;
    setIsExporting(true);

    // Simulate instant client-side PDF document packaging
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
      }, 3500);
    }, 1200);
  };

  const handleResetToSample = () => {
    setPages(INITIAL_SAMPLE_PAGES);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[92vh] my-auto"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between gap-4 bg-gray-50/70 dark:bg-slate-900/90 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF2E93] to-pink-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/25 shrink-0">
              <Layers size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white tracking-tight">
                  Page Organizer & Reorder Engine
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Touch Ready
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Seamless drag-and-drop & long-press touch reordering for mobile & desktop
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Selector & Quick Actions Ribbon */}
        <div className="px-5 py-3 bg-gray-100/50 dark:bg-slate-800/40 border-b border-gray-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center bg-gray-200/80 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveMode('organize_pdf')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeMode === 'organize_pdf'
                  ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <FileText size={14} />
              <span>Organize PDF</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('photo_to_pdf')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeMode === 'photo_to_pdf'
                  ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <ImageIcon size={14} />
              <span>Photo to PDF</span>
            </button>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-pink-500/20 transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Pages / Photos</span>
            </button>
            <button
              type="button"
              onClick={handleResetToSample}
              className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 text-xs font-bold transition-all cursor-pointer"
            >
              Reset Sample
            </button>
          </div>
        </div>

        {/* Mobile Touch Guideline Bar */}
        <div className="px-5 py-2 bg-pink-500/5 dark:bg-pink-500/10 border-b border-pink-500/10 flex items-center justify-between text-xs text-pink-700 dark:text-pink-300">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-pink-500 shrink-0" />
            <span className="font-medium">
              <strong>Touch Tip:</strong> Press and hold (long-press) any thumbnail card on mobile to elevate & drag smoothly to reorder.
            </span>
          </div>
          <span className="text-[11px] font-mono opacity-80 hidden sm:inline">
            2-Col (Mobile) / 4-Col (Desktop)
          </span>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5">
          <PageOrganizerGrid
            pages={pages}
            onChange={setPages}
            title={activeMode === 'organize_pdf' ? 'Organize PDF Pages' : 'Photo to PDF Grid'}
            subtitle={
              activeMode === 'organize_pdf'
                ? 'Rearrange pages before compiling. Drag cards directly, rotate orientations, or tap preview.'
                : 'Sequence photos to compile into your PDF document. Drag to adjust story flow.'
            }
          />
        </div>

        {/* Modal Footer with Export PDF */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-white/10 bg-gray-50/70 dark:bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
            {pages.length} pages indexed in sequence • All orientation adjustments preserved
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold transition-all cursor-pointer text-center"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleExportPDF}
              disabled={pages.length === 0 || isExporting}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                exportSuccess
                  ? 'bg-emerald-600 shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-[#FF2E93] to-pink-500 hover:from-pink-600 hover:to-pink-500 shadow-pink-500/25'
              }`}
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Compiling PDF...</span>
                </>
              ) : exportSuccess ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>PDF Generated Successfully!</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Save & Generate PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
