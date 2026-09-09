import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Camera,
  Check,
  User,
  Sparkles,
  Save,
  Globe,
  Calendar,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  Tag,
  Languages,
  MapPin,
  Heart,
  FileText
} from 'lucide-react';
import { UserProfile, Gender, Region } from '../../types';
import { sound } from '../../utils/audio';
import { updateUserProfile } from '../../utils/storage';
import { AvatarUploadModal } from './AvatarUploadModal';

interface EditProfileScreenProps {
  user: UserProfile;
  onBack: () => void;
  onSaveUser: (updated: UserProfile) => void;
}

const REGIONS: Region[] = [
  'Oman',
  'India',
  'UAE',
  'Saudi Arabia',
  'Qatar',
  'Kuwait',
  'Bahrain',
  'Bangladesh',
  'Pakistan',
  'Middle East',
  'Southeast Asia',
  'Global'
];

const CONTENT_LANGUAGES = [
  { id: 'English', label: 'English', sub: 'Global Community' },
  { id: 'Malayalam', label: 'മലയാളം (Malayalam)', sub: 'Kerala & Gulf' },
  { id: 'Hindi', label: 'हिन्दी (Hindi)', sub: 'North & Central India' },
  { id: 'Arabic', label: 'العربية (Arabic)', sub: 'Middle East & GCC' }
];

const AVAILABLE_TAGS = [
  'Romantic',
  'Music Lover',
  'Singing',
  'Gaming',
  'Night Owl',
  'Movie Buff',
  'Chill Vibes',
  'Foodie',
  'Deep Talk',
  'Dance',
  'Acoustic',
  'Poetry'
];

