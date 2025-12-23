import { CallAnalytics, ChartData } from '@/types';
import { API_ENDPOINTS, apiRequest } from '@/config/api';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '@/lib/storage';

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Default chart data for new users
const DEFAULT_CHART_DATA: Omit<ChartData, 'id' | 'userId' | 'updatedAt'>[] = [
  { name: 'Total Calls', value: 1247 },
  { name: 'Successful Calls', value: 1089 },
  { name: 'Failed Calls', value: 158 },
  { name: 'Avg Duration (sec)', value: 245 },
  { name: 'Customer Satisfaction', value: 87 },
];

// ============= API-based functions =============

// Fetch chart data from API
export async function fetchChartDataApi(userId: string): Promise<ChartData[]> {
  const result = await apiRequest<{ chartData: ChartData[] }>(
    `${API_ENDPOINTS.CHART_DATA}?userId=${userId}`
  );

  if (result.success && result.data) {
    return result.data.chartData || [];
  }

  // Fallback to local storage
  return getChartDataForUser(userId);
}

// Update chart data via API
export async function updateChartValueApi(
  userId: string,
  chartId: string,
  newValue: number
): Promise<ChartData | null> {
  const result = await apiRequest<{ chartData: ChartData }>(
    API_ENDPOINTS.CHART_DATA,
    {
      method: 'PUT',
      body: JSON.stringify({ userId, chartId, newValue }),
    }
  );

  if (result.success && result.data) {
    return result.data.chartData;
  }

  // Fallback to local storage
  return updateChartValue(userId, chartId, newValue);
}

// Fetch call analytics from API
export async function fetchCallAnalyticsApi(userId: string): Promise<CallAnalytics[]> {
  const result = await apiRequest<{ callAnalytics: CallAnalytics[] }>(
    `${API_ENDPOINTS.CALL_ANALYTICS}?userId=${userId}`
  );

  if (result.success && result.data) {
    return result.data.callAnalytics || [];
  }

  // Fallback to local storage
  return getCallAnalyticsForUser(userId);
}

// ============= Local storage functions (fallbacks) =============

export function getChartDataForUser(userId: string): ChartData[] {
  const allData = getStorageItem<ChartData[]>(STORAGE_KEYS.CHART_DATA, []);
  let userData = allData.filter(d => d.userId === userId);
  
  if (userData.length === 0) {
    const now = new Date().toISOString();
    userData = DEFAULT_CHART_DATA.map(d => ({
      ...d,
      id: generateId(),
      userId,
      updatedAt: now,
    }));
    
    const newAllData = [...allData, ...userData];
    setStorageItem(STORAGE_KEYS.CHART_DATA, newAllData);
  }
  
  return userData;
}

export function updateChartValue(
  userId: string,
  chartId: string,
  newValue: number
): ChartData | null {
  const allData = getStorageItem<ChartData[]>(STORAGE_KEYS.CHART_DATA, []);
  const index = allData.findIndex(d => d.id === chartId && d.userId === userId);
  
  if (index === -1) return null;
  
  const previousValue = allData[index].value;
  allData[index] = {
    ...allData[index],
    value: newValue,
    previousValue,
    updatedAt: new Date().toISOString(),
  };
  
  setStorageItem(STORAGE_KEYS.CHART_DATA, allData);
  return allData[index];
}

export function getCallAnalyticsForUser(userId: string): CallAnalytics[] {
  const allAnalytics = getStorageItem<CallAnalytics[]>(STORAGE_KEYS.CALL_ANALYTICS, []);
  let userAnalytics = allAnalytics.filter(a => a.userId === userId);
  
  if (userAnalytics.length === 0) {
    const now = new Date();
    userAnalytics = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      
      const totalCalls = Math.floor(Math.random() * 200) + 100;
      const successRate = 0.8 + Math.random() * 0.15;
      
      return {
        id: generateId(),
        userId,
        date: date.toISOString().split('T')[0],
        totalCalls,
        successfulCalls: Math.floor(totalCalls * successRate),
        failedCalls: Math.floor(totalCalls * (1 - successRate)),
        avgDuration: Math.floor(Math.random() * 180) + 120,
        satisfaction: Math.floor(Math.random() * 20) + 80,
      };
    });
    
    const newAllAnalytics = [...allAnalytics, ...userAnalytics];
    setStorageItem(STORAGE_KEYS.CALL_ANALYTICS, newAllAnalytics);
  }
  
  return userAnalytics;
}
