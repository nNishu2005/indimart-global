import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Package, FileText, TrendingUp, Shield, CheckCircle, FileBadge } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    buyers: 0,
    suppliers: 0,
    pendingProducts: 0,
    totalProducts: 0,
    totalRFQs: 0,
    pendingDocuments: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const [users, buyers, suppliers, pendingProducts, totalProducts, rfqs, pendingDocs] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'buyer'),
        supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'supplier'),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_approved', false),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('rfqs').select('*', { count: 'exact', head: true }),
        supabase.from('documents').select('*', { count: 'exact', head: true }).eq('is_verified', false),
      ]);

      setStats({
        totalUsers: users.count || 0,
        buyers: buyers.count || 0,
        suppliers: suppliers.count || 0,
        pendingProducts: pendingProducts.count || 0,
        totalProducts: totalProducts.count || 0,
        totalRFQs: rfqs.count || 0,
        pendingDocuments: pendingDocs.count || 0,
      });
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform management and analytics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.buyers} buyers, {stats.suppliers} suppliers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingProducts} pending approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">RFQs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRFQs}</div>
              <p className="text-xs text-muted-foreground">Total requests for quotes</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button asChild className="h-auto py-6 flex-col">
                  <Link to="/admin/approve-products">
                    <Package className="h-8 w-8 mb-2" />
                    Approve Products
                    {stats.pendingProducts > 0 && (
                      <span className="ml-2 bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full text-xs">
                        {stats.pendingProducts}
                      </span>
                    )}
                  </Link>
                </Button>
                <Button asChild className="h-auto py-6 flex-col">
                  <Link to="/admin/verify-documents">
                    <FileBadge className="h-8 w-8 mb-2" />
                    Verify Documents
                    {stats.pendingDocuments > 0 && (
                      <span className="ml-2 bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full text-xs">
                        {stats.pendingDocuments}
                      </span>
                    )}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-6 flex-col">
                  <Link to="/admin/disputes">
                    <Shield className="h-8 w-8 mb-2" />
                    Disputes
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-6 flex-col">
                  <Link to="/suppliers">
                    <Users className="h-8 w-8 mb-2" />
                    All Suppliers
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Buyers</p>
                      <p className="text-sm text-muted-foreground">{stats.buyers} registered</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Suppliers</p>
                      <p className="text-sm text-muted-foreground">{stats.suppliers} registered</p>
                    </div>
                    <Button asChild variant="outline">
                      <Link to="/suppliers">View All</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Product Review</CardTitle>
                <Button asChild>
                  <Link to="/admin/approve-products">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Review Pending ({stats.pendingProducts})
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{stats.pendingProducts} products awaiting approval</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

          <TabsContent value="verification">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Document Verification</CardTitle>
                <Button asChild>
                  <Link to="/admin/verify-documents">
                    <FileBadge className="h-4 w-4 mr-2" />
                    Review Documents ({stats.pendingDocuments})
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{stats.pendingDocuments} documents awaiting verification</p>
              </CardContent>
            </Card>
          </TabsContent>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
