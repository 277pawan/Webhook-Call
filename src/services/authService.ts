import { User } from '@/types';
import { API_ENDPOINTS, apiRequest } from '@/config/api';
import { getStorageItem, setStorageItem, removeStorageItem, STORAGE_KEYS } from '@/lib/storage';

interface LoginResponse {
  message: string;
  user: User;
  sessionId: string;
}

interface UserResponse {
  user: User;
}

// Get current user from local storage (for session persistence)
export function getCurrentUser(): User | null {
  return getStorageItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
}

// Get session ID from local storage
export function getSessionId(): string | null {
  return getStorageItem<string | null>('sessionId', null);
}

// Login via API
export async function loginUserApi(email: string): Promise<User | null> {
  const result = await apiRequest<LoginResponse>(API_ENDPOINTS.LOGIN, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

  if (result.success && result.data) {
    const { user, sessionId } = result.data;
    setStorageItem(STORAGE_KEYS.CURRENT_USER, user);
    setStorageItem('sessionId', sessionId);
    return user;
  }

  return null;
}

// Legacy sync login (fallback to localStorage if API fails)
export function loginUser(email: string): User {
  // Try API first, fall back to local
  loginUserApi(email).catch(console.error);
  
  const users = getStorageItem<User[]>(STORAGE_KEYS.USERS, []);
  let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    user = {
      id: generateId(),
      email: email.toLowerCase(),
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    setStorageItem(STORAGE_KEYS.USERS, users);
  }
  
  setStorageItem(STORAGE_KEYS.CURRENT_USER, user);
  return user;
}

// Logout via API
export async function logoutUserApi(): Promise<void> {
  const sessionId = getSessionId();
  
  if (sessionId) {
    await apiRequest(API_ENDPOINTS.LOGOUT, {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  }
  
  removeStorageItem(STORAGE_KEYS.CURRENT_USER);
  removeStorageItem('sessionId');
}

// Legacy sync logout
export function logoutUser(): void {
  logoutUserApi().catch(console.error);
  removeStorageItem(STORAGE_KEYS.CURRENT_USER);
  removeStorageItem('sessionId');
}

// Get all users (local only for now)
export function getAllUsers(): User[] {
  return getStorageItem<User[]>(STORAGE_KEYS.USERS, []);
}

// Helper function
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