const SAMPLE_COVERS = [
  'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80'
];

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80'
];

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  user,
  onBack,
  onSaveUser
}) => {
  // 1. Cover Photo & Avatar
  const [coverPhoto, setCoverPhoto] = useState<string>(
    user.coverPhoto || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1200&auto=format&fit=crop&q=80'
  );
  const [avatar, setAvatar] = useState<string>(user.avatar);

  // 2. Nickname
  const [nickname, setNickname] = useState<string>(user.name);

  // 3. Gender
  const [gender, setGender] = useState<Gender>(user.gender || 'female');

  // 4. Birthday
  const [birthday, setBirthday] = useState<string>(user.birthday || '2002-05-18');

  // 5. Region (Default Oman or India)
  const [region, setRegion] = useState<Region>(user.region || 'Oman');

  // 6. Personal Signature (Text area)
  const [signature, setSignature] = useState<string>(
    user.signature || user.bio || 'Finding romantic souls & beautiful moments on AmoreX! ✨'
  );

  // 7. Location Visibility Toggle (Hidden / Visible)
  const [locationVisible, setLocationVisible] = useState<boolean>(user.locationVisible ?? true);

  // 8. Content Language (Radio list)
  const [contentLanguage, setContentLanguage] = useState<string>(user.contentLanguage || 'English');

  // 9. Tags
  const [selectedTags, setSelectedTags] = useState<string[]>(
    user.tags && user.tags.length > 0 ? user.tags : ['Romantic', 'Night Owl', 'Music Lover']
  );

  // UI helpers
  const [showSavedToast, setShowSavedToast] = useState<boolean>(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState<boolean>(false);
  const [isUploadingCover, setIsUploadingCover] = useState<boolean>(false);
  const [coverUploadNotice, setCoverUploadNotice] = useState<string>('');
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // Handle Cover Photo File Upload with base64 Data URL
  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    sound.playClick();

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setCoverPhoto(result);
        setIsUploadingCover(false);
        setCoverUploadNotice('Cover photo updated!');
        setTimeout(() => setCoverUploadNotice(''), 2500);
      }
    };
    reader.onerror = () => {
      setIsUploadingCover(false);
      setCoverUploadNotice('Upload failed. Please try another image.');
      setTimeout(() => setCoverUploadNotice(''), 2500);
    };
    reader.readAsDataURL(file);
  };

  // Handle Avatar File Upload
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playClick();
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setAvatar(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Toggle tag
  const handleToggleTag = (tag: string) => {
    sound.playClick();
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      if (selectedTags.length >= 6) return;
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Handle Save
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nickname.trim()) return;

    sound.playCoinDrop();

    // Push update to storage/database
    const updated = updateUserProfile({
      userId: user.id,
      name: nickname.trim(),
      avatar,
      coverPhoto,
      gender,
      birthday,
      region,
      signature: signature.trim(),
      bio: signature.trim(),
      locationVisible,
      contentLanguage,
      tags: selectedTags
    });

    if (updated) {
      onSaveUser(updated);
    }

    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onBack();
    }, 900);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full max-w-xl mx-auto pb-28 text-white"
    >
      {/* Top App Bar */}
      <div className="flex items-center justify-between py-3.5 px-3 border-b border-white/10 sticky top-0 bg-[#0B0D1B]/95 backdrop-blur-md z-30 shadow-md">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="text-center">
          <h2 className="text-sm font-black tracking-wide text-white">Edit Profile</h2>
          <p className="text-[10px] text-gray-400">ID: {user.displayId || user.id}</p>
        </div>

        <button
          onClick={() => handleSave()}
          className="px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-[#FF2E93] text-white font-black text-xs shadow-[0_0_15px_rgba(255,46,147,0.4)] hover:opacity-95 cursor-pointer flex items-center gap-1.5 transition-all"
        >
          <Save size={13} />
          <span>Save</span>
        </button>
      </div>

      {/* Success Notification Toast */}
      <AnimatePresence>
        {showSavedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-500 text-black font-black text-xs rounded-full shadow-2xl flex items-center gap-2"
          >
            <Check size={16} />
            <span>Profile Data Saved & Synchronized!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-3 sm:p-4 space-y-4">
        {/* ========================================================================= */}
        {/* ROW 1: COVER PHOTO WITH UPLOAD BUTTON & AVATAR OVERLAY */}
        {/* ========================================================================= */}
        <div className="rounded-3xl bg-[#12142B] border border-white/10 overflow-hidden shadow-lg">
          {/* Cover Photo Banner */}
          <div className="relative h-36 sm:h-44 w-full bg-black/40 overflow-hidden group">
            <img
              referrerPolicy="no-referrer"
              src={coverPhoto}
              alt="Cover"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#12142B] via-black/30 to-transparent" />

            {/* Hidden File Input for Cover */}
            <input
              ref={coverFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverFileUpload}
            />

            {/* Cover Upload Button on top right */}
            <button
              type="button"
              onClick={() => coverFileInputRef.current?.click()}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg cursor-pointer transition-all"
            >
              <Upload size={13} className="text-pink-400" />
              <span>{isUploadingCover ? 'Uploading...' : 'Change Cover'}</span>
            </button>

            {coverUploadNotice && (
              <div className="absolute top-3 left-3 px-3 py-1 bg-pink-500/90 text-white text-[10px] font-bold rounded-full">
                {coverUploadNotice}
              </div>
            )}
          </div>

          {/* Preset Cover Photos Picker & Avatar Row */}
          <div className="p-4 pt-0 -mt-12 flex items-end justify-between relative z-10">
            {/* Avatar with Upload Badge */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsAvatarModalOpen(true);
                }}
                className="group relative block rounded-full transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                title="Change Profile Picture"
              >
                <img
                  referrerPolicy="no-referrer"
                  src={avatar}
                  alt={nickname}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-[#12142B] shadow-[0_0_20px_rgba(255,46,147,0.4)]"
                />
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={18} className="text-pink-300" />
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsAvatarModalOpen(true);
                }}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center border-2 border-[#12142B] shadow-md cursor-pointer hover:scale-110 active:scale-95 transition-all"
                title="Upload Avatar"
              >
                <Camera size={13} />
              </button>
            </div>

            {/* Quick Preset Covers */}
            <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/10">
              <span className="text-[10px] text-gray-400 pl-1 pr-0.5">Presets:</span>
              {SAMPLE_COVERS.map((cov, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setCoverPhoto(cov);
                  }}
                  className={`w-7 h-7 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                    coverPhoto === cov ? 'border-pink-500 scale-105' : 'border-white/20 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={cov} alt="Preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Preset Avatars Picker */}
          <div className="px-4 pb-3 flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-[10px] text-gray-400 shrink-0">Avatar Presets:</span>
            {SAMPLE_AVATARS.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setAvatar(img);
                }}
                className={`w-8 h-8 rounded-full overflow-hidden border transition-all shrink-0 cursor-pointer ${
                  avatar === img ? 'border-pink-500 ring-2 ring-pink-500/30' : 'border-white/20 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="Preset" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FORM-STYLE LIST LAYOUT ROWS */}
        {/* ========================================================================= */}
        <div className="rounded-3xl bg-[#12142B] border border-white/10 divide-y divide-white/5 overflow-hidden shadow-lg">
          {/* ROW 2: NICKNAME (Text Input) */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-bold text-gray-300 flex items-center gap-2 shrink-0">
              <User size={15} className="text-pink-400" />
              <span>Nickname</span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your nickname..."
              maxLength={30}
              className="w-full sm:max-w-xs bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-pink-500 transition-colors"
            />
          </div>

          {/* ROW 3: GENDER (Selection) */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-bold text-gray-300 flex items-center gap-2 shrink-0">
              <Heart size={15} className="text-rose-400" />
              <span>Gender</span>
            </label>
            <div className="flex items-center gap-2">
              {(['female', 'male', 'other'] as Gender[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setGender(g);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    gender === g
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                      : 'bg-black/40 text-gray-400 hover:text-white border border-white/10'
                  }`}
                >
                  {g === 'female' ? '♀ Female' : g === 'male' ? '♂ Male' : '⚧ Other'}
                </button>
              ))}
            </div>
          </div>

          {/* ROW 4: BIRTHDAY (Date Picker) */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-bold text-gray-300 flex items-center gap-2 shrink-0">
              <Calendar size={15} className="text-amber-400" />
              <span>Birthday</span>
            </label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full sm:max-w-xs bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-pink-500 transition-colors cursor-pointer [color-scheme:dark]"
            />
          </div>

          {/* ROW 5: REGION (Dropdown / Selection - Default Oman / India) */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-bold text-gray-300 flex items-center gap-2 shrink-0">
              <Globe size={15} className="text-cyan-400" />
              <span>Region / Country</span>
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as Region)}
              className="w-full sm:max-w-xs bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-pink-500 transition-colors cursor-pointer [color-scheme:dark]"
            >
              {REGIONS.map((r) => (
                <option key={r} value={r} className="bg-[#12142B] text-white">
                  {r === 'Oman' ? '🇴🇲 Oman (Default GCC)' : r === 'India' ? '🇮🇳 India' : r}
                </option>
              ))}
            </select>
          </div>

          {/* ROW 6: PERSONAL SIGNATURE (Text Area) */}
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-2">
                <FileText size={15} className="text-indigo-400" />
                <span>Personal Signature / Bio</span>
              </label>
              <span className="text-[10px] text-gray-400">{signature.length}/150</span>
            </div>
            <textarea
              rows={3}
              maxLength={150}
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Express yourself in AmoreX Live Universe..."
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-colors resize-none"
            />
          </div>

          {/* ROW 7: LOCATION VISIBILITY TOGGLE (Hidden / Visible) */}
          <div className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  locationVisible ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
                }`}
              >
                <MapPin size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Location Visibility</p>
                <p className="text-[10px] text-gray-400">
                  {locationVisible ? 'Visible to nearby live users and party rooms' : 'Hidden from public profiles'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setLocationVisible(!locationVisible);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                locationVisible
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30'
                  : 'bg-white/10 text-gray-400 border border-white/10'
              }`}
            >
              {locationVisible ? <Eye size={13} /> : <EyeOff size={13} />}
              <span>{locationVisible ? 'Visible' : 'Hidden'}</span>
            </button>
          </div>

          {/* ROW 8: CONTENT LANGUAGE (Radio Button List) */}
          <div className="p-4 space-y-2.5">
            <label className="text-xs font-bold text-gray-300 flex items-center gap-2">
              <Languages size={15} className="text-purple-400" />
              <span>Content Language</span>
            </label>
            <p className="text-[10px] text-gray-400">
              Select your primary language for streams, party lounges, and AI translation:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {CONTENT_LANGUAGES.map((lang) => {
                const isSelected = contentLanguage === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setContentLanguage(lang.id);
                    }}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-pink-500/15 border-pink-500 shadow-md shadow-pink-500/20'
                        : 'bg-black/30 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <p className={`text-xs font-bold ${isSelected ? 'text-pink-300' : 'text-white'}`}>
                        {lang.label}
                      </p>
                      <p className="text-[10px] text-gray-400">{lang.sub}</p>
                    </div>

                    {/* Radio Indicator */}
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-pink-500 bg-pink-500' : 'border-gray-500'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ROW 9: TAGS (Interactive Interest Tags) */}
          <div className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-2">
                <Tag size={15} className="text-yellow-400" />
                <span>Interests & Romance Tags</span>
              </label>
              <span className="text-[10px] text-gray-400">{selectedTags.length}/6 selected</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm scale-105'
                        : 'bg-black/40 text-gray-300 hover:text-white border border-white/10'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Save Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => handleSave()}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-[#FF2E93] to-purple-600 text-white font-black text-sm shadow-[0_0_25px_rgba(255,46,147,0.45)] hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check size={16} />
            <span>Save & Apply Changes</span>
          </button>
        </div>
      </div>

      {/* Profile Picture Cloud Storage & Firestore Upload Modal */}
      <AvatarUploadModal
        isOpen={isAvatarModalOpen}
        currentAvatar={avatar}
        userId={user.id}
        userName={nickname}
        onClose={() => setIsAvatarModalOpen(false)}
        onUploadSuccess={(newAvatarUrl, updatedUser) => {
          setAvatar(newAvatarUrl);
          onSaveUser(updatedUser);
        }}
      />
    </motion.div>
  );
};
