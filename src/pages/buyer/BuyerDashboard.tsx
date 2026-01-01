import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, MessageSquare, Bookmark, FileText, Package, Building2, Search, Plus } from 'lucide-react';

const BuyerDashboard = () => {
  const [stats, setStats] = useState({
    inquiries: 0,
    savedProducts: 0,
    rfqs: 0,
    messages: 0,
  });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user);

      if (session?.user) {
        const [inquiries, saved, rfqs, messages] = await Promise.all([
          supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('buyer_id', session.user.id),
          supabase.from('saved_products').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id),
          supabase.from('rfqs').select('*', { count: 'exact', head: true }).eq('buyer_id', session.user.id),
          supabase.from('messages').select('*', { count: 'exact', head: true }).eq('receiver_id', session.user.id),
        ]);

        setStats({
          inquiries: inquiries.count || 0,
          savedProducts: saved.count || 0,
          rfqs: rfqs.count || 0,
          messages: messages.count || 0,
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
          <h1 className="text-3xl font-bold mb-2">Buyer Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.email}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">My Inquiries</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inquiries}</div>
              <p className="text-xs text-muted-foreground">Active inquiries</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Saved Products</CardTitle>
              <Bookmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.savedProducts}</div>
              <p className="text-xs text-muted-foreground">Bookmarked items</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">RFQs Posted</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rfqs}</div>
              <p className="text-xs text-muted-foreground">Requests for quotes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.messages}</div>
              <p className="text-xs text-muted-foreground">Unread messages</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="inquiries">My Inquiries</TabsTrigger>
            <TabsTrigger value="rfqs">My RFQs</TabsTrigger>
            <TabsTrigger value="saved">Saved Items</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button asChild className="h-auto py-6 flex-col">
                  <Link to="/products">
                    <Search className="h-8 w-8 mb-2" />
                    Search Products
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-6 flex-col">
                  <Link to="/suppliers">
                    <Building2 className="h-8 w-8 mb-2" />
                    Find Suppliers
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-6 flex-col">
                  <Link to="/buyer/create-rfq">
                    <Plus className="h-8 w-8 mb-2" />
                    Post RFQ
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-6 flex-col">
                  <Link to="/messages">
                    <MessageSquare className="h-8 w-8 mb-2" />
                    Messages
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inquiries">
            <Card>
              <CardHeader>
                <CardTitle>Recent Inquiries</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No recent inquiries</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rfqs">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>My RFQs</CardTitle>
                <Button asChild>
                  <Link to="/buyer/create-rfq">
                    <Plus className="h-4 w-4 mr-2" />
                    Post New RFQ
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No RFQs posted yet</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved">
            <Card>
              <CardHeader>
                <CardTitle>Saved Products & Suppliers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No saved items yet</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default BuyerDashboard;
