import { useState, useEffect, useCallback, useRef } from 'react';

export type DeviceOrientationType = 'portrait' | 'landscape';

export interface DeviceOrientationState {
  orientation: DeviceOrientationType;
  isLandscape: boolean;
  isPortrait: boolean;
  angle: number;
  viewportWidth: number;
  viewportHeight: number;
  aspectRatio: number;
  isRotating: boolean;
}

/**
 * Hook to smoothly track and react to device orientation and viewport dimension changes on mobile & desktop.
 * Handles window resize, orientationchange, screen.orientation, and matchMedia listeners.
 */
export function useDeviceOrientation(): DeviceOrientationState {
  const getOrientationState = useCallback((): Omit<DeviceOrientationState, 'isRotating'> => {
    if (typeof window === 'undefined') {
      return {
        orientation: 'portrait',
        isLandscape: false,
        isPortrait: true,
        angle: 0,
        viewportWidth: 390,
        viewportHeight: 844,
        aspectRatio: 390 / 844
      };
    }

    const width = window.visualViewport?.width || window.innerWidth || document.documentElement.clientWidth || 390;
    const height = window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight || 844;
    const isLandscape = width > height;
    const orientation: DeviceOrientationType = isLandscape ? 'landscape' : 'portrait';

    let angle = 0;
    if (window.screen?.orientation?.angle !== undefined) {
      angle = window.screen.orientation.angle;
    } else if (typeof (window as unknown as { orientation?: number }).orientation === 'number') {
      angle = (window as unknown as { orientation: number }).orientation;
    } else {
      angle = isLandscape ? 90 : 0;
    }

    return {
      orientation,
      isLandscape,
      isPortrait: !isLandscape,
      angle,
      viewportWidth: width,
      viewportHeight: height,
      aspectRatio: width / (height || 1)
    };
  }, []);

  const [state, setState] = useState<DeviceOrientationState>(() => ({
    ...getOrientationState(),
    isRotating: false
  }));

  const rotatingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let rafId: number | null = null;

    const handleOrientationOrResize = () => {
      if (rafId) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        const next = getOrientationState();
        
        setState((prev) => {
          // Check if orientation flipped
          const orientationChanged = prev.orientation !== next.orientation;
          
          if (orientationChanged) {
            if (rotatingTimeoutRef.current) clearTimeout(rotatingTimeoutRef.current);
            rotatingTimeoutRef.current = setTimeout(() => {
              setState((current) => ({ ...current, isRotating: false }));
            }, 500);
          }

          return {
            ...next,
            isRotating: orientationChanged ? true : prev.isRotating
          };
        });
      });
    };

    // 1. Screen Orientation API
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener('change', handleOrientationOrResize);
    }

    // 2. Legacy Orientation Change (iOS Safari)
    window.addEventListener('orientationchange', handleOrientationOrResize, { passive: true });

    // 3. Media Query Matcher
    const mql = window.matchMedia('(orientation: landscape)');
    if (mql.addEventListener) {
      mql.addEventListener('change', handleOrientationOrResize);
    } else if ('addListener' in mql) {
      (mql as unknown as { addListener: (cb: () => void) => void }).addListener(handleOrientationOrResize);
    }

    // 4. Window Resize & Visual Viewport
    window.addEventListener('resize', handleOrientationOrResize, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleOrientationOrResize, { passive: true });
    }

    // Initial sync
    handleOrientationOrResize();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (rotatingTimeoutRef.current) clearTimeout(rotatingTimeoutRef.current);

      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener('change', handleOrientationOrResize);
      }
      window.removeEventListener('orientationchange', handleOrientationOrResize);
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handleOrientationOrResize);
      } else if ('removeListener' in mql) {
        (mql as unknown as { removeListener: (cb: () => void) => void }).removeListener(handleOrientationOrResize);
      }
      window.removeEventListener('resize', handleOrientationOrResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleOrientationOrResize);
      }
    };
  }, [getOrientationState]);

  return state;
}
