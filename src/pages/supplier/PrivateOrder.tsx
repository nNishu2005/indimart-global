import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, ArrowLeft, Send, Paperclip, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

const PrivateOrder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [buyers, setBuyers] = useState<{ id: string; company_name: string; full_name: string }[]>([]);
  const [selectedBuyer, setSelectedBuyer] = useState('');

  const [quoteDetails, setQuoteDetails] = useState({
    title: '',
    description: '',
    deliveryDate: '',
    notes: '',
  });

  const [items, setItems] = useState<OrderItem[]>([
    { name: '', quantity: 1, unitPrice: 0 },
  ]);

  useEffect(() => {
    const loadBuyers = async () => {
      // Load users who have buyer role
      const { data } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'buyer');
      
      if (data && data.length > 0) {
        const buyerIds = data.map(d => d.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, company_name, full_name')
          .in('id', buyerIds);
        setBuyers(profiles || []);
      }
    };
    loadBuyers();
  }, []);

  const addItem = () => setItems([...items, { name: '', quantity: 1, unitPrice: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof OrderItem, value: string | number) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    setItems(updated);
  };

  const subtotal = items.reduce((s, item) => s + item.quantity * item.unitPrice, 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  const handleSubmitQuote = async () => {
    if (!quoteDetails.title.trim()) {
      toast.error('Quote title is required');
      return;
    }
    if (!selectedBuyer) {
      toast.error('Please select a buyer');
      return;
    }
    if (items.every(i => !i.name)) {
      toast.error('Add at least one item');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('custom_quotes').insert({
        requester_id: user.id,
        responder_id: selectedBuyer,
        title: quoteDetails.title,
        description: quoteDetails.description,
        items: JSON.parse(JSON.stringify(items.filter(i => i.name))),
        quoted_price: total,
        delivery_date: quoteDetails.deliveryDate || null,
        notes: quoteDetails.notes,
        status: 'pending',
      } as any);

      if (error) throw error;
      toast.success('Quote sent successfully!');
      navigate('/quotes');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/supplier/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Request Custom Quote</h1>
            <p className="text-sm text-muted-foreground">Create & send a custom quote to a buyer</p>
          </div>
          <Badge variant="secondary" className="ml-auto">
            <Send className="h-3 w-3 mr-1" /> In-App
          </Badge>
        </div>

        {/* Buyer Selection */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Select Buyer</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedBuyer} onValueChange={setSelectedBuyer}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a buyer..." />
              </SelectTrigger>
              <SelectContent>
                {buyers.map((buyer) => (
                  <SelectItem key={buyer.id} value={buyer.id}>
                    {buyer.company_name || buyer.full_name || 'Unknown Buyer'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Quote Details */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quote Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Title *</Label>
              <Input placeholder="e.g. Bulk Steel Rods Order" value={quoteDetails.title}
                onChange={(e) => setQuoteDetails({ ...quoteDetails, title: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea placeholder="Describe the quote..." value={quoteDetails.description}
                onChange={(e) => setQuoteDetails({ ...quoteDetails, description: e.target.value })} rows={2} />
            </div>
            <div>
              <Label>Expected Delivery</Label>
              <Input type="date" value={quoteDetails.deliveryDate}
                onChange={(e) => setQuoteDetails({ ...quoteDetails, deliveryDate: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-[1fr_80px_100px_100px_40px] gap-2 text-xs font-semibold text-muted-foreground">
              <span>Item Name</span><span>Qty</span><span>Price (₹)</span><span>Amount</span><span></span>
            </div>
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-[1fr_80px_100px_100px_40px] gap-2 items-center">
                <Input placeholder="Product name" value={item.name}
                  onChange={(e) => updateItem(i, 'name', e.target.value)} />
                <Input type="number" min={1} value={item.quantity}
                  onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))} />
                <Input type="number" min={0} value={item.unitPrice}
                  onChange={(e) => updateItem(i, 'unitPrice', Number(e.target.value))} />
                <div className="text-sm font-medium text-right pr-2">
                  ₹{(item.quantity * item.unitPrice).toLocaleString('en-IN')}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8"
                  onClick={() => removeItem(i)} disabled={items.length === 1}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addItem} className="gap-1">
              <Plus className="h-3 w-3" /> Add Item
            </Button>

            <Separator className="my-4" />

            <div className="flex flex-col items-end gap-1 text-sm">
              <div className="flex justify-between w-48">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between w-48">
                <span className="text-muted-foreground">GST (18%):</span>
                <span>₹{gst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <Separator className="w-48 my-1" />
              <div className="flex justify-between w-48 font-bold text-base">
                <span>Total:</span>
                <span>₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Label>Notes</Label>
            <Textarea placeholder="Payment terms, delivery address, etc..." value={quoteDetails.notes}
              onChange={(e) => setQuoteDetails({ ...quoteDetails, notes: e.target.value })} className="mt-2" rows={3} />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-3 mb-8">
          <Button onClick={handleSubmitQuote} disabled={loading} className="gap-2 flex-1">
            <Send className="h-4 w-4" /> {loading ? 'Sending...' : 'Send Quote to Buyer'}
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivateOrder;
