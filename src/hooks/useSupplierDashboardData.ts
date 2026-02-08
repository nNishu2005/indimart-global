import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Demo/fallback data – will be replaced with real queries as tables grow
const DEMO_REVENUE_TREND = [
  { month: 'Sep', revenue: 32000 },
  { month: 'Oct', revenue: 48000 },
  { month: 'Nov', revenue: 41000 },
  { month: 'Dec', revenue: 67000 },
  { month: 'Jan', revenue: 58000 },
  { month: 'Feb', revenue: 72000 },
];

const DEMO_FUNNEL = [
  { stage: 'Views', count: 1240 },
  { stage: 'Inquiries', count: 86 },
  { stage: 'Quotes', count: 34 },
  { stage: 'Orders', count: 18 },
  { stage: 'Paid', count: 14 },
];

const DEMO_DELIVERY = [
  { month: 'Oct', onTime: 8, delayed: 2, disputes: 0 },
  { month: 'Nov', onTime: 10, delayed: 1, disputes: 1 },
  { month: 'Dec', onTime: 12, delayed: 3, disputes: 0 },
  { month: 'Jan', onTime: 9, delayed: 2, disputes: 1 },
  { month: 'Feb', onTime: 11, delayed: 1, disputes: 0 },
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

      // Fetch real counts from DB where available
      const [productsRes, inquiriesRes, rfqRes, reviewsRes] = await Promise.all([
        supabase.from('products').select('id, views', { count: 'exact' }).eq('supplier_id', userId),
        supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('supplier_id', userId),
        supabase.from('rfq_responses').select('*', { count: 'exact', head: true }).eq('supplier_id', userId),
        supabase.from('reviews').select('rating').eq('supplier_id', userId),
      ]);

      const totalViews = productsRes.data?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;
      const productCount = productsRes.count || 0;
      const inquiryCount = inquiriesRes.count || 0;
      const rfqCount = rfqRes.count || 0;

      // Compute trust score from available data
      const avgRating = reviewsRes.data?.length
        ? reviewsRes.data.reduce((sum, r) => sum + r.rating, 0) / reviewsRes.data.length
        : 4;
      const trustScore = Math.min(100, Math.round(
        (avgRating / 5) * 40 + // 40% from reviews
        Math.min(productCount, 10) * 3 + // 30% from catalog completeness
        Math.min(rfqCount, 10) * 3 // 30% from responsiveness
      ));

      // Build funnel from real data
      const funnel = [
        { stage: 'Views', count: totalViews },
        { stage: 'Inquiries', count: inquiryCount },
        { stage: 'Quotes', count: rfqCount },
        { stage: 'Orders', count: Math.round(rfqCount * 0.5) }, // estimated
        { stage: 'Paid', count: Math.round(rfqCount * 0.35) }, // estimated
      ];

      // Use funnel data or fall back to demo if no real data
      const hasFunnelData = totalViews > 0 || inquiryCount > 0;

      setData({
        revenue: { daily: 4800, weekly: 28500, monthly: 72000 },
        orders: { completed: 14, pending: 4 },
        payments: { received: 58000, pending: 10000, overdue: 4000 },
        trustScore,
        revenueTrend: DEMO_REVENUE_TREND,
        funnel: hasFunnelData ? funnel : DEMO_FUNNEL,
        buyerSource: { myBuyers: 8, platformBuyers: 12 },
        buyerType: { repeat: 6, new: 14 },
        deliveryDispute: DEMO_DELIVERY,
        loading: false,
      });
    };

    fetchData();
  }, []);

  return data;
}
