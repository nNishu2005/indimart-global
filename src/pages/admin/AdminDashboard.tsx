import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Users, Package, FileText, Shield, FileBadge, PenLine, TrendingUp, DollarSign, ShieldCheck, FolderTree } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    buyers: 0,
    suppliers: 0,
    pendingProducts: 0,
    totalProducts: 0,
    totalRFQs: 0,
    pendingDocuments: 0,
    totalOrders: 0,
    totalRevenue: 0,
    verifiedSuppliers: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const [users, buyers, suppliers, pendingProducts, totalProducts, rfqs, pendingDocs, orders, verifiedSuppliers] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'buyer'),
        supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'supplier'),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_approved', false),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('rfqs').select('*', { count: 'exact', head: true }),
        supabase.from('documents').select('*', { count: 'exact', head: true }).eq('is_verified', false),
        supabase.from('orders').select('total_amount'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_verified', true),
      ]);

      const totalRevenue = orders.data?.reduce((s, o) => s + Number(o.total_amount), 0) || 0;

      setStats({
        totalUsers: users.count || 0,
        buyers: buyers.count || 0,
        suppliers: suppliers.count || 0,
        pendingProducts: pendingProducts.count || 0,
        totalProducts: totalProducts.count || 0,
        totalRFQs: rfqs.count || 0,
        pendingDocuments: pendingDocs.count || 0,
        totalOrders: orders.data?.length || 0,
        totalRevenue,
        verifiedSuppliers: verifiedSuppliers.count || 0,
      });
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform management and analytics</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4 text-center">
              <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-2xl font-bold">{stats.suppliers}</p>
              <p className="text-xs text-muted-foreground">Suppliers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <ShieldCheck className="h-5 w-5 mx-auto mb-1 text-green-600" />
              <p className="text-2xl font-bold">{stats.verifiedSuppliers}</p>
              <p className="text-xs text-muted-foreground">Verified</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Package className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
              <p className="text-xs text-muted-foreground">Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <DollarSign className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <FileText className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-2xl font-bold">{stats.totalRFQs}</p>
              <p className="text-xs text-muted-foreground">RFQs</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Button asChild className="h-auto py-6 flex-col">
              <Link to="/admin/users">
                <Users className="h-8 w-8 mb-2" />
                User Management
              </Link>
            </Button>
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
            <Button asChild className="h-auto py-6 flex-col">
              <Link to="/admin/transactions">
                <TrendingUp className="h-8 w-8 mb-2" />
                Transactions
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-6 flex-col">
              <Link to="/admin/disputes">
                <Shield className="h-8 w-8 mb-2" />
                Disputes
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-6 flex-col">
              <Link to="/admin/blog">
                <PenLine className="h-8 w-8 mb-2" />
                Blog Manager
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-6 flex-col">
              <Link to="/admin/categories">
                <FolderTree className="h-8 w-8 mb-2" />
                Manage Categories
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
