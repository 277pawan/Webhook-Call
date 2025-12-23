import { Header } from '@/components/Header';
import { StatsCards } from '@/components/StatsCards';
import { EditableChart } from '@/components/EditableChart';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import { TransactionList } from '@/components/TransactionList';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useTransactions } from '@/hooks/useTransactions';
import { useToast } from '@/hooks/use-toast';

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const { user } = useAuth();
  const { chartData, callAnalytics, updateValue } = useAnalytics(user?.id);
  const { transactions, createTransaction, refreshTransactions, isLoading: txLoading } = useTransactions(user?.id);
  const { toast } = useToast();

  if (!user) return null;

  const handleCreateTransaction = async () => {
    const result = await createTransaction();
    if (result?.success) {
      toast({
        title: 'Transaction created',
        description: 'Processing will complete in ~30 seconds',
      });
    }
  };

  const handleUpdateValue = (chartId: string, newValue: number) => {
    updateValue(chartId, newValue);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10">
        <Header user={user} onLogout={onLogout} />
        
        <main className="container mx-auto px-4 py-8 space-y-8">
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Welcome back
            </h2>
            <p className="text-muted-foreground">
              Here's an overview of your voice agent analytics
            </p>
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <StatsCards data={chartData} />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <AnalyticsChart data={callAnalytics} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <EditableChart data={chartData} onUpdateValue={handleUpdateValue} />
            <TransactionList
              transactions={transactions}
              onCreateTransaction={handleCreateTransaction}
              onRefresh={refreshTransactions}
              isLoading={txLoading}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
