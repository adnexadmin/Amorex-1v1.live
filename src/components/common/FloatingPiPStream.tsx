import React from 'react';
import { StreamHost } from '../../types';
import { Maximize2, X, Volume2, Radio } from 'lucide-react';
import { motion } from 'motion/react';
import { sound } from '../../utils/audio';

interface FloatingPiPStreamProps {
  host: StreamHost;
  onExpand: () => void;
  onClose: () => void;
}

export const FloatingPiPStream: React.FC<FloatingPiPStreamProps> = ({ host, onExpand, onClose }) => {
  return (
    <motion.div
      drag
      dragConstraints={{ left: 10, right: 300, top: 50, bottom: 500 }}
      initial={{ scale: 0.8, opacity: 0, y: 100 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="fixed bottom-20 right-4 z-50 w-44 rounded-2xl overflow-hidden bg-[#14162B]/95 border border-pink-500/40 shadow-[0_0_25px_rgba(255,46,147,0.4)] backdrop-blur-md cursor-grab active:cursor-grabbing"
    >
      {/* Video Preview / Avatar */}
      <div className="relative aspect-video w-full bg-black/60 overflow-hidden flex items-center justify-center">
        {host.videoUrl ? (
          <video
            src={host.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-90 transition-all duration-300"
          />
        ) : (
          <img
            referrerPolicy="no-referrer"
            src={host.coverImage}
            alt={host.name}
            className="w-full h-full object-cover transition-all duration-300"
          />
        )}

        {/* Live Badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#FF2E93] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shadow-sm">
          <Radio size={10} className="animate-pulse" />
          <span>LIVE</span>
        </div>

        {/* Controls */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <button
            onClick={() => {
              sound.playClick();
              onExpand();
            }}
            aria-label="Maximize stream"
            className="w-6 h-6 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors"
          >
            <Maximize2 size={11} />
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            aria-label="Close PiP"
            className="w-6 h-6 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
          >
            <X size={11} />
          </button>
        </div>

        {/* Audio Wave Bars */}
        <div className="absolute bottom-2 right-2 flex items-end gap-0.5">
          <span className="w-1 h-3 bg-pink-400 rounded-full animate-bounce" />
          <span className="w-1 h-4 bg-cyan-400 rounded-full animate-pulse" />
          <span className="w-1 h-2 bg-amber-400 rounded-full animate-bounce" />
        </div>
      </div>

      {/* Host Mini Info */}
      <div className="p-2 flex items-center justify-between">
        <div className="truncate pr-1">
          <p className="text-xs font-bold text-white truncate">{host.name}</p>
          <p className="text-[10px] text-pink-300 flex items-center gap-1">
            <Volume2 size={10} /> In Stream
          </p>
        </div>
        <button
          onClick={onExpand}
          className="text-[10px] font-bold bg-[#FF2E93] hover:bg-pink-600 text-white px-2 py-1 rounded-lg"
        >
          View
        </button>
      </div>
    </motion.div>
  );
};
