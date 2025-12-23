export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: string;
  userId: string;
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface CallAnalytics {
  id: string;
  userId: string;
  date: string;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  avgDuration: number;
  satisfaction: number;
}

export interface ChartData {
  id: string;
  userId: string;
  name: string;
  value: number;
  previousValue?: number;
  updatedAt: string;
}

export interface WebhookPayload {
  event: string;
  data: Transaction;
  idempotencyKey: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
