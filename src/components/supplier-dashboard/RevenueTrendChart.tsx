import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueTrendProps {
  data: { month: string; revenue: number }[];
}

const formatCurrency = (value: number) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
};

const RevenueTrendChart = ({ data }: RevenueTrendProps) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-base font-semibold">Revenue Trend</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(220, 70%, 25%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(220, 70%, 25%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 92%)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220, 15%, 55%)" />
            <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12 }} stroke="hsl(220, 15%, 55%)" />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Revenue']}
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(220, 20%, 88%)',
                borderRadius: '8px',
                fontSize: '13px',
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(220, 70%, 25%)"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

export default RevenueTrendChart;
