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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Printer, Send, ArrowLeft, MessageCircle, FileText, Building2, User, Hash, Calendar, IndianRupee, Eye, Edit } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('edit');

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

  const handlePrint = () => {
    setActiveTab('preview');
    setTimeout(() => window.print(), 300);
  };

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

  const fmt = (val: number) => `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6 no-print">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="rounded-full">
              <Link to="/supplier/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Generate Invoice</h1>
              </div>
              <p className="text-sm text-muted-foreground ml-8">Create and send professional invoices</p>
            </div>
          </div>
        </div>

        {/* Print styles */}
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #invoice-print-preview, #invoice-print-preview * { visibility: visible; }
            #invoice-print-preview { position: absolute; left: 0; top: 0; width: 100%; }
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
              const msg = encodeURIComponent(`📄 *Invoice ${invoiceDetails.invoiceNumber}*\nFrom: ${supplierInfo.companyName}\nTo: ${buyerInfo.name || buyerInfo.company}\nTotal: ${fmt(total)}`);
              const url = phone ? `https://wa.me/${phone.startsWith('91') ? phone : `91${phone}`}?text=${msg}` : `https://wa.me/?text=${msg}`;
              window.open(url, '_blank');
            }} variant="outline" className="gap-2 bg-background text-[hsl(142,70%,35%)] border-[hsl(142,70%,35%)] hover:bg-[hsl(142,70%,95%)]">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </Button>
          </CardContent>
        </Card>

        {/* Tabs: Edit / Preview */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="no-print">
            <TabsTrigger value="edit" className="gap-2"><Edit className="h-4 w-4" /> Edit</TabsTrigger>
            <TabsTrigger value="preview" className="gap-2"><Eye className="h-4 w-4" /> Preview</TabsTrigger>
          </TabsList>

          {/* ─── EDIT TAB ─── */}
          <TabsContent value="edit" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" /> From (Supplier)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div><Label className="text-xs text-muted-foreground">Company Name</Label>
                    <Input placeholder="Your Company Name" value={supplierInfo.companyName}
                      onChange={(e) => setSupplierInfo({ ...supplierInfo, companyName: e.target.value })} /></div>
                  <div><Label className="text-xs text-muted-foreground">Address</Label>
                    <Input placeholder="Full Address" value={supplierInfo.address}
                      onChange={(e) => setSupplierInfo({ ...supplierInfo, address: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs text-muted-foreground">Phone</Label>
                      <Input placeholder="Phone" value={supplierInfo.phone}
                        onChange={(e) => setSupplierInfo({ ...supplierInfo, phone: e.target.value })} /></div>
                    <div><Label className="text-xs text-muted-foreground">Email</Label>
                      <Input placeholder="Email" value={supplierInfo.email}
                        onChange={(e) => setSupplierInfo({ ...supplierInfo, email: e.target.value })} /></div>
                  </div>
                  <div><Label className="text-xs text-muted-foreground">GST Number</Label>
                    <Input placeholder="GST Number" value={supplierInfo.gstNumber}
                      onChange={(e) => setSupplierInfo({ ...supplierInfo, gstNumber: e.target.value })} /></div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-accent">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" /> To (Buyer)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div><Label className="text-xs text-muted-foreground">Buyer Name</Label>
                    <Input placeholder="Buyer Name" value={buyerInfo.name}
                      onChange={(e) => setBuyerInfo({ ...buyerInfo, name: e.target.value })} /></div>
                  <div><Label className="text-xs text-muted-foreground">Company</Label>
                    <Input placeholder="Company Name" value={buyerInfo.company}
                      onChange={(e) => setBuyerInfo({ ...buyerInfo, company: e.target.value })} /></div>
                  <div><Label className="text-xs text-muted-foreground">Address</Label>
                    <Input placeholder="Full Address" value={buyerInfo.address}
                      onChange={(e) => setBuyerInfo({ ...buyerInfo, address: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs text-muted-foreground">Email *</Label>
                      <Input placeholder="buyer@email.com" type="email" value={buyerInfo.email}
                        onChange={(e) => setBuyerInfo({ ...buyerInfo, email: e.target.value })} /></div>
                    <div><Label className="text-xs text-muted-foreground">WhatsApp</Label>
                      <Input placeholder="WhatsApp Number" value={buyerInfo.phone}
                        onChange={(e) => setBuyerInfo({ ...buyerInfo, phone: e.target.value })} /></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1"><Hash className="h-3 w-3" /> Invoice Number</Label>
                    <Input value={invoiceDetails.invoiceNumber} className="font-mono"
                      onChange={(e) => setInvoiceDetails({ ...invoiceDetails, invoiceNumber: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Invoice Date</Label>
                    <Input type="date" value={invoiceDetails.date}
                      onChange={(e) => setInvoiceDetails({ ...invoiceDetails, date: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Due Date</Label>
                    <Input type="date" value={invoiceDetails.dueDate}
                      onChange={(e) => setInvoiceDetails({ ...invoiceDetails, dueDate: e.target.value })} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-primary" /> Invoice Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="hidden sm:grid grid-cols-[1fr_90px_120px_120px_40px] gap-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-3 border-b">
                  <span>Description</span><span className="text-center">Qty</span><span className="text-right">Unit Price</span><span className="text-right">Amount</span><span></span>
                </div>
                <div className="divide-y">
                  {items.map((item, i) => (
                    <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_90px_120px_120px_40px] gap-3 items-center py-3">
                      <Input placeholder="Item description" value={item.description}
                        onChange={(e) => updateItem(i, 'description', e.target.value)} />
                      <Input type="number" min={1} value={item.quantity} className="text-center"
                        onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))} />
                      <Input type="number" min={0} value={item.unitPrice} className="text-right"
                        onChange={(e) => updateItem(i, 'unitPrice', Number(e.target.value))} />
                      <div className="text-right font-semibold text-sm px-2 py-2 bg-muted/50 rounded-md">
                        {fmt(item.quantity * item.unitPrice)}
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8"
                        onClick={() => removeItem(i)} disabled={items.length === 1}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={addItem} className="gap-1 mt-4">
                  <Plus className="h-3 w-3" /> Add Item
                </Button>
                <div className="mt-6 flex justify-end">
                  <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                    <div className="flex justify-between text-sm text-muted-foreground"><span>GST (18%)</span><span>{fmt(gst)}</span></div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold text-primary"><span>Total</span><span>{fmt(total)}</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Notes / Terms</CardTitle></CardHeader>
              <CardContent>
                <Textarea placeholder="Payment terms, bank details, or other notes..." value={notes}
                  onChange={(e) => setNotes(e.target.value)} rows={3} />
              </CardContent>
            </Card>

            <div className="flex justify-center no-print">
              <Button size="lg" className="gap-2" onClick={() => setActiveTab('preview')}>
                <Eye className="h-5 w-5" /> Preview Invoice
              </Button>
            </div>
          </TabsContent>

          {/* ─── PREVIEW TAB (Professional Invoice Layout) ─── */}
          <TabsContent value="preview">
            <div id="invoice-print-preview" className="bg-white text-black rounded-lg shadow-lg max-w-3xl mx-auto overflow-hidden" style={{ fontFamily: 'Arial, sans-serif' }}>
              {/* Top Header Bar */}
              <div className="bg-[hsl(220,60%,25%)] text-white px-8 py-6 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold tracking-wide">{supplierInfo.companyName || 'Company Name'}</h2>
                  <p className="text-sm opacity-80 mt-1">{supplierInfo.address || 'Address'}</p>
                  <p className="text-sm opacity-80">Phone: {supplierInfo.phone || '—'} | Email: {supplierInfo.email || '—'}</p>
                  {supplierInfo.gstNumber && <p className="text-sm opacity-80">GST: {supplierInfo.gstNumber}</p>}
                </div>
                <div className="text-right">
                  <h1 className="text-3xl font-extrabold tracking-widest">INVOICE</h1>
                </div>
              </div>

              {/* Invoice Meta & Buyer */}
              <div className="px-8 py-6 grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xs font-bold uppercase text-[hsl(220,60%,25%)] tracking-widest mb-2">Bill To</h3>
                  <p className="font-semibold text-sm">{buyerInfo.name || buyerInfo.company || '—'}</p>
                  {buyerInfo.company && buyerInfo.name && <p className="text-sm text-gray-600">{buyerInfo.company}</p>}
                  <p className="text-sm text-gray-600">{buyerInfo.address || '—'}</p>
                  <p className="text-sm text-gray-600">{buyerInfo.email || '—'}</p>
                  {buyerInfo.phone && <p className="text-sm text-gray-600">Ph: {buyerInfo.phone}</p>}
                </div>
                <div className="text-right space-y-1">
                  <div className="text-sm"><span className="text-gray-500">Invoice #: </span><span className="font-mono font-semibold">{invoiceDetails.invoiceNumber}</span></div>
                  <div className="text-sm"><span className="text-gray-500">Date: </span><span>{formatDate(invoiceDetails.date)}</span></div>
                  {invoiceDetails.dueDate && <div className="text-sm"><span className="text-gray-500">Due Date: </span><span>{formatDate(invoiceDetails.dueDate)}</span></div>}
                </div>
              </div>

              {/* Items Table */}
              <div className="px-8">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-[hsl(220,60%,25%)] text-white">
                      <th className="text-left py-3 px-4 font-semibold">#</th>
                      <th className="text-left py-3 px-4 font-semibold">Description</th>
                      <th className="text-center py-3 px-4 font-semibold">Qty</th>
                      <th className="text-right py-3 px-4 font-semibold">Unit Price</th>
                      <th className="text-right py-3 px-4 font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.filter(i => i.description).map((item, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-3 px-4 border-b border-gray-200">{i + 1}</td>
                        <td className="py-3 px-4 border-b border-gray-200">{item.description}</td>
                        <td className="py-3 px-4 border-b border-gray-200 text-center">{item.quantity}</td>
                        <td className="py-3 px-4 border-b border-gray-200 text-right">{fmt(item.unitPrice)}</td>
                        <td className="py-3 px-4 border-b border-gray-200 text-right font-medium">{fmt(item.quantity * item.unitPrice)}</td>
                      </tr>
                    ))}
                    {items.filter(i => i.description).length === 0 && (
                      <tr><td colSpan={5} className="py-6 text-center text-gray-400 italic">No items added yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="px-8 py-6 flex justify-end">
                <div className="w-64 space-y-1">
                  <div className="flex justify-between text-sm py-1"><span className="text-gray-500">Subtotal:</span><span>{fmt(subtotal)}</span></div>
                  <div className="flex justify-between text-sm py-1"><span className="text-gray-500">GST (18%):</span><span>{fmt(gst)}</span></div>
                  <div className="border-t-2 border-[hsl(220,60%,25%)] mt-2 pt-2 flex justify-between text-lg font-bold">
                    <span>Total:</span><span>{fmt(total)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {notes && (
                <div className="px-8 pb-4">
                  <div className="bg-blue-50 border border-blue-100 rounded p-4 text-sm">
                    <p className="font-semibold text-[hsl(220,60%,25%)] text-xs uppercase mb-1">Notes / Terms</p>
                    <p className="text-gray-700 whitespace-pre-line">{notes}</p>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="bg-[hsl(220,60%,25%)] text-white text-center py-4 mt-4">
                <p className="text-sm font-medium">Thank You For Your Business!</p>
                <p className="text-xs opacity-60 mt-1">Generated via Indimart Global</p>
              </div>
            </div>

            <div className="flex justify-center mt-6 no-print">
              <Button variant="outline" onClick={() => setActiveTab('edit')} className="gap-2">
                <Edit className="h-4 w-4" /> Back to Edit
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default GenerateInvoice;
