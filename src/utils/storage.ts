import { UserProfile, StreamHost, PartyRoom, MomentPost, ChatConversation, BackpackItem, DailyTask, UTRRequest, VirtualGift } from '../types';
import { db } from '../services/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

// Deterministic 8-digit Display ID generator based on user's Email ID
export function generateDeterministicDisplayId(email: string): string {
  if (!email) return '88204912';
  const cleanEmail = email.trim().toLowerCase();
  
  if (cleanEmail === 'adnexadmin@gmail.com' || cleanEmail.includes('admin')) {
    return '1000001';
  }

  let hash = 0;
  for (let i = 0; i < cleanEmail.length; i++) {
    hash = (hash * 31 + cleanEmail.charCodeAt(i)) >>> 0;
  }
  const resultNum = 10000000 + (hash % 89999999);
  return resultNum.toString();
}

export const initialUser: UserProfile = {
  id: 'usr-default-01',
  displayId: generateDeterministicDisplayId('alex.rivers@amorex.live'),
  name: 'Alex Rivers',
  email: 'alex.rivers@amorex.live',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
  role: 'USER',
  is_super_admin: false,
  isRealUser: true,
  level: 3,
  coins: 1250,
  gems: 180,
  vouchers: 2,
  experience: 450,
  exp: 450,
  gender: 'male',
  age: 24,
  region: 'India',
  bio: 'Exploring romantic video connections on Amorex Live ✨',
  isVerifiedHost: false,
  faceVerified: true,
  isOnboarded: true,
  timeSpentSeconds: 120,
  followingCount: 12,
  followersCount: 45,
  visitorsCount: 130,
  likesCount: 89
};

// Permanent Fixed Super Admin Profile (ID: 1000001)
export const createSuperAdminProfile = (
  email: string = 'adnexadmin@gmail.com',
  name: string = 'Adnex Super Admin'
): UserProfile => ({
  id: 'admin_1000001',
  displayId: '1000001',
  name,
  email: email.trim().toLowerCase(),
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
  role: 'SUPER_ADMIN',
  is_super_admin: true,
  isRealUser: true,
  level: 99,
  coins: 99999999,
  gems: 999999,
  vouchers: 999,
  experience: 999999,
  exp: 999999,
  gender: 'female',
  age: 25,
  region: 'Global HQ',
  bio: 'Official Amorex Super Admin & 24/7 Live Support Center',
  isVerifiedHost: true,
  faceVerified: true,
  isOnboarded: true,
  timeSpentSeconds: 0,
  followingCount: 0,
  followersCount: 50000,
  visitorsCount: 100000,
  likesCount: 500000
});

// Save registered user directly to Firebase Firestore with strict Display ID Locking
export async function saveRegisteredUser(user: UserProfile, isNewRegistration: boolean = false) {
  if (!user || user.is_super_admin) return;

  try {
    // Ensure display ID is locked deterministically based on email
    const lockedDisplayId = user.email ? generateDeterministicDisplayId(user.email) : (user.displayId || '88204912');
    const userWithLockedId: UserProfile = {
      ...user,
      displayId: lockedDisplayId
    };

    // Local memory backup
    const rawList = localStorage.getItem('amorex_registered_users');
    let list: UserProfile[] = rawList ? JSON.parse(rawList) : [];
    const idx = list.findIndex((u) => u.id === userWithLockedId.id || u.email === userWithLockedId.email);
    
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...userWithLockedId, displayId: lockedDisplayId };
    } else {
      list.push(userWithLockedId);
    }
    localStorage.setItem('amorex_registered_users', JSON.stringify(list));

    // Direct Cloud Write to Firestore Database
    if (db) {
      const userRef = doc(db, 'users', userWithLockedId.id);
      await setDoc(userRef, {
        ...userWithLockedId,
        displayId: lockedDisplayId,
        updatedAt: Date.now(),
        isOnline: true
      }, { merge: true });
    }
  } catch (e) {
    console.warn('[Utility Cloud Storage Error]:', e);
  }
}

// Synchronize Coin Changes across Local Storage and Cloud Database
export async function updateUserCoinsInRegistry(userId: string, newCoins: number, newGems?: number) {
  try {
    const rawList = localStorage.getItem('amorex_registered_users');
    let list: UserProfile[] = rawList ? JSON.parse(rawList) : [];
    
    list = list.map((u) => {
      if (u.id === userId || u.displayId === userId) {
        return {
          ...u,
          coins: newCoins,
          gems: newGems !== undefined ? newGems : u.gems
        };
      }
      return u;
    });
    localStorage.setItem('amorex_registered_users', JSON.stringify(list));

    // Update in Cloud Database
    if (db) {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        coins: newCoins,
        ...(newGems !== undefined && { gems: newGems }),
        updatedAt: Date.now()
      });
    }
  } catch (e) {
    console.warn('[Utility Coin Sync Error]:', e);
  }
}

export function getStoredRegisteredUsers(): UserProfile[] {
  const rawList = localStorage.getItem('amorex_registered_users');
  return rawList ? JSON.parse(rawList) : [initialUser];
}

export function updateUserTimeSpent(userId: string, additionalSecs: number) {
  const rawList = localStorage.getItem('amorex_registered_users');
  let list: UserProfile[] = rawList ? JSON.parse(rawList) : [];
  list = list.map((u) => {
    if (u.id === userId) {
      return {
        ...u,
        timeSpentSeconds: (u.timeSpentSeconds || 0) + additionalSecs,
        lastActiveAt: Date.now()
      };
    }
    return u;
  });
  localStorage.setItem('amorex_registered_users', JSON.stringify(list));
}

export const initialHosts: StreamHost[] = [];
export const initialPartyRooms: PartyRoom[] = [];
export const initialMoments: MomentPost[] = [];
export const initialConversations: ChatConversation[] = [];
export const initialBackpack: BackpackItem[] = [];
export const initialTasks: DailyTask[] = [];
export const initialUTRRequests: UTRRequest[] = [];
export const virtualGifts: VirtualGift[] = [];
