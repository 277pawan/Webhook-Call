import { Transaction, WebhookPayload, ApiResponse } from '@/types';
import { API_ENDPOINTS, apiRequest, API_BASE_URL } from '@/config/api';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '@/lib/storage';

function generateId(): string {
  return 'txn_' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ============= API-based functions =============

// Fetch transactions from API
export async function fetchTransactionsApi(userId?: string): Promise<Transaction[]> {
  const queryParams = userId ? `?userId=${userId}` : '';
  const result = await apiRequest<{ transactions: Transaction[] }>(
    `${API_ENDPOINTS.TRANSACTIONS}${queryParams}`
  );

  if (result.success && result.data) {
    return result.data.transactions || [];
  }

  // Fallback to local storage
  return getTransactionsByUserId(userId || '');
}

// Fetch single transaction from API
export async function fetchTransactionByIdApi(id: string): Promise<Transaction | undefined> {
  const result = await apiRequest<{ transaction: Transaction }>(
    `${API_ENDPOINTS.TRANSACTIONS}/${id}`
  );

  if (result.success && result.data) {
    return result.data.transaction;
  }

  // Fallback to local storage
  return getTransactionById(id);
}

// Create transaction via webhook API
export async function createTransactionApi(userId: string): Promise<ApiResponse<Transaction>> {
  const idempotencyKey = `idem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const payload = {
    amount: Math.floor(Math.random() * 10000) + 100,
    currency: 'USD',
    idempotencyKey,
    metadata: {
      userId,
      type: ['deposit', 'withdrawal', 'transfer'][Math.floor(Math.random() * 3)],
    },
  };

  const result = await apiRequest<{ transaction: Transaction; message: string }>(
    API_ENDPOINTS.WEBHOOK,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  if (result.success && result.data) {
    return {
      success: true,
      data: result.data.transaction,
      message: result.data.message,
    };
  }

  // Fallback to local creation
  return createTestTransaction(userId);
}

// ============= Local storage functions (fallbacks) =============

const PROCESSING_DELAY = 30000;

function getProcessedKeys(): Set<string> {
  const keys = getStorageItem<string[]>(STORAGE_KEYS.PROCESSED_KEYS, []);
  return new Set(keys);
}

function addProcessedKey(key: string): void {
  const keys = getStorageItem<string[]>(STORAGE_KEYS.PROCESSED_KEYS, []);
  if (!keys.includes(key)) {
    keys.push(key);
    setStorageItem(STORAGE_KEYS.PROCESSED_KEYS, keys);
  }
}

export function getAllTransactions(): Transaction[] {
  return getStorageItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
}

export function getTransactionById(id: string): Transaction | undefined {
  const transactions = getAllTransactions();
  return transactions.find(t => t.id === id);
}

export function getTransactionsByUserId(userId: string): Transaction[] {
  const transactions = getAllTransactions();
  return transactions.filter(t => t.userId === userId);
}

export async function handleWebhook(payload: WebhookPayload): Promise<ApiResponse<Transaction>> {
  const { idempotencyKey, data } = payload;
  
  const processedKeys = getProcessedKeys();
  if (processedKeys.has(idempotencyKey)) {
    const existingTransaction = getAllTransactions().find(
      t => t.idempotencyKey === idempotencyKey
    );
    return {
      success: true,
      data: existingTransaction,
      message: 'Duplicate request - returning existing transaction',
    };
  }
  
  const transaction: Transaction = {
    ...data,
    id: generateId(),
    status: 'pending',
    timestamp: new Date().toISOString(),
    idempotencyKey,
  };
  
  const transactions = getAllTransactions();
  transactions.push(transaction);
  setStorageItem(STORAGE_KEYS.TRANSACTIONS, transactions);
  addProcessedKey(idempotencyKey);
  processTransactionInBackground(transaction.id);
  
  return {
    success: true,
    data: transaction,
    message: 'Transaction created and processing started',
  };
}

async function processTransactionInBackground(transactionId: string): Promise<void> {
  updateTransactionStatus(transactionId, 'processing');
  await new Promise(resolve => setTimeout(resolve, PROCESSING_DELAY));
  const success = Math.random() > 0.1;
  updateTransactionStatus(transactionId, success ? 'completed' : 'failed');
}

function updateTransactionStatus(id: string, status: Transaction['status']): void {
  const transactions = getAllTransactions();
  const index = transactions.findIndex(t => t.id === id);
  
  if (index !== -1) {
    transactions[index].status = status;
    setStorageItem(STORAGE_KEYS.TRANSACTIONS, transactions);
  }
}

export function createTestTransaction(userId: string): ApiResponse<Transaction> {
  const idempotencyKey = `idem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const payload: WebhookPayload = {
    event: 'transaction.created',
    idempotencyKey,
    timestamp: new Date().toISOString(),
    data: {
      id: '',
      type: ['deposit', 'withdrawal', 'transfer'][Math.floor(Math.random() * 3)] as Transaction['type'],
      amount: Math.floor(Math.random() * 10000) + 100,
      currency: 'USD',
      status: 'pending',
      timestamp: new Date().toISOString(),
      userId,
    },
  };
  
  return handleWebhookSync(payload);
}

function handleWebhookSync(payload: WebhookPayload): ApiResponse<Transaction> {
  const { idempotencyKey, data } = payload;
  
  const processedKeys = getProcessedKeys();
  if (processedKeys.has(idempotencyKey)) {
    const existingTransaction = getAllTransactions().find(
      t => t.idempotencyKey === idempotencyKey
    );
    return {
      success: true,
      data: existingTransaction,
      message: 'Duplicate request',
    };
  }
  
  const transaction: Transaction = {
    ...data,
    id: generateId(),
    status: 'pending',
    timestamp: new Date().toISOString(),
    idempotencyKey,
  };
  
  const transactions = getAllTransactions();
  transactions.push(transaction);
  setStorageItem(STORAGE_KEYS.TRANSACTIONS, transactions);
  addProcessedKey(idempotencyKey);
  processTransactionInBackground(transaction.id);
  
  return {
    success: true,
    data: transaction,
  };
}
