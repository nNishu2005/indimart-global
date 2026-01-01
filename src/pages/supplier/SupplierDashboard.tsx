import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, MessageSquare, FileText, TrendingUp, Eye, Plus } from 'lucide-react';

const SupplierDashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    inquiries: 0,
    rfqResponses: 0,
    totalViews: 0,
  });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user);

      if (session?.user) {
        const [products, inquiries, rfqResponses] = await Promise.all([
          supabase.from('products').select('*, views', { count: 'exact' }).eq('supplier_id', session.user.id),
          supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('supplier_id', session.user.id),
          supabase.from('rfq_responses').select('*', { count: 'exact', head: true }).eq('supplier_id', session.user.id),
        ]);

        const totalViews = products.data?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;

        setStats({
          products: products.count || 0,
          inquiries: inquiries.count || 0,
          rfqResponses: rfqResponses.count || 0,
          totalViews,
        });
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Supplier Dashboard</h1>
          <p className="text-muted-foreground">Manage your products and leads</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">My Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.products}</div>
              <p className="text-xs text-muted-foreground">Listed products</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Inquiries</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inquiries}</div>
              <p className="text-xs text-muted-foreground">Buyer inquiries</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">RFQ Responses</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rfqResponses}</div>
              <p className="text-xs text-muted-foreground">Quotes submitted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
              <p className="text-xs text-muted-foreground">Product impressions</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="rfqs">RFQs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Button asChild className="h-auto py-6 flex-col">
                  <Link to="/supplier/add-product">
                    <Plus className="h-8 w-8 mb-2" />
                    Add Product
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-6 flex-col">
                  <Link to="/supplier/rfq-inbox">
                    <FileText className="h-8 w-8 mb-2" />
                    RFQ Inbox
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-6 flex-col">
                  <Link to="/supplier/orders">
                    <Package className="h-8 w-8 mb-2" />
                    Orders
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-6 flex-col">
                  <Link to="/messages">
                    <MessageSquare className="h-8 w-8 mb-2" />
                    Messages
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-6 flex-col">
                  <Link to="/analytics">
                    <TrendingUp className="h-8 w-8 mb-2" />
                    Analytics
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>My Products</CardTitle>
                <div className="flex gap-2">
                  <Button asChild variant="outline">
                    <Link to="/supplier/products">View All</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/supplier/add-product">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  You have {stats.products} products. <Link to="/supplier/products" className="text-primary hover:underline">Manage products</Link>
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <CardTitle>Recent Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No leads yet</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rfqs">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>RFQ Opportunities</CardTitle>
                <Button asChild>
                  <Link to="/supplier/rfq-inbox">View All RFQs</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Browse open RFQs from buyers and submit your quotes</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default SupplierDashboard;
