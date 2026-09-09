import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';
import { AmorexLogo } from './AmorexLogo';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  override state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[AmoreX Application Recovery] Uncaught UI error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleClearAndReset = () => {
    try {
      sessionStorage.clear();
    } catch {
      // ignore
    }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#090A15] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-[#12142B] border border-pink-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex justify-center mb-4">
              <AmorexLogo size="lg" />
            </div>

            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <AlertTriangle size={28} />
            </div>

            <h2 className="text-xl font-black text-white mb-2">Something went wrong</h2>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              We encountered a temporary rendering issue while setting up your profile. You can reload the app to resume your session smoothly.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-[#FF2E93] to-purple-600 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,46,147,0.4)] hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw size={15} />
                <span>Reload App</span>
              </button>

              <button
                type="button"
                onClick={this.handleClearAndReset}
                className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home size={15} />
                <span>Clear Cache & Restart</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
