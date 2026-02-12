import { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Printer, Send, ArrowLeft } from 'lucide-react';
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
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0 },
  ]);

  const [notes, setNotes] = useState('');

  // Load supplier profile
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
    window.print();
  };

  const handleSendEmail = async () => {
    if (!buyerInfo.email) {
      toast.error('Buyer email is required to send invoice');
      return;
    }
    if (items.every(i => !i.description)) {
      toast.error('Please add at least one item');
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-invoice', {
        body: {
          supplierInfo,
          invoiceDetails,
          buyerInfo,
          items,
          subtotal,
          gst,
          total,
          notes,
        },
      });

      if (error) throw error;
      toast.success(`Invoice sent to ${buyerInfo.email}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send invoice');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/supplier/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Generate Invoice</h1>
            <p className="text-sm text-muted-foreground">Create and send professional invoices</p>
          </div>
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

        {/* Action buttons */}
        <div className="flex gap-3 mb-6 no-print">
          <Button onClick={handlePrint} variant="outline" className="gap-2">
            <Printer className="h-4 w-4" /> Print / Download PDF
          </Button>
          <Button onClick={handleSendEmail} disabled={sending} className="gap-2">
            <Send className="h-4 w-4" /> {sending ? 'Sending...' : 'Send to Buyer'}
          </Button>
        </div>

        <div ref={printRef} id="invoice-print" className="space-y-6">
          {/* Invoice Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Supplier Info */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase">From (Supplier)</h3>
                  <div className="space-y-2">
                    <Input placeholder="Company Name" value={supplierInfo.companyName}
                      onChange={(e) => setSupplierInfo({ ...supplierInfo, companyName: e.target.value })} />
                    <Input placeholder="Address" value={supplierInfo.address}
                      onChange={(e) => setSupplierInfo({ ...supplierInfo, address: e.target.value })} />
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Phone" value={supplierInfo.phone}
                        onChange={(e) => setSupplierInfo({ ...supplierInfo, phone: e.target.value })} />
                      <Input placeholder="Email" value={supplierInfo.email}
                        onChange={(e) => setSupplierInfo({ ...supplierInfo, email: e.target.value })} />
                    </div>
                    <Input placeholder="GST Number" value={supplierInfo.gstNumber}
                      onChange={(e) => setSupplierInfo({ ...supplierInfo, gstNumber: e.target.value })} />
                  </div>
                </div>

                {/* Buyer Info */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase">To (Buyer)</h3>
                  <div className="space-y-2">
                    <Input placeholder="Buyer Name" value={buyerInfo.name}
                      onChange={(e) => setBuyerInfo({ ...buyerInfo, name: e.target.value })} />
                    <Input placeholder="Company" value={buyerInfo.company}
                      onChange={(e) => setBuyerInfo({ ...buyerInfo, company: e.target.value })} />
                    <Input placeholder="Address" value={buyerInfo.address}
                      onChange={(e) => setBuyerInfo({ ...buyerInfo, address: e.target.value })} />
                    <Input placeholder="Email *" type="email" value={buyerInfo.email}
                      onChange={(e) => setBuyerInfo({ ...buyerInfo, email: e.target.value })} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Invoice Number</Label>
                  <Input value={invoiceDetails.invoiceNumber}
                    onChange={(e) => setInvoiceDetails({ ...invoiceDetails, invoiceNumber: e.target.value })} />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={invoiceDetails.date}
                    onChange={(e) => setInvoiceDetails({ ...invoiceDetails, date: e.target.value })} />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input type="date" value={invoiceDetails.dueDate}
                    onChange={(e) => setInvoiceDetails({ ...invoiceDetails, dueDate: e.target.value })} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-[1fr_80px_100px_100px_40px] gap-2 text-xs font-semibold text-muted-foreground">
                <span>Description</span>
                <span>Qty</span>
                <span>Unit Price (₹)</span>
                <span>Amount (₹)</span>
                <span></span>
              </div>
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-[1fr_80px_100px_100px_40px] gap-2 items-center">
                  <Input placeholder="Item description" value={item.description}
                    onChange={(e) => updateItem(i, 'description', e.target.value)} />
                  <Input type="number" min={1} value={item.quantity}
                    onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))} />
                  <Input type="number" min={0} value={item.unitPrice}
                    onChange={(e) => updateItem(i, 'unitPrice', Number(e.target.value))} />
                  <div className="text-sm font-medium text-right pr-2">
                    ₹{(item.quantity * item.unitPrice).toLocaleString('en-IN')}
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 no-print"
                    onClick={() => removeItem(i)} disabled={items.length === 1}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addItem} className="gap-1 no-print">
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
          <Card>
            <CardContent className="pt-6">
              <Label>Notes / Terms</Label>
              <Textarea placeholder="Payment terms, bank details, or other notes..." value={notes}
                onChange={(e) => setNotes(e.target.value)} className="mt-2" rows={3} />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GenerateInvoice;
