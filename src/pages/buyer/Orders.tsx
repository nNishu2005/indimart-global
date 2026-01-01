import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const BuyerOrders = () => {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<any[]>([]);

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('inquiries')
      .select('*, products(name)')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });

    setInquiries(data || []);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/buyer/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              My Orders & Inquiries
            </CardTitle>
            <CardDescription>Track your orders and inquiry status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inquiries.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No orders yet</p>
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
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default BuyerOrders;
