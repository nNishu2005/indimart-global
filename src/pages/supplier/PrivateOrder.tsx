import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, ArrowLeft, MessageCircle, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

const PrivateOrder = () => {
  const [copied, setCopied] = useState(false);

  const [supplierInfo, setSupplierInfo] = useState({
    companyName: '',
    phone: '',
  });

  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    phone: '',
    company: '',
  });

  const [orderDetails, setOrderDetails] = useState({
    orderRef: `PO-${Date.now().toString(36).toUpperCase()}`,
    deliveryDate: '',
    notes: '',
  });

  const [items, setItems] = useState<OrderItem[]>([
    { name: '', quantity: 1, unitPrice: 0 },
  ]);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (data) {
        setSupplierInfo({
          companyName: data.company_name || '',
          phone: data.phone || '',
        });
      }
    };
    loadProfile();
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

  const buildWhatsAppMessage = () => {
    const itemLines = items
      .filter(i => i.name)
      .map((item, idx) => `${idx + 1}. ${item.name} — Qty: ${item.quantity} × ₹${item.unitPrice.toLocaleString('en-IN')} = ₹${(item.quantity * item.unitPrice).toLocaleString('en-IN')}`)
      .join('\n');

    return `📦 *Private Order Confirmation*
━━━━━━━━━━━━━━━━━━
*Order Ref:* ${orderDetails.orderRef}
*From:* ${supplierInfo.companyName || 'Supplier'}
*To:* ${buyerInfo.name || 'Buyer'}${buyerInfo.company ? ` (${buyerInfo.company})` : ''}

📋 *Items:*
${itemLines || 'No items added'}

💰 *Summary:*
Subtotal: ₹${subtotal.toLocaleString('en-IN')}
GST (18%): ₹${gst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
*Total: ₹${total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}*
${orderDetails.deliveryDate ? `\n📅 *Delivery by:* ${orderDetails.deliveryDate}` : ''}
${orderDetails.notes ? `\n📝 *Notes:* ${orderDetails.notes}` : ''}

━━━━━━━━━━━━━━━━━━
_Sent via TradeConnect_`;
  };

  const handleWhatsAppShare = () => {
    if (items.every(i => !i.name)) {
      toast.error('कम से कम एक item add करें');
      return;
    }

    const phone = buyerInfo.phone.replace(/\D/g, '');
    const message = encodeURIComponent(buildWhatsAppMessage());
    const url = phone
      ? `https://wa.me/${phone.startsWith('91') ? phone : `91${phone}`}?text=${message}`
      : `https://wa.me/?text=${message}`;

    window.open(url, '_blank');
    toast.success('WhatsApp खुल रहा है...');
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(buildWhatsAppMessage());
    setCopied(true);
    toast.success('Message copied!');
    setTimeout(() => setCopied(false), 2000);
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
            <h1 className="text-2xl font-bold">Private Order</h1>
            <p className="text-sm text-muted-foreground">Off-platform order tracking & WhatsApp sharing</p>
          </div>
          <Badge variant="secondary" className="ml-auto">
            <MessageCircle className="h-3 w-3 mr-1" /> WhatsApp Ready
          </Badge>
        </div>

        {/* Buyer Info */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Buyer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Buyer Name</Label>
                <Input placeholder="Name" value={buyerInfo.name}
                  onChange={(e) => setBuyerInfo({ ...buyerInfo, name: e.target.value })} />
              </div>
              <div>
                <Label>Company</Label>
                <Input placeholder="Company name" value={buyerInfo.company}
                  onChange={(e) => setBuyerInfo({ ...buyerInfo, company: e.target.value })} />
              </div>
              <div>
                <Label>WhatsApp Number</Label>
                <Input placeholder="91XXXXXXXXXX" value={buyerInfo.phone}
                  onChange={(e) => setBuyerInfo({ ...buyerInfo, phone: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label>Order Reference</Label>
                <Input value={orderDetails.orderRef}
                  onChange={(e) => setOrderDetails({ ...orderDetails, orderRef: e.target.value })} />
              </div>
              <div>
                <Label>Expected Delivery</Label>
                <Input type="date" value={orderDetails.deliveryDate}
                  onChange={(e) => setOrderDetails({ ...orderDetails, deliveryDate: e.target.value })} />
              </div>
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
            <Textarea placeholder="Payment terms, delivery address, etc..." value={orderDetails.notes}
              onChange={(e) => setOrderDetails({ ...orderDetails, notes: e.target.value })} className="mt-2" rows={3} />
          </CardContent>
        </Card>

        {/* WhatsApp Actions */}
        <div className="flex gap-3 mb-8">
          <Button onClick={handleWhatsAppShare} className="gap-2 flex-1 bg-[hsl(142,70%,40%)] hover:bg-[hsl(142,70%,35%)] text-white">
            <MessageCircle className="h-4 w-4" /> Share on WhatsApp
          </Button>
          <Button onClick={handleCopyMessage} variant="outline" className="gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Message'}
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivateOrder;
