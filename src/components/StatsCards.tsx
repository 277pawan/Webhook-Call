import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartData } from '@/types';
import { TrendingUp, TrendingDown, Phone, CheckCircle, XCircle, Clock, Star } from 'lucide-react';

interface StatsCardsProps {
  data: ChartData[];
}

const iconMap: Record<string, React.ReactNode> = {
  'Total Calls': <Phone className="w-5 h-5" />,
  'Successful Calls': <CheckCircle className="w-5 h-5" />,
  'Failed Calls': <XCircle className="w-5 h-5" />,
  'Avg Duration (sec)': <Clock className="w-5 h-5" />,
  'Customer Satisfaction': <Star className="w-5 h-5" />,
};

const colorMap: Record<string, string> = {
  'Total Calls': 'text-primary',
  'Successful Calls': 'text-success',
  'Failed Calls': 'text-destructive',
  'Avg Duration (sec)': 'text-warning',
  'Customer Satisfaction': 'text-accent',
};

export function StatsCards({ data }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {data.map((item) => {
        const hasChange = item.previousValue !== undefined;
        const change = hasChange ? item.value - item.previousValue! : 0;
        const changePercent = hasChange && item.previousValue! > 0
          ? ((change / item.previousValue!) * 100).toFixed(1)
          : '0';
        const isPositive = change >= 0;
        const isNegativeGood = item.name === 'Failed Calls';
        const showPositiveStyle = isNegativeGood ? !isPositive : isPositive;

        return (
          <Card key={item.id} className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <span className={colorMap[item.name] || 'text-primary'}>
                  {iconMap[item.name] || <Phone className="w-5 h-5" />}
                </span>
                {item.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {item.name.includes('Satisfaction') ? `${item.value}%` : item.value.toLocaleString()}
              </div>
              {hasChange && (
                <div className={`flex items-center gap-1 text-xs mt-1 ${showPositiveStyle ? 'text-success' : 'text-destructive'}`}>
                  {showPositiveStyle ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{isPositive ? '+' : ''}{changePercent}% from previous</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
