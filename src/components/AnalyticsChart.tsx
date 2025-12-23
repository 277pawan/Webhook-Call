import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CallAnalytics } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface AnalyticsChartProps {
  data: CallAnalytics[];
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    total: item.totalCalls,
    successful: item.successfulCalls,
    failed: item.failedCalls,
    satisfaction: item.satisfaction,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Call Volume</CardTitle>
          <CardDescription className="text-muted-foreground">
            Daily call statistics for the past week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(187 100% 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(187 100% 50%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142 70% 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142 70% 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 10% 15%)" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(240 5% 55%)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(240 5% 55%)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(240 10% 6%)',
                    border: '1px solid hsl(240 10% 15%)',
                    borderRadius: '8px',
                    color: 'hsl(0 0% 98%)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(187 100% 50%)"
                  strokeWidth={2}
                  fill="url(#colorTotal)"
                  name="Total Calls"
                />
                <Area
                  type="monotone"
                  dataKey="successful"
                  stroke="hsl(142 70% 45%)"
                  strokeWidth={2}
                  fill="url(#colorSuccess)"
                  name="Successful"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Customer Satisfaction</CardTitle>
          <CardDescription className="text-muted-foreground">
            Daily satisfaction score trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 10% 15%)" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(240 5% 55%)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(240 5% 55%)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(240 10% 6%)',
                    border: '1px solid hsl(240 10% 15%)',
                    borderRadius: '8px',
                    color: 'hsl(0 0% 98%)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="satisfaction"
                  stroke="hsl(270 60% 55%)"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(270 60% 55%)', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: 'hsl(270 60% 55%)' }}
                  name="Satisfaction %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
