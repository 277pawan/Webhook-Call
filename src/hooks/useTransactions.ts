import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '@/types';
import {
  fetchTransactionsApi,
  fetchTransactionByIdApi,
  createTransactionApi,
  getTransactionsByUserId,
  getTransactionById,
  createTestTransaction,
} from '@/services/transactionService';

export function useTransactions(userId: string | undefined) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    if (!userId) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Try API first
      const data = await fetchTransactionsApi(userId);
      setTransactions(data.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
    } catch (error) {
      console.warn('API fetch failed, using local fallback:', error);
      const data = getTransactionsByUserId(userId);
      setTransactions(data.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
    }
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchTransactions();
    
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchTransactions, 5000);
    return () => clearInterval(interval);
  }, [fetchTransactions]);

  const createTransaction = useCallback(async () => {
    if (!userId) return null;
    
    try {
      // Try API first
      const result = await createTransactionApi(userId);
      if (result.success && result.data) {
        fetchTransactions();
      }
      return result;
    } catch (error) {
      console.warn('API create failed, using local fallback:', error);
      const result = createTestTransaction(userId);
      if (result.success && result.data) {
        fetchTransactions();
      }
      return result;
    }
  }, [userId, fetchTransactions]);

  const getTransaction = useCallback(async (id: string) => {
    try {
      return await fetchTransactionByIdApi(id);
    } catch {
      return getTransactionById(id);
    }
  }, []);

  return {
    transactions,
    isLoading,
    createTransaction,
    getTransaction,
    refreshTransactions: fetchTransactions,
  };
}
