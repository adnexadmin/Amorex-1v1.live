import { useState, useEffect, useRef, useCallback } from 'react';
import { NavigationTab, UserProfile, UserEngagementMetrics } from '../types';
import { saveEngagementMetricsToFirestore } from '../services/firebase';

interface UseEngagementAnalyticsOptions {
  user: UserProfile | null;
  currentTab: NavigationTab | string;
  heartbeatIntervalMs?: number;
  enabled?: boolean;
}

export interface UseEngagementAnalyticsReturn {
  sessionId: string;
  sessionDuration: number;
  tabNavigationFrequency: Record<string, number>;
  totalTabSwitches: number;
  isOnline: boolean;
  syncNow: () => Promise<void>;
}

const SESSION_STORAGE_KEY = 'amorex_analytics_session_id';
const SESSION_START_KEY = 'amorex_analytics_session_start';

/**
 * Hook to track user engagement metrics (session duration, tab navigation frequency)
 * and synchronize them in real-time to the Firebase 'analytics' collection for the Super Admin dashboard.
 */
export function useUserEngagementAnalytics({
  user,
  currentTab,
  heartbeatIntervalMs = 25000,
  enabled = true
}: UseEngagementAnalyticsOptions): UseEngagementAnalyticsReturn {
  // 1. Maintain or initialize session ID and start time
  const [sessionId] = useState<string>(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) return stored;
      const newId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem(SESSION_STORAGE_KEY, newId);
      return newId;
    } catch {
      return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }
  });

  const sessionStartTimeRef = useRef<number>((() => {
    try {
      const stored = sessionStorage.getItem(SESSION_START_KEY);
      if (stored) return parseInt(stored, 10);
      const now = Date.now();
      sessionStorage.setItem(SESSION_START_KEY, now.toString());
      return now;
    } catch {
      return Date.now();
    }
  })());

  const [sessionDuration, setSessionDuration] = useState<number>(0);
  const [tabNavigationFrequency, setTabNavigationFrequency] = useState<Record<string, number>>(() => {
    return {
      [currentTab]: 1
    };
  });
  const [totalTabSwitches, setTotalTabSwitches] = useState<number>(1);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  const prevTabRef = useRef<string>(currentTab);
  const isSyncingRef = useRef<boolean>(false);
  const lastTabSwitchTimeRef = useRef<number>(Date.now());

  // Detect device platform safely
  const getDevicePlatform = useCallback((): string => {
    if (typeof window === 'undefined') return 'unknown';
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'Android';
    if (/iPad|iPhone|iPod/.test(ua)) return 'iOS';
    if (/Windows/i.test(ua)) return 'Windows';
    if (/Macintosh/i.test(ua)) return 'macOS';
    if (/Linux/i.test(ua)) return 'Linux';
    return 'Web';
  }, []);

  // Construct complete metrics payload
  const buildMetricsPayload = useCallback(
    (onlineOverride?: boolean): UserEngagementMetrics => {
      const startTime = sessionStartTimeRef.current;
      const now = Date.now();
      const durationSeconds = Math.max(0, Math.floor((now - startTime) / 1000));

      return {
        sessionId,
        userId: user?.id || 'guest',
        userDisplayId: user?.displayId || '88200000',
        userName: user?.name || 'Guest User',
        userEmail: user?.email || '',
        role: user?.role || (user?.is_super_admin ? 'SUPER_ADMIN' : 'USER'),
        sessionStartTime: startTime,
        lastActiveTime: now,
        sessionDurationSeconds: durationSeconds,
        currentTab: String(currentTab || 'LIVE'),
        tabNavigationFrequency: tabNavigationFrequency || { LIVE: 1 },
        totalTabSwitches: totalTabSwitches || 1,
        devicePlatform: getDevicePlatform() || 'Web',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        isOnline: onlineOverride !== undefined ? onlineOverride : (typeof navigator !== 'undefined' ? navigator.onLine : true),
        updatedAt: new Date().toISOString()
      };
    },
    [sessionId, user, currentTab, tabNavigationFrequency, totalTabSwitches, getDevicePlatform]
  );

  // Sync to Firebase 'analytics' collection
  const syncToFirestore = useCallback(
    async (onlineStatus?: boolean) => {
      if (!enabled) return;
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;

      try {
        const payload = buildMetricsPayload(onlineStatus);
        await saveEngagementMetricsToFirestore(payload);
      } catch (err) {
        console.warn('Engagement metrics sync error:', err);
      } finally {
        isSyncingRef.current = false;
      }
    },
    [enabled, buildMetricsPayload]
  );

  // 2. Track tab changes and update navigation frequencies
  useEffect(() => {
    if (!enabled) return;

    if (prevTabRef.current !== currentTab) {
      prevTabRef.current = currentTab;
      lastTabSwitchTimeRef.current = Date.now();

      setTabNavigationFrequency((prev) => {
        const updated = {
          ...prev,
          [currentTab]: (prev[currentTab] || 0) + 1
        };
        return updated;
      });
      setTotalTabSwitches((prev) => prev + 1);
    }
  }, [currentTab, enabled]);

  // 3. Local session duration ticker (every second)
  useEffect(() => {
    if (!enabled) return;

    const startTime = sessionStartTimeRef.current;

    const ticker = setInterval(() => {
      const now = Date.now();
      const secs = Math.max(0, Math.floor((now - startTime) / 1000));
      setSessionDuration(secs);
    }, 1000);

    return () => clearInterval(ticker);
  }, [enabled]);

  // 4. Trigger sync on tab navigation frequency update (debounced)
  useEffect(() => {
    if (!enabled) return;

    const timeout = setTimeout(() => {
      syncToFirestore(true);
    }, 1500);

    return () => clearTimeout(timeout);
  }, [currentTab, totalTabSwitches, syncToFirestore, enabled]);

  // 5. Periodic Heartbeat Sync to Firestore
  useEffect(() => {
    if (!enabled) return;

    // Initial sync on mount
    syncToFirestore(true);

    const interval = setInterval(() => {
      syncToFirestore(true);
    }, heartbeatIntervalMs);

    return () => clearInterval(interval);
  }, [heartbeatIntervalMs, syncToFirestore, enabled]);

  // 6. Online / Offline and Page Visibility Listeners
  useEffect(() => {
    if (!enabled) return;

    const handleOnline = () => {
      setIsOnline(true);
      syncToFirestore(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      syncToFirestore(false);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        syncToFirestore(false);
      } else {
        syncToFirestore(true);
      }
    };

    const handleBeforeUnload = () => {
      // Best effort sync on close
      syncToFirestore(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [syncToFirestore, enabled]);

  return {
    sessionId,
    sessionDuration,
    tabNavigationFrequency,
    totalTabSwitches,
    isOnline,
    syncNow: () => syncToFirestore()
  };
}
