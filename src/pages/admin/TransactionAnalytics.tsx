import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, DollarSign, Package, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface OrderData {
  id: string;
  order_number: string;
  buyer_id: string;
  supplier_id: string;
  total_amount: number;
  status: string;
  delivery_status: string | null;
  created_at: string;
  buyer_name?: string;
  supplier_name?: string;
}

interface PaymentData {
  id: string;
  order_id: string;
  amount: number;
  status: string;
  payment_method: string | null;
  created_at: string;
  paid_at: string | null;
}

const TransactionAnalytics = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [ordersRes, paymentsRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('payments').select('*').order('created_at', { ascending: false }),
      ]);

      let enrichedOrders: OrderData[] = [];
      if (ordersRes.data) {
        const userIds = [...new Set(ordersRes.data.flatMap(o => [o.buyer_id, o.supplier_id]))];
        const { data: profiles } = await supabase.from('profiles').select('id, full_name, company_name').in('id', userIds);
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        enrichedOrders = ordersRes.data.map(o => ({
          ...o,
          buyer_name: profileMap.get(o.buyer_id)?.full_name || profileMap.get(o.buyer_id)?.company_name || 'Unknown',
          supplier_name: profileMap.get(o.supplier_id)?.company_name || profileMap.get(o.supplier_id)?.full_name || 'Unknown',
        }));
      }

      setOrders(enrichedOrders);
      setPayments(paymentsRes.data || []);
      setLoading(false);
    };
    load();
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total_amount), 0);
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const paidPayments = payments.filter(p => p.status === 'paid');
  const totalPaid = paidPayments.reduce((s, p) => s + Number(p.amount), 0);
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const totalPending = pendingPayments.reduce((s, p) => s + Number(p.amount), 0);

  const statusColor = (status: string) => {
    const map: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      failed: 'bg-red-100 text-red-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/admin/dashboard"><ArrowLeft className="h-4 w-4 mr-1" /> Admin Dashboard</Link>
        </Button>

        <h1 className="text-3xl font-bold mb-2">Transaction Analytics</h1>
        <p className="text-muted-foreground mb-6">Orders, payments, and revenue overview</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Orders</span>
            </div>
            <p className="text-2xl font-bold">{orders.length}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Paid Amount</span>
            </div>
            <p className="text-2xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-muted-foreground">Pending Amount</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">₹{totalPending.toLocaleString()}</p>
          </CardContent></Card>
        </div>

        <Tabs defaultValue="orders">
          <TabsList>
            <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
            <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardContent className="pt-4">
                {loading ? (
                  <p className="text-center py-8 text-muted-foreground">Loading...</p>
                ) : orders.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No orders yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order #</TableHead>
                          <TableHead>Buyer</TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Delivery</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map(order => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-sm">{order.order_number}</TableCell>
                            <TableCell>{order.buyer_name}</TableCell>
                            <TableCell>{order.supplier_name}</TableCell>
                            <TableCell className="font-medium">₹{Number(order.total_amount).toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge className={statusColor(order.status)}>{order.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{order.delivery_status || 'pending'}</Badge>
                            </TableCell>
                            <TableCell className="text-sm">{format(new Date(order.created_at), 'dd MMM yyyy')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardContent className="pt-4">
                {loading ? (
                  <p className="text-center py-8 text-muted-foreground">Loading...</p>
                ) : payments.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No payments yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Payment ID</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Paid At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map(p => (
                          <TableRow key={p.id}>
                            <TableCell className="font-mono text-sm">{p.id.slice(0, 8)}...</TableCell>
                            <TableCell className="font-medium">₹{Number(p.amount).toLocaleString()}</TableCell>
                            <TableCell>{p.payment_method || '—'}</TableCell>
                            <TableCell>
                              <Badge className={statusColor(p.status)}>{p.status}</Badge>
                            </TableCell>
                            <TableCell className="text-sm">{format(new Date(p.created_at), 'dd MMM yyyy')}</TableCell>
                            <TableCell className="text-sm">{p.paid_at ? format(new Date(p.paid_at), 'dd MMM yyyy') : '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default TransactionAnalytics;
