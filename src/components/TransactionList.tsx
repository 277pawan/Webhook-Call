import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/types';
import { Plus, RefreshCw, ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onCreateTransaction: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const statusColors: Record<Transaction['status'], string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  processing: 'bg-primary/10 text-primary border-primary/20',
  completed: 'bg-success/10 text-success border-success/20',
  failed: 'bg-destructive/10 text-destructive border-destructive/20',
};

const typeIcons: Record<Transaction['type'], React.ReactNode> = {
  deposit: <ArrowDownLeft className="w-4 h-4 text-success" />,
  withdrawal: <ArrowUpRight className="w-4 h-4 text-destructive" />,
  transfer: <ArrowLeftRight className="w-4 h-4 text-primary" />,
};

export function TransactionList({ transactions, onCreateTransaction, onRefresh, isLoading }: TransactionListProps) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold text-foreground">Recent Transactions</CardTitle>
          <CardDescription className="text-muted-foreground">
            Webhook-triggered transactions with 30s processing delay
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick={onCreateTransaction}
            size="sm"
            className="gradient-primary text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-1" />
            Test Webhook
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No transactions yet.</p>
            <p className="text-sm mt-1">Click "Test Webhook" to simulate a transaction.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                    {typeIcons[tx.type]}
                  </div>
                  <div>
                    <p className="font-medium text-foreground capitalize">{tx.type}</p>
                    <p className="text-xs text-muted-foreground font-mono">{tx.id}</p>
                  </div>
                </div>
                
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="font-semibold text-foreground">
                      ${tx.amount.toLocaleString()} {tx.currency}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge className={`${statusColors[tx.status]} border`}>
                    {tx.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
