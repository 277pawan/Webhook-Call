// Local storage utility for data persistence

const STORAGE_KEYS = {
  USERS: 'app_users',
  TRANSACTIONS: 'app_transactions',
  CHART_DATA: 'app_chart_data',
  CALL_ANALYTICS: 'app_call_analytics',
  PROCESSED_KEYS: 'app_processed_idempotency_keys',
  CURRENT_USER: 'app_current_user',
} as const;

export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
}

export { STORAGE_KEYS };
