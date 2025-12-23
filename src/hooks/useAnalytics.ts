import { useState, useEffect, useCallback } from 'react';
import { ChartData, CallAnalytics } from '@/types';
import {
  fetchChartDataApi,
  fetchCallAnalyticsApi,
  updateChartValueApi,
  getChartDataForUser,
  updateChartValue,
  getCallAnalyticsForUser,
} from '@/services/analyticsService';

export function useAnalytics(userId: string | undefined) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [callAnalytics, setCallAnalytics] = useState<CallAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setChartData([]);
      setCallAnalytics([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Try API first
      const [chartResult, analyticsResult] = await Promise.all([
        fetchChartDataApi(userId),
        fetchCallAnalyticsApi(userId),
      ]);
      setChartData(chartResult);
      setCallAnalytics(analyticsResult);
    } catch (error) {
      console.warn('API fetch failed, using local fallback:', error);
      const data = getChartDataForUser(userId);
      const analytics = getCallAnalyticsForUser(userId);
      setChartData(data);
      setCallAnalytics(analytics);
    }
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateValue = useCallback(
    async (chartId: string, newValue: number) => {
      if (!userId) return null;
      
      try {
        // Try API first
        const updated = await updateChartValueApi(userId, chartId, newValue);
        if (updated) {
          setChartData(prev => prev.map(d => (d.id === chartId ? updated : d)));
        }
        return updated;
      } catch (error) {
        console.warn('API update failed, using local fallback:', error);
        const updated = updateChartValue(userId, chartId, newValue);
        if (updated) {
          setChartData(prev => prev.map(d => (d.id === chartId ? updated : d)));
        }
        return updated;
      }
    },
    [userId]
  );

  return {
    chartData,
    callAnalytics,
    isLoading,
    updateValue,
    refreshData: fetchData,
  };
}
