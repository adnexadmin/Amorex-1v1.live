import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
  X,
  Sparkles,
  Loader2,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { UserProfile } from '../../types';
import { sound } from '../../utils/audio';
import {
  validateAvatarFile,
  createAvatarPreview,
  uploadAvatarAndSync,
  AvatarUploadProgress,
  FileValidationResult
} from '../../services/cloudStorageService';

interface AvatarUploadModalProps {
  isOpen: boolean;
  currentAvatar: string;
  userId: string;
  userName: string;
  onClose: () => void;
  onUploadSuccess: (newAvatarUrl: string, updatedUser: UserProfile) => void;
}

export const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({
  isOpen,
  currentAvatar,
  userId,
  userName,
  onClose,
  onUploadSuccess
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validation, setValidation] = useState<FileValidationResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<AvatarUploadProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process a selected File
  const handleFileSelect = async (file: File) => {
    sound.playClick();
    setErrorMessage(null);
    setSuccessMessage(null);

    // 1. Strict validation
    const val = validateAvatarFile(file);
    setValidation(val);

    if (!val.valid) {
      setErrorMessage(val.error || 'Invalid image file.');
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // 2. Real-time preview generation
    try {
      const preview = await createAvatarPreview(file);
      setSelectedFile(file);
      setPreviewUrl(preview);
    } catch (err: any) {
      setErrorMessage('Could not load image preview. Please try another file.');
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Reset selected file to pick another
  const handleReset = () => {
    sound.playClick();
    setSelectedFile(null);
    setPreviewUrl(null);
    setValidation(null);
    setErrorMessage(null);
    setUploadProgress(null);
    if (galleryInputRef.current) galleryInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Finalize Upload & Synchronize
  const handleConfirmUpload = async () => {
    if (!selectedFile || isUploading) return;

    sound.playCoinDrop();
    setIsUploading(true);
    setErrorMessage(null);

    const result = await uploadAvatarAndSync(
      selectedFile,
      userId,
      (progress) => {
        setUploadProgress(progress);
      }
    );

    setIsUploading(false);

    if (result.success && result.downloadUrl && result.user) {
      sound.playJackpotFanfare();
      setSuccessMessage('Profile picture updated and synced to Firestore!');
      setTimeout(() => {
        onUploadSuccess(result.downloadUrl!, result.user!);
        onClose();
      }, 1000);
    } else {
      setErrorMessage(result.error || 'Upload failed. Please check your network and try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md bg-[#0F1123] border border-pink-500/30 rounded-3xl shadow-2xl overflow-hidden text-white my-auto"
      >
        {/* Hidden File Inputs */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          capture="user"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center">
              <Camera size={16} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                Upload Profile Picture
              </h3>
              <p className="text-[11px] text-gray-400">
                JPEG, PNG, or WEBP • Max 5MB
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (!isUploading) {
                sound.playClick();
                onClose();
              }
            }}
            disabled={isUploading}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer disabled:opacity-40"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Real-Time Avatar Preview Comparison Box */}
          <div className="flex flex-col items-center justify-center py-3 bg-gradient-to-b from-white/5 to-transparent rounded-2xl border border-white/5">
            <div className="relative">
              {/* Circular Avatar Framing Ring */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-pink-500 via-purple-500 to-amber-400 shadow-[0_0_25px_rgba(255,46,147,0.4)]">
                <img
                  referrerPolicy="no-referrer"
                  src={previewUrl || currentAvatar}
                  alt={userName}
                  className="w-full h-full object-cover rounded-full bg-black/40"
                />
              </div>

              {/* Status Badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/80 border border-white/20 text-white shadow-lg whitespace-nowrap flex items-center gap-1">
                {previewUrl ? (
                  <>
                    <Sparkles size={11} className="text-pink-400 animate-pulse" />
                    <span>New Preview</span>
                  </>
                ) : (
                  <span>Current Avatar</span>
                )}
              </div>
            </div>

            {/* File Info Metadata if Selected */}
            {selectedFile && validation?.valid && (
              <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                <Check size={12} />
                <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                <span className="text-gray-400">•</span>
                <span className="text-white font-bold">{validation.fileSizeFormatted}</span>
              </div>
            )}
          </div>

          {/* Validation / Error Notice */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5"
              >
                <AlertCircle size={16} className="shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-tight">{errorMessage}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2"
              >
                <Check size={16} className="shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload Progress Bar & Spinner */}
          {isUploading && uploadProgress && (
            <div className="p-4 rounded-2xl bg-white/5 border border-pink-500/30 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-pink-300">
                  <Loader2 size={14} className="animate-spin text-pink-400" />
                  <span>{uploadProgress.statusMessage}</span>
                </span>
                <span className="font-mono text-white">{uploadProgress.percentage}%</span>
              </div>

              {/* Progress Track */}
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${uploadProgress.percentage}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>
          )}

          {/* Interactive Selection Buttons & Drag & Drop Area (when not previewing) */}
          {!previewUrl && !isUploading && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`p-4 sm:p-5 rounded-2xl border-2 border-dashed transition-all text-center space-y-3 ${
                isDragging
                  ? 'border-pink-500 bg-pink-500/10 scale-[1.02]'
                  : 'border-white/15 bg-white/[0.02] hover:border-white/30'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-white/5 text-gray-300 mx-auto flex items-center justify-center">
                <Upload size={18} />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-white">
                  Drag and drop your photo here, or browse
                </p>
                <p className="text-[10px] text-gray-400">
                  Supports JPEG, PNG, WEBP (Max 5MB)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {/* Gallery Button */}
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600/30 to-pink-600/30 hover:from-purple-600/50 hover:to-pink-600/50 border border-purple-500/30 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <ImageIcon size={14} className="text-purple-300" />
                  <span>Gallery</span>
                </button>

                {/* Camera Button */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-pink-600/30 to-rose-600/30 hover:from-pink-600/50 hover:to-rose-600/50 border border-pink-500/30 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Camera size={14} className="text-pink-300" />
                  <span>Camera</span>
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons when a Preview is Ready */}
          {previewUrl && !isUploading && (
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmUpload}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-[#FF2E93] text-white font-black text-xs sm:text-sm tracking-wide shadow-[0_0_20px_rgba(255,46,147,0.4)] hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Check size={16} />
                <span>Confirm &amp; Upload to Cloud Storage</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="w-full py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>Choose Another Photo</span>
              </button>
            </div>
          )}

          {/* Trust Security Footer */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 pt-1">
            <ShieldCheck size={12} className="text-pink-400" />
            <span>Secure Cloud Storage • Instant Real-Time Sync</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
