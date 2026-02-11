
-- Orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL DEFAULT 'ORD-' || substr(gen_random_uuid()::text, 1, 8),
  buyer_id UUID NOT NULL,
  supplier_id UUID NOT NULL,
  product_id UUID REFERENCES public.products(id),
  rfq_id UUID REFERENCES public.rfqs(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  delivery_status TEXT DEFAULT 'pending',
  expected_delivery_date TIMESTAMP WITH TIME ZONE,
  actual_delivery_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Suppliers can view their orders" ON public.orders FOR SELECT USING (supplier_id = auth.uid());
CREATE POLICY "Buyers can view their orders" ON public.orders FOR SELECT USING (buyer_id = auth.uid());
CREATE POLICY "Buyers can create orders" ON public.orders FOR INSERT WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "Suppliers can update their orders" ON public.orders FOR UPDATE USING (supplier_id = auth.uid());
CREATE POLICY "Buyers can update their orders" ON public.orders FOR UPDATE USING (buyer_id = auth.uid());
CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id),
  buyer_id UUID NOT NULL,
  supplier_id UUID NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Suppliers can view their payments" ON public.payments FOR SELECT USING (supplier_id = auth.uid());
CREATE POLICY "Buyers can view their payments" ON public.payments FOR SELECT USING (buyer_id = auth.uid());
CREATE POLICY "Buyers can create payments" ON public.payments FOR INSERT WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "Users can update their payments" ON public.payments FOR UPDATE USING (buyer_id = auth.uid() OR supplier_id = auth.uid());
CREATE POLICY "Admins can manage all payments" ON public.payments FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
