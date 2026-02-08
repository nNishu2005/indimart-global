import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, ShoppingCart, Clock, Shield } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

interface RevenueStatsProps {
  revenue: { daily: number; weekly: number; monthly: number };
  orders: { completed: number; pending: number };
  payments: { received: number; pending: number; overdue: number };
  trustScore: number;
}

const formatCurrency = (amount: number) => {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
};

const RevenueStatsCards = ({ revenue, orders, payments, trustScore }: RevenueStatsProps) => {
  const [revenuePeriod, setRevenuePeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const revenueValue = revenue[revenuePeriod];
  const totalOrders = orders.completed + orders.pending;
  const totalPayments = payments.received + payments.pending + payments.overdue;

  const getTrustColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getTrustBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Revenue Card */}
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-primary" />
          </div>
          <Tabs value={revenuePeriod} onValueChange={(v) => setRevenuePeriod(v as any)} className="mt-1">
            <TabsList className="h-7 p-0.5">
              <TabsTrigger value="daily" className="text-xs px-2 h-6">Day</TabsTrigger>
              <TabsTrigger value="weekly" className="text-xs px-2 h-6">Week</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs px-2 h-6">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">{formatCurrency(revenueValue)}</div>
        </CardContent>
      </Card>

      {/* Orders Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalOrders}</div>
          <div className="flex gap-3 mt-1 text-xs">
            <span className="text-emerald-600 font-medium">{orders.completed} completed</span>
            <span className="text-amber-600 font-medium">{orders.pending} pending</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Status Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Payment Status</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatCurrency(totalPayments)}</div>
          <div className="flex gap-2 mt-1 text-xs flex-wrap">
            <span className="text-emerald-600 font-medium">✓ {formatCurrency(payments.received)}</span>
            <span className="text-amber-600 font-medium">⏳ {formatCurrency(payments.pending)}</span>
            {payments.overdue > 0 && (
              <span className="text-red-600 font-medium">⚠ {formatCurrency(payments.overdue)}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trust Score Card */}
      <Card className={getTrustBg(trustScore)}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Trust Score</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${getTrustColor(trustScore)}`}>{trustScore}/100</div>
          <p className="text-xs text-muted-foreground mt-1">
            {trustScore >= 80 ? 'Excellent standing' : trustScore >= 60 ? 'Good, room to improve' : 'Needs attention'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueStatsCards;
