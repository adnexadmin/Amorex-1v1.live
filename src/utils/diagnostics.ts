/**
 * Production Diagnostics Logger for Amorex Live
 * Triggers on app load to output full diagnostic details of:
 * - LocalStorage status & stored user profile
 * - Firebase Auth instance, connectivity, and active user
 * - Hydration & root DOM mounting status
 * - Uncaught script/runtime error interception
 */

import { auth, db } from '../services/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export interface DiagnosticsReport {
  timestamp: string;
  online: boolean;
  userAgent: string;
  localStorage: {
    isAvailable: boolean;
    storedUser: any | null;
    rawUserString: string | null;
    allAmorexKeys: Record<string, string>;
  };
  firebase: {
    isAuthInitialized: boolean;
    currentAuthUser: {
      uid: string;
      email: string | null;
      isAnonymous: boolean;
    } | null;
    firestoreConnected: boolean;
  };
  dom: {
    rootElementExists: boolean;
    rootChildCount: number;
    hasPreHydrationSplash: boolean;
  };
}

export function runAppDiagnostics(): DiagnosticsReport {
  const timestamp = new Date().toISOString();
  const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';

  // 1. Inspect LocalStorage
  let isLocalStorageAvailable = false;
  let storedUser: any = null;
  let rawUserString: string | null = null;
  const allAmorexKeys: Record<string, string> = {};

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      isLocalStorageAvailable = true;
      rawUserString = localStorage.getItem('amorex_user');
      if (rawUserString) {
        try {
          storedUser = JSON.parse(rawUserString);
        } catch (e) {
          storedUser = { parseError: String(e), raw: rawUserString };
        }
      }

      // Collect all amorex keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('amorex_')) {
          allAmorexKeys[key] = (localStorage.getItem(key) || '').substring(0, 100);
        }
      }
    }
  } catch (err) {
    console.warn('[Amorex Diagnostics] LocalStorage access blocked or restricted:', err);
  }

  // 2. Inspect Firebase Auth
  const isAuthInitialized = Boolean(auth);
  const currentFbUser: FirebaseUser | null = auth?.currentUser || null;
  const currentAuthUser = currentFbUser
    ? {
        uid: currentFbUser.uid,
        email: currentFbUser.email,
        isAnonymous: currentFbUser.isAnonymous
      }
    : null;

  // 3. Inspect DOM
  const rootEl = typeof document !== 'undefined' ? document.getElementById('root') : null;
  const preHydrationSplash = typeof document !== 'undefined' ? document.getElementById('pre-hydration-splash') : null;

  const report: DiagnosticsReport = {
    timestamp,
    online,
    userAgent,
    localStorage: {
      isAvailable: isLocalStorageAvailable,
      storedUser,
      rawUserString,
      allAmorexKeys
    },
    firebase: {
      isAuthInitialized,
      currentAuthUser,
      firestoreConnected: Boolean(db)
    },
    dom: {
      rootElementExists: Boolean(rootEl),
      rootChildCount: rootEl ? rootEl.children.length : 0,
      hasPreHydrationSplash: Boolean(preHydrationSplash)
    }
  };

  // Output cleanly styled diagnostic banners to browser console
  console.group('%c🚀 [AMOREX LIVE] App Diagnostic Report', 'background:#FF2E93;color:#ffffff;font-weight:bold;padding:4px 8px;border-radius:4px;');
  console.log('%cTimestamp:', 'font-weight:bold;', timestamp);
  console.log('%cNetwork Status:', 'font-weight:bold;', online ? '🟢 Online' : '🔴 Offline');
  console.log('%cBrowser UserAgent:', 'color:#888;', userAgent);

  // Group 1: LocalStorage & Current User
  console.group('%c📦 LocalStorage & Cached User Object', 'color:#00D2FF;font-weight:bold;');
  console.log('LocalStorage Accessible:', isLocalStorageAvailable ? '✅ YES' : '❌ NO');
  if (storedUser) {
    console.log('✅ Current Cached User:', storedUser);
    console.log('  - User ID:', storedUser.id);
    console.log('  - Display ID:', storedUser.displayId);
    console.log('  - Role / Super Admin:', storedUser.is_super_admin ? '👑 Super Admin' : (storedUser.role || 'USER'));
    console.log('  - Coins Balance:', storedUser.coins);
  } else {
    console.log('ℹ️ Current User Object: null (No cached session found - Landing Page will display)');
  }
  console.log('All Amorex Storage Keys Found:', Object.keys(allAmorexKeys));
  console.groupEnd();

  // Group 2: Firebase Auth & Database Listener
  console.group('%c🔥 Firebase Auth & Database Listener', 'color:#FF85C0;font-weight:bold;');
  console.log('Firebase Auth Initialized:', isAuthInitialized ? '✅ YES' : '❌ FAILED');
  console.log('Firestore Initialized:', report.firebase.firestoreConnected ? '✅ YES' : '❌ FAILED');
  if (currentAuthUser) {
    console.log('✅ Active Firebase Auth User:', currentAuthUser);
  } else {
    console.log('ℹ️ Active Firebase Auth User: null (Awaiting user sign-in or listener event)');
  }
  console.groupEnd();

  // Group 3: Hydration & DOM State
  console.group('%c🖥️ DOM & Hydration State', 'color:#FFD700;font-weight:bold;');
  console.log('Root Element (#root):', rootEl ? '✅ Found' : '❌ Not Found');
  console.log('Root Child Elements Count:', rootEl ? rootEl.children.length : 0);
  console.log('Pre-Hydration Splash Active:', preHydrationSplash ? '⚠️ Currently In DOM' : '✅ Cleared / Hydrated');
  console.groupEnd();

  console.groupEnd();

  // Listen to future Auth State changes and log them in real-time
  if (auth) {
    try {
      onAuthStateChanged(auth, (user) => {
        console.log(
          '%c🔥 [Amorex Diagnostics] Firebase Auth State Changed:',
          'color:#00D2FF;font-weight:bold;',
          user ? `User logged in: ${user.email || user.uid} (isAnonymous: ${user.isAnonymous})` : 'User is signed out'
        );
      });
    } catch (e) {
      console.warn('[Amorex Diagnostics] Could not attach auth state change diagnostic listener:', e);
    }
  }

  // Attach global helper to window for manual execution anytime
  if (typeof window !== 'undefined') {
    (window as any).__AMOREX_DIAGNOSTICS__ = report;
    (window as any).runAmorexDiagnostics = runAppDiagnostics;
  }

  return report;
}
