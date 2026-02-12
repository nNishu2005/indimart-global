import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Demo trend data – will populate with real data once orders exist
const EMPTY_REVENUE_TREND = [
  { month: 'Sep', revenue: 0 },
  { month: 'Oct', revenue: 0 },
  { month: 'Nov', revenue: 0 },
  { month: 'Dec', revenue: 0 },
  { month: 'Jan', revenue: 0 },
  { month: 'Feb', revenue: 0 },
];

const EMPTY_FUNNEL = [
  { stage: 'Views', count: 0 },
  { stage: 'Inquiries', count: 0 },
  { stage: 'Quotes', count: 0 },
  { stage: 'Orders', count: 0 },
  { stage: 'Paid', count: 0 },
];

const EMPTY_DELIVERY = [
  { month: 'Oct', onTime: 0, delayed: 0, disputes: 0 },
  { month: 'Nov', onTime: 0, delayed: 0, disputes: 0 },
  { month: 'Dec', onTime: 0, delayed: 0, disputes: 0 },
  { month: 'Jan', onTime: 0, delayed: 0, disputes: 0 },
  { month: 'Feb', onTime: 0, delayed: 0, disputes: 0 },
];

export interface DashboardData {
  revenue: { daily: number; weekly: number; monthly: number };
  orders: { completed: number; pending: number };
  payments: { received: number; pending: number; overdue: number };
  trustScore: number;
  revenueTrend: { month: string; revenue: number }[];
  funnel: { stage: string; count: number }[];
  buyerSource: { myBuyers: number; platformBuyers: number };
  buyerType: { repeat: number; new: number };
  deliveryDispute: { month: string; onTime: number; delayed: number; disputes: number }[];
  loading: boolean;
}

export function useSupplierDashboardData(): DashboardData {
  const [data, setData] = useState<DashboardData>({
    revenue: { daily: 0, weekly: 0, monthly: 0 },
    orders: { completed: 0, pending: 0 },
    payments: { received: 0, pending: 0, overdue: 0 },
    trustScore: 0,
    revenueTrend: [],
    funnel: [],
    buyerSource: { myBuyers: 0, platformBuyers: 0 },
    buyerType: { repeat: 0, new: 0 },
    deliveryDispute: [],
    loading: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setData((prev) => ({ ...prev, loading: false }));
        return;
      }

      const userId = session.user.id;

      // Fetch real counts from DB
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [productsRes, inquiriesRes, rfqRes, reviewsRes, ordersRes, paymentsRes] = await Promise.all([
        supabase.from('products').select('id, views', { count: 'exact' }).eq('supplier_id', userId),
        supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('supplier_id', userId),
        supabase.from('rfq_responses').select('*', { count: 'exact', head: true }).eq('supplier_id', userId),
        supabase.from('reviews').select('rating').eq('supplier_id', userId),
        supabase.from('orders').select('*').eq('supplier_id', userId),
        supabase.from('payments').select('*').eq('supplier_id', userId),
      ]);

      const totalViews = productsRes.data?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;
      const productCount = productsRes.data?.length || 0;
      const inquiryCount = inquiriesRes.count || 0;
      const rfqCount = rfqRes.count || 0;

      // Orders metrics
      const orders = ordersRes.data || [];
      const completedOrders = orders.filter(o => o.status === 'completed').length;
      const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;

      // Revenue from completed orders
      const dailyRevenue = orders
        .filter(o => o.status === 'completed' && o.created_at >= todayStart)
        .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
      const weeklyRevenue = orders
        .filter(o => o.status === 'completed' && o.created_at >= weekStart)
        .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
      const monthlyRevenue = orders
        .filter(o => o.status === 'completed' && o.created_at >= monthStart)
        .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

      // Payments metrics
      const payments = paymentsRes.data || [];
      const receivedPayments = payments
        .filter(p => p.status === 'received' || p.status === 'paid')
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const pendingPayments = payments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const overduePayments = payments
        .filter(p => p.status === 'overdue')
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      // Delivery & disputes from orders
      const deliveredOnTime = orders.filter(o => o.delivery_status === 'delivered' && (!o.expected_delivery_date || o.actual_delivery_date! <= o.expected_delivery_date)).length;
      const delayed = orders.filter(o => o.delivery_status === 'delayed' || (o.delivery_status === 'delivered' && o.expected_delivery_date && o.actual_delivery_date! > o.expected_delivery_date)).length;

      // Buyer insights
      const uniqueBuyers = [...new Set(orders.map(o => o.buyer_id))];
      const buyerOrderCounts = uniqueBuyers.map(bid => orders.filter(o => o.buyer_id === bid).length);
      const repeatBuyers = buyerOrderCounts.filter(c => c > 1).length;
      const newBuyers = buyerOrderCounts.filter(c => c === 1).length;

      // Compute trust score – generous baseline for new suppliers
      const avgRating = reviewsRes.data?.length
        ? reviewsRes.data.reduce((sum, r) => sum + r.rating, 0) / reviewsRes.data.length
        : 0;
      const hasProducts = productCount > 0;
      const hasReviews = (reviewsRes.data?.length || 0) > 0;
      const trustScore = Math.min(100, Math.round(
        20 + // baseline for being registered
        (hasProducts ? 15 : 0) + // has at least one product
        Math.min(productCount, 10) * 2 + // up to 20 for products
        (hasReviews ? (avgRating / 5) * 25 : 0) + // up to 25 for ratings
        Math.min(rfqCount, 5) * 2 + // up to 10 for RFQ responses
        Math.min(completedOrders, 5) * 2 // up to 10 for completed orders
      ));

      // Build funnel from real data
      const funnel = [
        { stage: 'Views', count: totalViews },
        { stage: 'Inquiries', count: inquiryCount },
        { stage: 'Quotes', count: rfqCount },
        { stage: 'Orders', count: orders.length },
        { stage: 'Paid', count: payments.filter(p => p.status === 'received' || p.status === 'paid').length },
      ];
      const hasFunnelData = totalViews > 0 || inquiryCount > 0 || orders.length > 0;

      setData({
        revenue: { daily: dailyRevenue, weekly: weeklyRevenue, monthly: monthlyRevenue },
        orders: { completed: completedOrders, pending: pendingOrders },
        payments: { received: receivedPayments, pending: pendingPayments, overdue: overduePayments },
        trustScore,
        revenueTrend: EMPTY_REVENUE_TREND, // TODO: aggregate monthly once enough data
        funnel: hasFunnelData ? funnel : EMPTY_FUNNEL,
        buyerSource: { myBuyers: 0, platformBuyers: uniqueBuyers.length },
        buyerType: { repeat: repeatBuyers, new: newBuyers },
        deliveryDispute: EMPTY_DELIVERY, // TODO: aggregate monthly once enough data
        loading: false,
      });
    };

    fetchData();
  }, []);

  return data;
}
