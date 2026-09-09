import React from 'react';
import { StreamHost, UserProfile, VideoFilterType } from '../../types';
import { PrivateCallOverlay } from './PrivateCallOverlay';
import { VideoFilters, getVideoFilterCSS, FILTER_PRESETS } from '../common/VideoFilters';
import { RomanticOverlaysLayer } from '../common/RomanticOverlaysLayer';
import { VideoFilterDrawer } from './VideoFilterDrawer';
import { PostCallSummary, PostCallRatingData } from './PostCallSummary';
import { WebRtcMetricsOverlay } from '../common/WebRtcMetricsOverlay';
import { useWebRtcMetrics, MetricSample, CandidatePairDetails } from '../../hooks/useWebRtcMetrics';
import { WebRtcStatsModal } from './WebRtcStatsModal';
import { WebRtcStats } from '../../services/WebRtcService';
import { NetworkStatsOverlayIcon, NetworkStatsOverlayIconProps } from './NetworkStatsOverlayIcon';

interface ActiveCallModalProps {
  host: StreamHost;
  user: UserProfile;
  onEndCall: (durationSec: number, coinsCharged: number, rating?: number) => void;
  onOpenGiftDrawer: () => void;
  onDeductCoins: (amount: number) => boolean;
}

export const ActiveCallModal: React.FC<ActiveCallModalProps> = (props) => {
  return <PrivateCallOverlay {...props} />;
};

export {
  PrivateCallOverlay,
  NetworkStatsOverlayIcon,
  VideoFilters,
  getVideoFilterCSS,
  FILTER_PRESETS,
  RomanticOverlaysLayer,
  VideoFilterDrawer,
  PostCallSummary,
  WebRtcStatsModal,
  WebRtcMetricsOverlay,
  useWebRtcMetrics
};
export type { VideoFilterType, PostCallRatingData, WebRtcStats, MetricSample, CandidatePairDetails, NetworkStatsOverlayIconProps };


