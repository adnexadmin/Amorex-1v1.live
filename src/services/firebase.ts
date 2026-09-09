import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInAnonymously,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocFromServer
} from 'firebase/firestore';
import { UserProfile, UserLocationData } from '../types';
import {
  SUPER_ADMIN_EMAIL,
  isSuperAdminEmail,
  createSuperAdminProfile,
  generateDisplayId,
  saveRegisteredUser,
  getStoredUser
} from '../utils/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App instance safely (singleton pattern)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: Connect directly to the provisioned database instance as required by Firebase skill
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Structured Firestore error reporting conforming to skill guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Security Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Mandatory connection test
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase & Firestore connected successfully.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline warning: Please verify network connection or Firebase config.');
    }
  }
}
testFirestoreConnection();

/**
 * Check if a username is available across the database
 */
export async function checkUsernameAvailable(rawUsername: string): Promise<boolean> {
  const cleanUsername = rawUsername.trim().toLowerCase();
  if (!cleanUsername || cleanUsername.length < 3) return false;

  const path = `usernames/${cleanUsername}`;
  try {
    const snap = await getDoc(doc(db, 'usernames', cleanUsername));
    return !snap.exists();
  } catch (error) {
    console.warn('Direct Firestore check failed for username:', error);
    // If not authenticated yet or offline, check against local storage index
    const registered = localStorage.getItem('amorex_registered_users');
    if (registered) {
      try {
        const list: UserProfile[] = JSON.parse(registered);
        return !list.some((u) => u.username?.toLowerCase() === cleanUsername);
      } catch {
        return true;
      }
    }
    return true;
  }
}

/**
 * Ensure active Firebase Auth session before cloud Firestore writes
 */
export async function ensureAuthSession(): Promise<FirebaseUser | null> {
  if (auth.currentUser) return auth.currentUser;
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    // Anonymous auth may not be enabled in console, proceed anyway
    return null;
  }
}

/**
 * Register unique username record
 */
