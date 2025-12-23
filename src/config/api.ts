// API Configuration
// Set VITE_API_URL in your .env file (e.g., VITE_API_URL=http://localhost:3001)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  CURRENT_USER: '/api/auth/me',
  
  // Transactions
  TRANSACTIONS: '/api/transactions',
  WEBHOOK: '/v1/webhooks/transactions',
  
  // Analytics
  CHART_DATA: '/api/analytics/chart',
  CALL_ANALYTICS: '/api/analytics/calls',
  
  // Health
  HEALTH: '/health',
};

// Generic API request helper
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}
