import React, { useState } from 'react';
import { sound } from '../../utils/audio';
import { Mic, Video, ShieldCheck, X, Sparkles, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface GuestSeatModalProps {
  seatNumber: number;
  roomTitle: string;
  hostName: string;
  onConfirm: (withVideo?: boolean) => void;
  onClose: () => void;
}

export const GuestSeatModal: React.FC<GuestSeatModalProps> = ({
  seatNumber,
  roomTitle,
  hostName,
  onConfirm,
  onClose
}) => {
  const [joinWithVideo, setJoinWithVideo] = useState<boolean>(true);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm bg-[#14162B] border border-cyan-400/40 rounded-3xl p-5 shadow-2xl text-white relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full bg-white/5"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col items-center text-center space-y-3">
          {/* Animated Mic & Seat Icon */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#00D2FF] to-pink-500 flex items-center justify-center shadow-[0_0_20px_rgba(0,210,255,0.5)]">
              {joinWithVideo ? (
                <Video size={28} className="text-[#090A15]" />
              ) : (
                <Mic size={28} className="text-[#090A15]" />
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 bg-amber-400 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full">
              #{seatNumber}
            </span>
          </div>

          <div>
            <h3 className="text-base font-black text-white flex items-center justify-center gap-1">
              <span>Join Live Group Call?</span>
              <Sparkles size={14} className="text-[#FFD700]" />
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Join <span className="text-cyan-300 font-bold">Seat #{seatNumber}</span> in {roomTitle}
            </p>
            <p className="text-[11px] text-pink-300">Host: {hostName}</p>
          </div>

          {/* Media Mode Selection */}
          <div className="w-full grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                sound.playClick();
                setJoinWithVideo(true);
              }}
              className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                joinWithVideo
                  ? 'bg-gradient-to-b from-pink-500/30 to-purple-600/30 border-pink-400 text-white shadow-[0_0_12px_rgba(255,46,147,0.3)]'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <Video size={16} className={joinWithVideo ? 'text-pink-400' : 'text-gray-400'} />
              <span>Video &amp; Mic</span>
              <span className="text-[9px] text-pink-300 font-medium">Real Camera</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setJoinWithVideo(false);
              }}
              className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                !joinWithVideo
                  ? 'bg-gradient-to-b from-cyan-500/30 to-blue-600/30 border-cyan-400 text-white shadow-[0_0_12px_rgba(0,210,255,0.3)]'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <Mic size={16} className={!joinWithVideo ? 'text-cyan-400' : 'text-gray-400'} />
              <span>Audio Only</span>
              <span className="text-[9px] text-cyan-300 font-medium">Mic Stream</span>
            </button>
          </div>

          <div className="w-full bg-black/40 rounded-2xl p-3 border border-white/10 text-left space-y-1.5 text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
              <span>Real-Time WebRTC Group Call Mesh</span>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck size={14} className="text-cyan-400 shrink-0" />
              <span>Live speaking volume meter &amp; talking aura</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex items-center gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={() => {
                sound.playCoinDrop();
                onConfirm(joinWithVideo);
              }}
              className="flex-2 py-2.5 rounded-2xl bg-gradient-to-r from-[#00D2FF] via-[#FF2E93] to-pink-500 hover:opacity-90 text-white text-xs font-extrabold shadow-[0_0_15px_rgba(0,210,255,0.4)] transition-transform hover:scale-102 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {joinWithVideo ? <Video size={14} /> : <Mic size={14} />}
              <span>{joinWithVideo ? 'Join Video Group Call' : 'Take Seat & Open Mic'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
