import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, MapPin, Calendar, Package, 
  DollarSign, ArrowLeft, Send, Clock
} from 'lucide-react';

interface RFQ {
  id: string;
  title: string;
  description: string;
  quantity: number | null;
  unit: string | null;
  target_price: number | null;
  location: string | null;
  deadline: string | null;
  status: string | null;
  created_at: string;
  buyer_id: string;
  category: { name: string } | null;
  hasResponded?: boolean;
}

const RFQInbox = () => {
  const { toast } = useToast();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(null);
  const [responseForm, setResponseForm] = useState({
    message: '',
    quoted_price: '',
    delivery_time: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRFQs();
  }, []);

  const loadRFQs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get all open RFQs
    const { data: rfqData } = await supabase
      .from('rfqs')
      .select(`
        *,
        category:categories(name)
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    // Check which RFQs the supplier has already responded to
    const { data: responses } = await supabase
      .from('rfq_responses')
      .select('rfq_id')
      .eq('supplier_id', user.id);

    const respondedRFQIds = new Set(responses?.map(r => r.rfq_id) || []);

    const rfqsWithStatus = (rfqData || []).map(rfq => ({
      ...rfq,
      hasResponded: respondedRFQIds.has(rfq.id)
    }));

    setRfqs(rfqsWithStatus);
    setLoading(false);
  };

  const handleSubmitResponse = async () => {
    if (!selectedRFQ || !responseForm.message.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a message',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('rfq_responses').insert({
        rfq_id: selectedRFQ.id,
        supplier_id: user.id,
        message: responseForm.message.trim(),
        quoted_price: responseForm.quoted_price ? parseFloat(responseForm.quoted_price) : null,
        delivery_time: responseForm.delivery_time.trim() || null,
      });

      if (error) throw error;

      toast({
        title: 'Response Sent!',
        description: 'Your quotation has been submitted to the buyer.',
      });

      setSelectedRFQ(null);
      setResponseForm({ message: '', quoted_price: '', delivery_time: '' });
      loadRFQs();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/supplier/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">RFQ Inbox</h1>
          <p className="text-muted-foreground">Browse and respond to buyer requests for quotations</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading RFQs...</p>
          </div>
        ) : rfqs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No Open RFQs</h3>
              <p className="text-muted-foreground">There are no open requests for quotations at the moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {rfqs.map(rfq => (
              <Card key={rfq.id} className={rfq.hasResponded ? 'opacity-60' : ''}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{rfq.title}</h3>
                        <div className="flex gap-2">
                          {rfq.hasResponded && (
                            <Badge variant="secondary">Responded</Badge>
                          )}
                          <Badge variant={rfq.status === 'open' ? 'default' : 'secondary'}>
                            {rfq.status}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-4 line-clamp-2">{rfq.description}</p>

                      <div className="flex flex-wrap gap-4 text-sm">
                        {rfq.category && (
                          <span className="flex items-center">
                            <Package className="h-4 w-4 mr-1 text-muted-foreground" />
                            {rfq.category.name}
                          </span>
                        )}
                        {rfq.quantity && (
                          <span className="flex items-center">
                            <Package className="h-4 w-4 mr-1 text-muted-foreground" />
                            {rfq.quantity} {rfq.unit}
                          </span>
                        )}
                        {rfq.target_price && (
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                            ₹{rfq.target_price} target
                          </span>
                        )}
                        {rfq.location && (
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                            {rfq.location}
                          </span>
                        )}
                        {rfq.deadline && (
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                            Deadline: {new Date(rfq.deadline).toLocaleDateString()}
                          </span>
                        )}
                        <span className="flex items-center text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          Posted {new Date(rfq.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          onClick={() => setSelectedRFQ(rfq)}
                          disabled={rfq.hasResponded}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {rfq.hasResponded ? 'Already Responded' : 'Send Quote'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Send Quotation</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4 mt-4">
                          <div className="p-4 bg-muted rounded-lg">
                            <h4 className="font-semibold mb-2">{selectedRFQ?.title}</h4>
                            <p className="text-sm text-muted-foreground">{selectedRFQ?.description}</p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="quoted_price">Your Quoted Price (₹)</Label>
                            <Input
                              id="quoted_price"
                              type="number"
                              step="0.01"
                              value={responseForm.quoted_price}
                              onChange={(e) => setResponseForm({ ...responseForm, quoted_price: e.target.value })}
                              placeholder="Enter your price per unit"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="delivery_time">Estimated Delivery Time</Label>
                            <Input
                              id="delivery_time"
                              value={responseForm.delivery_time}
                              onChange={(e) => setResponseForm({ ...responseForm, delivery_time: e.target.value })}
                              placeholder="e.g., 7-10 days, 2 weeks"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="message">Message to Buyer *</Label>
                            <Textarea
                              id="message"
                              rows={4}
                              value={responseForm.message}
                              onChange={(e) => setResponseForm({ ...responseForm, message: e.target.value })}
                              placeholder="Describe your offer, available stock, terms, etc."
                            />
                          </div>

                          <Button 
                            className="w-full" 
                            onClick={handleSubmitResponse}
                            disabled={submitting}
                          >
                            {submitting ? 'Sending...' : 'Send Quotation'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default RFQInbox;