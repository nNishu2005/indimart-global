import { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Printer, Send, ArrowLeft, MessageCircle, FileText, Building2, User, Hash, Calendar, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

const GenerateInvoice = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const [sending, setSending] = useState(false);

  const [supplierInfo, setSupplierInfo] = useState({
    companyName: '',
    address: '',
    phone: '',
    email: '',
    gstNumber: '',
  });

  const [invoiceDetails, setInvoiceDetails] = useState({
    invoiceNumber: `INV-${Date.now().toString(36).toUpperCase()}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
  });

  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    company: '',
    address: '',
    email: '',
    phone: '',
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0 },
  ]);

  const [notes, setNotes] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (data) {
        setSupplierInfo({
          companyName: data.company_name || '',
          address: [data.address, data.city, data.state, data.pincode].filter(Boolean).join(', '),
          phone: data.phone || '',
          email: data.email || session.user.email || '',
          gstNumber: data.gst_number || '',
        });
      }
    };
    loadProfile();
  }, []);

  const addItem = () => setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  const handlePrint = () => window.print();

  const handleSendEmail = async () => {
    if (!buyerInfo.email) { toast.error('Buyer email is required'); return; }
    if (items.every(i => !i.description)) { toast.error('Please add at least one item'); return; }
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-invoice', {
        body: { supplierInfo, invoiceDetails, buyerInfo, items, subtotal, gst, total, notes },
      });
      if (error) throw error;
      toast.success(`Invoice sent to ${buyerInfo.email}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send invoice');
    } finally {
      setSending(false);
    }
  };

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="rounded-full">
              <Link to="/supplier/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Generate Invoice</h1>
              </div>
              <p className="text-sm text-muted-foreground ml-8">Create and send professional invoices to your buyers</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs font-mono hidden sm:inline-flex">
            {invoiceDetails.invoiceNumber}
          </Badge>
        </div>

        {/* Print styles */}
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #invoice-print, #invoice-print * { visibility: visible; }
            #invoice-print { position: absolute; left: 0; top: 0; width: 100%; padding: 2rem; }
            .no-print { display: none !important; }
          }
        `}</style>

        {/* Action Bar */}
        <Card className="mb-6 no-print border-primary/20 bg-primary/5">
          <CardContent className="py-4 flex gap-3 flex-wrap items-center">
            <Button onClick={handlePrint} variant="outline" className="gap-2 bg-background">
              <Printer className="h-4 w-4" /> Print / PDF
            </Button>
            <Button onClick={handleSendEmail} disabled={sending} className="gap-2">
              <Send className="h-4 w-4" /> {sending ? 'Sending...' : 'Email to Buyer'}
            </Button>
            <Button onClick={() => {
              const phone = buyerInfo.phone.replace(/\D/g, '');
              const msg = encodeURIComponent(`📄 *Invoice ${invoiceDetails.invoiceNumber}*\nFrom: ${supplierInfo.companyName}\nTo: ${buyerInfo.name || buyerInfo.company}\nTotal: ${formatCurrency(total)}\n\nPlease check your email for the full invoice.`);
              const url = phone ? `https://wa.me/${phone.startsWith('91') ? phone : `91${phone}`}?text=${msg}` : `https://wa.me/?text=${msg}`;
              window.open(url, '_blank');
            }} variant="outline" className="gap-2 bg-background text-[hsl(142,70%,35%)] border-[hsl(142,70%,35%)] hover:bg-[hsl(142,70%,95%)]">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </Button>
          </CardContent>
        </Card>

        <div ref={printRef} id="invoice-print" className="space-y-6">
          {/* Two-column: Supplier & Buyer */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Supplier */}
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  From (Supplier)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Company Name</Label>
                  <Input placeholder="Your Company Name" value={supplierInfo.companyName}
                    onChange={(e) => setSupplierInfo({ ...supplierInfo, companyName: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Address</Label>
                  <Input placeholder="Full Address" value={supplierInfo.address}
                    onChange={(e) => setSupplierInfo({ ...supplierInfo, address: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Phone</Label>
                    <Input placeholder="Phone" value={supplierInfo.phone}
                      onChange={(e) => setSupplierInfo({ ...supplierInfo, phone: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <Input placeholder="Email" value={supplierInfo.email}
                      onChange={(e) => setSupplierInfo({ ...supplierInfo, email: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">GST Number</Label>
                  <Input placeholder="GST Number" value={supplierInfo.gstNumber}
                    onChange={(e) => setSupplierInfo({ ...supplierInfo, gstNumber: e.target.value })} />
                </div>
              </CardContent>
            </Card>

            {/* Buyer */}
            <Card className="border-l-4 border-l-accent">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-accent-foreground" />
                  To (Buyer)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Buyer Name</Label>
                  <Input placeholder="Buyer Name" value={buyerInfo.name}
                    onChange={(e) => setBuyerInfo({ ...buyerInfo, name: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Company</Label>
                  <Input placeholder="Company Name" value={buyerInfo.company}
                    onChange={(e) => setBuyerInfo({ ...buyerInfo, company: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Address</Label>
                  <Input placeholder="Full Address" value={buyerInfo.address}
                    onChange={(e) => setBuyerInfo({ ...buyerInfo, address: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Email *</Label>
                    <Input placeholder="buyer@email.com" type="email" value={buyerInfo.email}
                      onChange={(e) => setBuyerInfo({ ...buyerInfo, email: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">WhatsApp</Label>
                    <Input placeholder="WhatsApp Number" value={buyerInfo.phone}
                      onChange={(e) => setBuyerInfo({ ...buyerInfo, phone: e.target.value })} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoice Meta */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Hash className="h-3 w-3" /> Invoice Number
                  </Label>
                  <Input value={invoiceDetails.invoiceNumber} className="font-mono"
                    onChange={(e) => setInvoiceDetails({ ...invoiceDetails, invoiceNumber: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Invoice Date
                  </Label>
                  <Input type="date" value={invoiceDetails.date}
                    onChange={(e) => setInvoiceDetails({ ...invoiceDetails, date: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Due Date
                  </Label>
                  <Input type="date" value={invoiceDetails.dueDate}
                    onChange={(e) => setInvoiceDetails({ ...invoiceDetails, dueDate: e.target.value })} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-primary" />
                Invoice Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Table Header */}
              <div className="hidden sm:grid grid-cols-[1fr_90px_120px_120px_40px] gap-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-3 border-b">
                <span>Description</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Unit Price (₹)</span>
                <span className="text-right">Amount (₹)</span>
                <span></span>
              </div>

              {/* Items */}
              <div className="divide-y">
                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_90px_120px_120px_40px] gap-3 items-center py-3">
                    <div>
                      <Label className="text-xs text-muted-foreground sm:hidden">Description</Label>
                      <Input placeholder="Item description" value={item.description}
                        onChange={(e) => updateItem(i, 'description', e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground sm:hidden">Quantity</Label>
                      <Input type="number" min={1} value={item.quantity} className="text-center"
                        onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))} />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground sm:hidden">Unit Price (₹)</Label>
                      <Input type="number" min={0} value={item.unitPrice} className="text-right"
                        onChange={(e) => updateItem(i, 'unitPrice', Number(e.target.value))} />
                    </div>
                    <div className="text-right font-semibold text-sm px-2 py-2 bg-muted/50 rounded-md">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 no-print"
                      onClick={() => removeItem(i)} disabled={items.length === 1}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button variant="outline" size="sm" onClick={addItem} className="gap-1 mt-4 no-print">
                <Plus className="h-3 w-3" /> Add Item
              </Button>

              {/* Totals */}
              <div className="mt-6 flex justify-end">
                <div className="w-full max-w-xs space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>GST (18%)</span>
                    <span>{formatCurrency(gst)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold text-primary">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Notes / Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea placeholder="Payment terms, bank details, or other notes..." value={notes}
                onChange={(e) => setNotes(e.target.value)} rows={3} />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GenerateInvoice;
