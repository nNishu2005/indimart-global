import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RevenueStatsCards from '@/components/supplier-dashboard/RevenueStatsCards';
import RevenueTrendChart from '@/components/supplier-dashboard/RevenueTrendChart';
import OrdersFunnelChart from '@/components/supplier-dashboard/OrdersFunnelChart';
import PaymentBreakdownChart from '@/components/supplier-dashboard/PaymentBreakdownChart';
import BuyerInsightsCharts from '@/components/supplier-dashboard/BuyerInsightsCharts';
import DeliveryDisputeChart from '@/components/supplier-dashboard/DeliveryDisputeChart';
import QuickActions from '@/components/supplier-dashboard/QuickActions';
import { useSupplierDashboardData } from '@/hooks/useSupplierDashboardData';
import { Skeleton } from '@/components/ui/skeleton';

const SupplierDashboard = () => {
  const data = useSupplierDashboardData();

  if (data.loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Supplier Dashboard</h1>
          <p className="text-sm text-muted-foreground">Track revenue, orders, and business health</p>
        </div>

        {/* KPI Cards */}
        <RevenueStatsCards
          revenue={data.revenue}
          orders={data.orders}
          payments={data.payments}
          trustScore={data.trustScore}
        />

        {/* Quick Actions */}
        <QuickActions />

        {/* Row 1: Revenue Trend + Orders Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RevenueTrendChart data={data.revenueTrend} />
          <OrdersFunnelChart data={data.funnel} />
        </div>

        {/* Row 2: Payment Breakdown + Delivery/Dispute */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PaymentBreakdownChart payments={data.payments} />
          <DeliveryDisputeChart data={data.deliveryDispute} />
        </div>

        {/* Row 3: Buyer Insights */}
        <BuyerInsightsCharts
          buyerSource={data.buyerSource}
          buyerType={data.buyerType}
        />
      </main>
      <Footer />
    </div>
  );
};

export default SupplierDashboard;
