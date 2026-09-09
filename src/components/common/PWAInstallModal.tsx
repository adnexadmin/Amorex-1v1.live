import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Share, PlusSquare, Download, CheckCircle2, Smartphone, Monitor } from 'lucide-react';
import { sound } from '../../utils/audio';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleTriggerInstall = async () => {
    sound.playClick();
    if (isInstallable) {
      const installed = await install();
      if (installed) {
        sound.playJackpotFanfare();
        onClose();
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-gradient-to-b from-[#16192E] via-[#0E1020] to-[#070810] border border-pink-500/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(255,23,68,0.3)] text-white overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Header with App Logo */}
          <div className="text-center pt-2 pb-4 flex flex-col items-center">
            {/* Installed App Logo Icon Preview */}
            <div className="relative mb-3 group">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(255,23,68,0.6)] border-2 border-pink-500/60 p-0.5 bg-gradient-to-b from-[#FF2E93] to-[#FF1744]">
                <img
                  src="/apple-touch-icon.png"
                  alt="Amorex App Logo"
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
                <span>HD</span>
              </div>
            </div>

            <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              <span>Install Amorex App</span>
            </h3>
            <p className="text-xs text-gray-300 mt-1 max-w-xs leading-relaxed">
              Installs with the official 3D glowing Amorex logo and edge-to-edge fullscreen optimization for live 1v1 video calls.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-3 gap-2 mb-4 text-center">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <div className="text-sm mb-1">⚡</div>
              <div className="text-[11px] font-bold text-white">Instant Launch</div>
              <div className="text-[9px] text-gray-400">Zero browser lag</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <div className="text-sm mb-1">📱</div>
              <div className="text-[11px] font-bold text-white">App Icon</div>
              <div className="text-[9px] text-gray-400">On your Home screen</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <div className="text-sm mb-1">💎</div>
              <div className="text-[11px] font-bold text-white">Full Screen</div>
              <div className="text-[9px] text-gray-400">No address bars</div>
            </div>
          </div>

          {/* Status or Instructions */}
          {isInstalled ? (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 mb-4">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <span>Amorex Live is already installed on your device!</span>
            </div>
          ) : isInstallable ? (
            <div className="space-y-3 mb-4">
              <button
                onClick={handleTriggerInstall}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF1744] via-[#FF2E93] to-[#00D2FF] hover:opacity-95 text-white font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(255,23,68,0.5)] flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
              >
                <Download size={18} />
                <span>Install Web App Now</span>
              </button>
              <p className="text-[10px] text-center text-gray-400">
                Tap button above to open the native browser install dialog.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 my-3 text-xs">
              {isIOS ? (
                <div className="p-3 rounded-2xl bg-white/5 border border-pink-500/20 space-y-2">
                  <div className="font-bold text-pink-400 flex items-center gap-1.5">
                    <Smartphone size={14} />
                    <span>How to Install on iPhone / iPad (Safari):</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-gray-200 text-[11px]">
                    <span className="w-5 h-5 rounded-full bg-blue-500/30 text-cyan-300 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                    <span>Tap the <Share size={12} className="inline text-cyan-400 mx-0.5" /> <strong>Share</strong> icon in the bottom Safari toolbar.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-gray-200 text-[11px]">
                    <span className="w-5 h-5 rounded-full bg-pink-500/30 text-pink-300 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                    <span>Scroll down and select <PlusSquare size={12} className="inline text-pink-400 mx-0.5" /> <strong>Add to Home Screen</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-gray-200 text-[11px]">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                    <span>Tap <strong>Add</strong> at top-right. Amorex 3D logo will appear on your screen!</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-white/5 border border-cyan-500/20 space-y-2">
                  <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                    <Monitor size={14} />
                    <span>How to Install on Chrome / Android / PC:</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-gray-200 text-[11px]">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/30 text-cyan-300 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                    <span>Click the <strong>Install</strong> icon in your browser URL bar or tap the three dots (⋮) menu.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-gray-200 text-[11px]">
                    <span className="w-5 h-5 rounded-full bg-pink-500/30 text-pink-300 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                    <span>Select <strong>Install Amorex Live</strong> to add the app icon to your launcher or desktop.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Close / Action Button */}
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-200 font-bold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
