import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface OrdersFunnelProps {
  data: { stage: string; count: number }[];
}

const COLORS = [
  'hsl(220, 15%, 70%)',
  'hsl(220, 50%, 55%)',
  'hsl(25, 95%, 53%)',
  'hsl(220, 70%, 25%)',
  'hsl(145, 60%, 40%)',
];

const OrdersFunnelChart = ({ data }: OrdersFunnelProps) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-base font-semibold">Orders Funnel</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(220, 15%, 55%)" />
            <YAxis
              dataKey="stage"
              type="category"
              width={70}
              tick={{ fontSize: 12 }}
              stroke="hsl(220, 15%, 55%)"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(220, 20%, 88%)',
                borderRadius: '8px',
                fontSize: '13px',
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={28}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

export default OrdersFunnelChart;
