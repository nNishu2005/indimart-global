import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

interface DeliveryDisputeProps {
  data: { month: string; onTime: number; delayed: number; disputes: number }[];
}

const DeliveryDisputeChart = ({ data }: DeliveryDisputeProps) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-base font-semibold">On-Time Delivery & Disputes</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 92%)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220, 15%, 55%)" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 15%, 55%)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(220, 20%, 88%)',
                borderRadius: '8px',
                fontSize: '13px',
              }}
            />
            <Legend formatter={(value) => <span className="text-xs capitalize">{value}</span>} />
            <Bar dataKey="onTime" name="On Time" fill="hsl(145, 60%, 40%)" radius={[4, 4, 0, 0]} barSize={20} />
            <Bar dataKey="delayed" name="Delayed" fill="hsl(40, 90%, 50%)" radius={[4, 4, 0, 0]} barSize={20} />
            <Bar dataKey="disputes" name="Disputes" fill="hsl(0, 70%, 55%)" radius={[4, 4, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

export default DeliveryDisputeChart;
