import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const RequestQuote = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<{ id: string; company_name: string; full_name: string }[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    quantity: '',
    unit: '',
    targetPrice: '',
    deliveryDate: '',
  });

  useEffect(() => {
    const loadSuppliers = async () => {
      const { data: profiles } = await supabase
        .from('supplier_profiles_public')
        .select('id, company_name');
      setSuppliers((profiles || []).map((p: any) => ({ ...p, full_name: null })));
    };
    loadSuppliers();
  }, []);

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!selectedSupplier) { toast.error('Select a supplier'); return; }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('custom_quotes').insert({
        requester_id: user.id,
        responder_id: selectedSupplier,
        title: form.title,
        description: form.description,
        quantity: form.quantity ? Number(form.quantity) : null,
        unit: form.unit || null,
        target_price: form.targetPrice ? Number(form.targetPrice) : null,
        delivery_date: form.deliveryDate || null,
        status: 'pending',
      });

      if (error) throw error;
      toast.success('Quote request sent!');
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
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/buyer/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Request Custom Quote</h1>
            <p className="text-sm text-muted-foreground">Ask a supplier for pricing</p>
          </div>
        </div>

        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Select Supplier</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a supplier..." />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.company_name || s.full_name || 'Unknown'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quote Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Title *</Label>
              <Input placeholder="What do you need?" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea placeholder="Specifications, requirements..." value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Quantity</Label>
                <Input type="number" placeholder="100" value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
              </div>
              <div>
                <Label>Unit</Label>
                <Input placeholder="kg, pcs, etc." value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })} />
              </div>
              <div>
                <Label>Target Price (₹)</Label>
                <Input type="number" placeholder="Budget" value={form.targetPrice}
                  onChange={(e) => setForm({ ...form, targetPrice: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Needed By</Label>
              <Input type="date" value={form.deliveryDate}
                onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSubmit} disabled={loading} className="w-full gap-2">
          <Send className="h-4 w-4" /> {loading ? 'Sending...' : 'Send Quote Request'}
        </Button>
      </main>
      <Footer />
    </div>
  );
};

export default RequestQuote;
