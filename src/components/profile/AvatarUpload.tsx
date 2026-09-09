import React, { useState, useRef } from 'react';
import { Camera, Upload, Image as ImageIcon, Sparkles, Loader2, Check } from 'lucide-react';
import { UserProfile } from '../../types';
import { sound } from '../../utils/audio';
import { AvatarUploadModal } from './AvatarUploadModal';

interface AvatarUploadProps {
  user: UserProfile;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showEditBadge?: boolean;
  onAvatarUpdated?: (newAvatarUrl: string, updatedUser: UserProfile) => void;
  className?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  user,
  size = 'lg',
  showEditBadge = true,
  onAvatarUpdated,
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20 sm:w-24 sm:h-24',
    xl: 'w-28 h-28 sm:w-32 sm:h-32'
  };

  const badgeSizeClasses = {
    sm: 'w-4 h-4 text-[9px]',
    md: 'w-6 h-6 text-[11px]',
    lg: 'w-7 h-7 sm:w-8 sm:h-8',
    xl: 'w-9 h-9'
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14,
    xl: 16
  };

  const currentAvatar = user.avatarUrl || user.avatar;

  const handleOpenModal = () => {
    sound.playClick();
    setIsModalOpen(true);
  };

  return (
    <>
      <div className={`relative inline-block ${className}`}>
        {/* Main Avatar Frame */}
        <button
          type="button"
          onClick={handleOpenModal}
          className={`group relative rounded-full p-0.5 overflow-hidden border-2 border-pink-500/80 shadow-[0_0_20px_rgba(255,46,147,0.35)] cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 ${sizeClasses[size]}`}
          title="Click to change profile picture"
        >
          <img
            referrerPolicy="no-referrer"
            src={currentAvatar}
            alt={user.name}
            className="w-full h-full object-cover rounded-full"
          />

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
            <Camera size={iconSizes[size]} className="text-pink-300 animate-bounce" />
            {size !== 'sm' && (
              <span className="text-[9px] font-bold mt-0.5 tracking-wider uppercase">Edit</span>
            )}
          </div>
        </button>

        {/* Edit Camera Badge Button */}
        {showEditBadge && (
          <button
            type="button"
            onClick={handleOpenModal}
            aria-label="Upload Avatar"
            className={`absolute bottom-0 right-0 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white flex items-center justify-center border-2 border-[#0B0D1B] shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer ${badgeSizeClasses[size]}`}
            title="Upload Profile Picture"
          >
            <Camera size={iconSizes[size]} />
          </button>
        )}
      </div>

      {/* Dedicated Upload Modal */}
      <AvatarUploadModal
        isOpen={isModalOpen}
        currentAvatar={currentAvatar}
        userId={user.id}
        userName={user.name}
        onClose={() => setIsModalOpen(false)}
        onUploadSuccess={(newAvatarUrl, updatedUser) => {
          onAvatarUpdated?.(newAvatarUrl, updatedUser);
        }}
      />
    </>
  );
};