export async function claimUsernameInFirestore(username: string, userId: string): Promise<void> {
  if (!auth.currentUser) {
    await ensureAuthSession();
  }
  const clean = username.trim().toLowerCase();
  const path = `usernames/${clean}`;
  try {
    await setDoc(doc(db, 'usernames', clean), {
      userId,
      username: clean,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.warn('Username claim record saved locally fallback:', error);
  }
}

/**
 * Save user profile to Firestore
 */
export async function saveUserToFirestore(user: UserProfile): Promise<void> {
  if (!auth.currentUser) {
    await ensureAuthSession();
  }
  const path = `users/${user.id}`;
  try {
    await setDoc(
      doc(db, 'users', user.id),
      {
        ...user,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
    console.log(`User ${user.id} successfully saved to cloud Firestore.`);
  } catch (error) {
    console.warn('Firestore user save encountered an error, saving to resilient local store:', error);
  } finally {
    saveRegisteredUser(user, true);
  }
}

/**
 * Retrieve user profile from Firestore
 */
export async function getUserFromFirestore(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (error) {
    console.warn('Firestore user fetch fallback to local:', error);
  }
  return getStoredUser(userId);
}

/**
 * Save Real-Time Location data to Firestore backend
 */
export async function saveUserLocationToFirestore(locationData: UserLocationData): Promise<void> {
  const path = `userLocations/${locationData.userId}`;
  try {
    await setDoc(
      doc(db, 'userLocations', locationData.userId),
      {
        ...locationData,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
    console.log('User live location securely persisted to Firestore:', locationData.city, locationData.country);
  } catch (error) {
    console.warn('Firestore location save fallback:', error);
  }
}

/**
 * Sign In with Google OAuth using Firebase Authentication popup
 */
export async function signInWithGoogleOAuth(): Promise<{
  user: UserProfile;
  isNewUser: boolean;
}> {
  const result = await signInWithPopup(auth, googleProvider);
  const fbUser = result.user;
  const userEmail = (fbUser.email || '').toLowerCase().trim();

  // Super-Admin Override
  if (
    isSuperAdminEmail(userEmail) ||
    userEmail === 'adnexadmin@gmail.com' ||
    userEmail === SUPER_ADMIN_EMAIL.toLowerCase()
  ) {
    const superAdmin = createSuperAdminProfile(userEmail);
    await saveUserToFirestore(superAdmin);
    return { user: superAdmin, isNewUser: false };
  }

  // Check if profile exists in Firestore
  let existingProfile: UserProfile | null = null;
  try {
    const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
    if (userDoc.exists()) {
      existingProfile = userDoc.data() as UserProfile;
    }
  } catch (e) {
    console.warn('Firestore profile lookup error:', e);
  }

  if (existingProfile && existingProfile.isOnboarded) {
    saveRegisteredUser(existingProfile, true);
    return { user: existingProfile, isNewUser: false };
  }

  // New User or Incomplete Onboarding
  const defaultAvatar = fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
  const derivedUsername = (fbUser.email ? fbUser.email.split('@')[0] : `user_${fbUser.uid.slice(0, 6)}`)
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .slice(0, 20);

  const newProfile: UserProfile = {
    id: fbUser.uid,
    displayId: generateDisplayId(),
    name: fbUser.displayName || derivedUsername,
    username: derivedUsername,
    email: userEmail,
    avatar: defaultAvatar,
    avatarUrl: defaultAvatar,
    gender: 'female',
    age: 22,
    region: 'India',
    role: 'USER',
    is_super_admin: false,
    isVerifiedHost: false,
    faceVerified: false,
    level: 1,
    experience: 50,
    coins: 180, // 180 Welcome Talk-Time Coins
    gems: 0,
    vouchers: 3, // 3 Free 60-Sec Call Vouchers
    bio: 'Finding romantic moments on Amorex Live ✨',
    followingCount: 0,
    followersCount: 0,
    friendsCount: 0,
    deviceFingerprint: `dev_${fbUser.uid.slice(0, 8)}`,
    registeredAt: Date.now(),
    lastActiveAt: Date.now(),
    timeSpentSeconds: 0,
    isRealUser: true,
    registrationMethod: 'google',
    isOnboarded: false
  };

  saveRegisteredUser(newProfile, true);
  return { user: newProfile, isNewUser: true };
}

/**
 * Configure Firebase phone reCAPTCHA verifier
 */
export function setupRecaptchaVerifier(containerId: string): RecaptchaVerifier {
  // Clear any existing verifier on window if re-rendered
  if (typeof window !== 'undefined' && (window as any).recaptchaVerifier) {
    try {
      (window as any).recaptchaVerifier.clear();
    } catch {
      // ignore
    }
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      console.log('reCAPTCHA verified for Phone Authentication.');
    },
    'expired-callback': () => {
      console.warn('reCAPTCHA expired. Please try sending OTP again.');
    }
  });

  if (typeof window !== 'undefined') {
    (window as any).recaptchaVerifier = verifier;
  }

  return verifier;
}

/**
 * Send Phone SMS OTP via Firebase Auth
 */
export async function sendFirebasePhoneOtp(
  phoneNumber: string,
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  return await signInWithPhoneNumber(auth, phoneNumber, verifier);
}

/**
 * Verify SMS OTP Code
 */
export async function verifyFirebasePhoneOtp(
  confirmationResult: ConfirmationResult,
  otpCode: string,
  rawPhone: string
): Promise<{ user: UserProfile; isNewUser: boolean }> {
  const result = await confirmationResult.confirm(otpCode);
  const fbUser = result.user;

  // Check if profile exists in Firestore
  let existingProfile: UserProfile | null = null;
  try {
    const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
    if (userDoc.exists()) {
      existingProfile = userDoc.data() as UserProfile;
    }
  } catch (e) {
    console.warn('Firestore profile lookup error on phone sign in:', e);
  }

  if (existingProfile && existingProfile.isOnboarded) {
    saveRegisteredUser(existingProfile, true);
    return { user: existingProfile, isNewUser: false };
  }

  const derivedName = `Member_${rawPhone.slice(-4)}`;
  const derivedUsername = `user_${rawPhone.slice(-6).replace(/\D/g, '') || fbUser.uid.slice(0, 6)}`;
  const avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

  const newProfile: UserProfile = {
    id: fbUser.uid,
    displayId: generateDisplayId(),
    name: derivedName,
    username: derivedUsername,
    phone: rawPhone,
    avatar,
    avatarUrl: avatar,
    gender: 'female',
    age: 22,
    region: 'India',
    role: 'USER',
    is_super_admin: false,
    isVerifiedHost: false,
    faceVerified: false,
    level: 1,
    experience: 50,
    coins: 180,
    gems: 0,
    vouchers: 3,
    bio: 'Finding romantic moments on Amorex Live ✨',
    followingCount: 0,
    followersCount: 0,
    friendsCount: 0,
    deviceFingerprint: `dev_${fbUser.uid.slice(0, 8)}`,
    registeredAt: Date.now(),
    lastActiveAt: Date.now(),
    timeSpentSeconds: 0,
    isRealUser: true,
    registrationMethod: 'phone',
    isOnboarded: false
  };

  saveRegisteredUser(newProfile, true);
  return { user: newProfile, isNewUser: true };
}

/**
 * Sign out from Firebase and local state
 */
export async function signOutFirebaseUser(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.warn('Firebase signout error:', err);
  } finally {
    localStorage.removeItem('amorex_current_user');
  }
}
