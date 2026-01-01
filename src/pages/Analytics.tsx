import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BarChart3, Eye, Package, Users } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Analytics = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalViews: 0,
    totalInquiries: 0,
    activeRFQs: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get products count and views
    const { data: products } = await supabase
      .from('products')
      .select('views')
      .eq('supplier_id', user.id);

    const totalProducts = products?.length || 0;
    const totalViews = products?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;

    // Get inquiries count
    const { count: inquiriesCount } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('supplier_id', user.id);

    // Get active RFQs
    const { count: rfqsCount } = await supabase
      .from('rfqs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open');

    setStats({
      totalProducts,
      totalViews,
      totalInquiries: inquiriesCount || 0,
      activeRFQs: rfqsCount || 0,
    });
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      description: 'Products listed',
    },
    {
      title: 'Total Views',
      value: stats.totalViews,
      icon: Eye,
      description: 'Product impressions',
    },
    {
      title: 'Inquiries',
      value: stats.totalInquiries,
      icon: Users,
      description: 'Buyer inquiries',
    },
    {
      title: 'Active RFQs',
      value: stats.activeRFQs,
      icon: BarChart3,
      description: 'Open RFQ opportunities',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Track your business performance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Your business metrics at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Charts and detailed analytics coming soon
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Analytics;
