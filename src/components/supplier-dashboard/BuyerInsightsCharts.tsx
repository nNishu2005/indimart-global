import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface BuyerInsightsProps {
  buyerSource: { myBuyers: number; platformBuyers: number };
  buyerType: { repeat: number; new: number };
}

const SOURCE_COLORS = ['hsl(220, 70%, 25%)', 'hsl(25, 95%, 53%)'];
const TYPE_COLORS = ['hsl(145, 60%, 40%)', 'hsl(220, 50%, 55%)'];

const BuyerInsightsCharts = ({ buyerSource, buyerType }: BuyerInsightsProps) => {
  const sourceData = [
    { name: 'My Buyers', value: buyerSource.myBuyers },
    { name: 'Platform', value: buyerSource.platformBuyers },
  ];

  const typeData = [
    { name: 'Repeat', value: buyerType.repeat },
    { name: 'New', value: buyerType.new },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Buyer Source</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sourceData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {sourceData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={SOURCE_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(0, 0%, 100%)', border: '1px solid hsl(220, 20%, 88%)', borderRadius: '8px', fontSize: '13px' }} />
                <Legend formatter={(value) => <span className="text-xs">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Repeat vs New Buyers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {typeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={TYPE_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(0, 0%, 100%)', border: '1px solid hsl(220, 20%, 88%)', borderRadius: '8px', fontSize: '13px' }} />
                <Legend formatter={(value) => <span className="text-xs">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BuyerInsightsCharts;
