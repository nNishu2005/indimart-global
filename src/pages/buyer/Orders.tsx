import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingCart, Package, Truck, CheckCircle2, Clock, MapPin } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
  pending: { label: 'Pending', variant: 'secondary', icon: Clock },
  confirmed: { label: 'Confirmed', variant: 'default', icon: CheckCircle2 },
  processing: { label: 'Processing', variant: 'outline', icon: Package },
  shipped: { label: 'Shipped', variant: 'default', icon: Truck },
  delivered: { label: 'Delivered', variant: 'default', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', variant: 'destructive', icon: Clock },
};

const deliverySteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const BuyerOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [ordersRes, inquiriesRes] = await Promise.all([
      supabase
        .from('orders')
        .select('*, products(name)')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('inquiries')
        .select('*, products(name)')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false }),
    ]);

    setOrders(ordersRes.data || []);
    setInquiries(inquiriesRes.data || []);
  };

  const getStepIndex = (status: string) => {
    const idx = deliverySteps.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate('/buyer/dashboard')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>

        <h1 className="text-2xl font-bold mb-6">My Orders & Inquiries</h1>

        <Tabs defaultValue="orders">
          <TabsList className="mb-4">
            <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
            <TabsTrigger value="inquiries">Inquiries ({inquiries.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <div className="space-y-4">
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No orders yet</p>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => {
                  const currentStep = getStepIndex(order.delivery_status || order.status);
                  const isExpanded = expandedOrder === order.id;

                  return (
                    <Card key={order.id} className="overflow-hidden">
                      <CardContent className="pt-6">
                        <div
                          className="flex justify-between items-start cursor-pointer"
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{order.products?.name || 'Order'}</h3>
                              <Badge variant={statusConfig[order.status]?.variant || 'secondary'}>
                                {statusConfig[order.status]?.label || order.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Order #{order.order_number} • {new Date(order.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-sm font-medium mt-1">
                              ₹{Number(order.total_amount).toLocaleString('en-IN')} • Qty: {order.quantity}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            {isExpanded ? 'Hide' : 'Track'}
                          </Button>
                        </div>

                        {isExpanded && (
                          <div className="mt-6 border-t pt-4">
                            {/* Tracking Timeline */}
                            <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                              <MapPin className="h-4 w-4" /> Order Tracking
                            </h4>
                            <div className="flex items-center justify-between mb-6">
                              {deliverySteps.map((step, idx) => {
                                const StepIcon = statusConfig[step]?.icon || Clock;
                                const isCompleted = idx <= currentStep;
                                const isCurrent = idx === currentStep;
                                return (
                                  <div key={step} className="flex flex-col items-center flex-1 relative">
                                    {idx > 0 && (
                                      <div
                                        className={`absolute top-4 right-1/2 w-full h-0.5 -z-10 ${
                                          idx <= currentStep ? 'bg-primary' : 'bg-muted'
                                        }`}
                                      />
                                    )}
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        isCurrent
                                          ? 'bg-primary text-primary-foreground ring-2 ring-primary/30'
                                          : isCompleted
                                          ? 'bg-primary text-primary-foreground'
                                          : 'bg-muted text-muted-foreground'
                                      }`}
                                    >
                                      <StepIcon className="h-4 w-4" />
                                    </div>
                                    <span className={`text-xs mt-1 capitalize ${isCurrent ? 'font-semibold' : ''}`}>
                                      {step}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Order Details */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-muted-foreground">Unit Price:</span>
                                <span className="ml-2 font-medium">₹{Number(order.unit_price).toLocaleString('en-IN')}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Delivery Status:</span>
                                <span className="ml-2 font-medium capitalize">{order.delivery_status || 'Pending'}</span>
                              </div>
                              {order.expected_delivery_date && (
                                <div>
                                  <span className="text-muted-foreground">Expected Delivery:</span>
                                  <span className="ml-2 font-medium">
                                    {new Date(order.expected_delivery_date).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                              {order.actual_delivery_date && (
                                <div>
                                  <span className="text-muted-foreground">Delivered On:</span>
                                  <span className="ml-2 font-medium">
                                    {new Date(order.actual_delivery_date).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                              {order.notes && (
                                <div className="col-span-2">
                                  <span className="text-muted-foreground">Notes:</span>
                                  <span className="ml-2">{order.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="inquiries">
            <div className="space-y-4">
              {inquiries.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No inquiries yet</p>
                  </CardContent>
                </Card>
              ) : (
                inquiries.map((inquiry) => (
                  <Card key={inquiry.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{inquiry.products?.name || 'General Inquiry'}</h3>
                          <p className="text-sm text-muted-foreground mt-2">{inquiry.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(inquiry.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={inquiry.status === 'pending' ? 'secondary' : 'default'}>
                          {inquiry.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default BuyerOrders;
