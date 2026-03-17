
-- Update RLS policies to use 'authenticated' role instead of 'public' for sensitive tables
-- This prevents anonymous users from accessing data

-- disputes
DROP POLICY IF EXISTS "Users can create disputes" ON public.disputes;
CREATE POLICY "Users can create disputes" ON public.disputes FOR INSERT TO authenticated WITH CHECK (complainant_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their disputes" ON public.disputes;
CREATE POLICY "Users can view their disputes" ON public.disputes FOR SELECT TO authenticated USING ((complainant_id = auth.uid()) OR (respondent_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all disputes" ON public.disputes;
CREATE POLICY "Admins can manage all disputes" ON public.disputes FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- custom_quotes
DROP POLICY IF EXISTS "Authenticated users can create quotes" ON public.custom_quotes;
CREATE POLICY "Authenticated users can create quotes" ON public.custom_quotes FOR INSERT TO authenticated WITH CHECK (requester_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their quotes" ON public.custom_quotes;
CREATE POLICY "Users can view their quotes" ON public.custom_quotes FOR SELECT TO authenticated USING ((requester_id = auth.uid()) OR (responder_id = auth.uid()));

DROP POLICY IF EXISTS "Participants can update quotes" ON public.custom_quotes;
CREATE POLICY "Participants can update quotes" ON public.custom_quotes FOR UPDATE TO authenticated USING ((requester_id = auth.uid()) OR (responder_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all quotes" ON public.custom_quotes;
CREATE POLICY "Admins can manage all quotes" ON public.custom_quotes FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- inquiries
DROP POLICY IF EXISTS "Buyers can create inquiries" ON public.inquiries;
CREATE POLICY "Buyers can create inquiries" ON public.inquiries FOR INSERT TO authenticated WITH CHECK (buyer_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their inquiries" ON public.inquiries;
CREATE POLICY "Users can view their inquiries" ON public.inquiries FOR SELECT TO authenticated USING ((buyer_id = auth.uid()) OR (supplier_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their inquiries" ON public.inquiries;
CREATE POLICY "Users can update their inquiries" ON public.inquiries FOR UPDATE TO authenticated USING ((buyer_id = auth.uid()) OR (supplier_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can view all inquiries" ON public.inquiries;
CREATE POLICY "Admins can view all inquiries" ON public.inquiries FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- messages
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT TO authenticated USING ((sender_id = auth.uid()) OR (receiver_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their received messages" ON public.messages;
CREATE POLICY "Users can update their received messages" ON public.messages FOR UPDATE TO authenticated USING (receiver_id = auth.uid()) WITH CHECK (receiver_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all messages" ON public.messages;
CREATE POLICY "Admins can view all messages" ON public.messages FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- payments
DROP POLICY IF EXISTS "Buyers can create payments" ON public.payments;
CREATE POLICY "Buyers can create payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (buyer_id = auth.uid());

DROP POLICY IF EXISTS "Buyers can view their payments" ON public.payments;
CREATE POLICY "Buyers can view their payments" ON public.payments FOR SELECT TO authenticated USING (buyer_id = auth.uid());

DROP POLICY IF EXISTS "Suppliers can view their payments" ON public.payments;
CREATE POLICY "Suppliers can view their payments" ON public.payments FOR SELECT TO authenticated USING (supplier_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their payments" ON public.payments;
CREATE POLICY "Users can update their payments" ON public.payments FOR UPDATE TO authenticated USING ((buyer_id = auth.uid()) OR (supplier_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all payments" ON public.payments;
CREATE POLICY "Admins can manage all payments" ON public.payments FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- orders
DROP POLICY IF EXISTS "Buyers can create orders" ON public.orders;
CREATE POLICY "Buyers can create orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (buyer_id = auth.uid());

DROP POLICY IF EXISTS "Buyers can view their orders" ON public.orders;
CREATE POLICY "Buyers can view their orders" ON public.orders FOR SELECT TO authenticated USING (buyer_id = auth.uid());

DROP POLICY IF EXISTS "Buyers can update their orders" ON public.orders;
CREATE POLICY "Buyers can update their orders" ON public.orders FOR UPDATE TO authenticated USING (buyer_id = auth.uid());

DROP POLICY IF EXISTS "Suppliers can view their orders" ON public.orders;
CREATE POLICY "Suppliers can view their orders" ON public.orders FOR SELECT TO authenticated USING (supplier_id = auth.uid());

DROP POLICY IF EXISTS "Suppliers can update their orders" ON public.orders;
CREATE POLICY "Suppliers can update their orders" ON public.orders FOR UPDATE TO authenticated USING (supplier_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- saved_products
DROP POLICY IF EXISTS "Users can manage their saved products" ON public.saved_products;
CREATE POLICY "Users can manage their saved products" ON public.saved_products FOR ALL TO authenticated USING (user_id = auth.uid());

-- saved_suppliers
DROP POLICY IF EXISTS "Buyers can manage saved suppliers" ON public.saved_suppliers;
CREATE POLICY "Buyers can manage saved suppliers" ON public.saved_suppliers FOR ALL TO authenticated USING (buyer_id = auth.uid());

-- documents
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.documents;
CREATE POLICY "Users can insert their own documents" ON public.documents FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
CREATE POLICY "Users can view their own documents" ON public.documents FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;
CREATE POLICY "Users can delete their own documents" ON public.documents FOR DELETE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all documents" ON public.documents;
CREATE POLICY "Admins can view all documents" ON public.documents FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update documents" ON public.documents;
CREATE POLICY "Admins can update documents" ON public.documents FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- profiles
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update profiles for verification" ON public.profiles;
CREATE POLICY "Admins can update profiles for verification" ON public.profiles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Authenticated users can view supplier roles" ON public.user_roles;
CREATE POLICY "Authenticated users can view supplier roles" ON public.user_roles FOR SELECT TO authenticated USING ((auth.uid() IS NOT NULL) AND (role = 'supplier'::app_role));

-- products (keep public SELECT for approved products, restrict others)
DROP POLICY IF EXISTS "Suppliers can create products" ON public.products;
CREATE POLICY "Suppliers can create products" ON public.products FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'supplier'::app_role) AND (supplier_id = auth.uid()));

DROP POLICY IF EXISTS "Suppliers can update their products" ON public.products;
CREATE POLICY "Suppliers can update their products" ON public.products FOR UPDATE TO authenticated USING (supplier_id = auth.uid());

DROP POLICY IF EXISTS "Suppliers can view their own products" ON public.products;
CREATE POLICY "Suppliers can view their own products" ON public.products FOR SELECT TO authenticated USING (supplier_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;
CREATE POLICY "Admins can manage all products" ON public.products FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- rfqs (keep public SELECT for open rfqs)
DROP POLICY IF EXISTS "Buyers can create RFQs" ON public.rfqs;
CREATE POLICY "Buyers can create RFQs" ON public.rfqs FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'buyer'::app_role) AND (buyer_id = auth.uid()));

DROP POLICY IF EXISTS "Buyers can update their RFQs" ON public.rfqs;
CREATE POLICY "Buyers can update their RFQs" ON public.rfqs FOR UPDATE TO authenticated USING (buyer_id = auth.uid());

DROP POLICY IF EXISTS "Buyers can view their RFQs" ON public.rfqs;
CREATE POLICY "Buyers can view their RFQs" ON public.rfqs FOR SELECT TO authenticated USING (buyer_id = auth.uid());

-- rfq_responses
DROP POLICY IF EXISTS "Suppliers can create responses" ON public.rfq_responses;
CREATE POLICY "Suppliers can create responses" ON public.rfq_responses FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'supplier'::app_role) AND (supplier_id = auth.uid()));

DROP POLICY IF EXISTS "Suppliers can view their responses" ON public.rfq_responses;
CREATE POLICY "Suppliers can view their responses" ON public.rfq_responses FOR SELECT TO authenticated USING (supplier_id = auth.uid());

DROP POLICY IF EXISTS "RFQ owners can view responses" ON public.rfq_responses;
CREATE POLICY "RFQ owners can view responses" ON public.rfq_responses FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM rfqs WHERE rfqs.id = rfq_responses.rfq_id AND rfqs.buyer_id = auth.uid()));

-- reviews (keep public SELECT)
DROP POLICY IF EXISTS "Buyers can create reviews" ON public.reviews;
CREATE POLICY "Buyers can create reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'buyer'::app_role) AND (buyer_id = auth.uid()));

-- blog_posts (keep public SELECT for published)
DROP POLICY IF EXISTS "Authors can insert posts" ON public.blog_posts;
CREATE POLICY "Authors can insert posts" ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can update own posts" ON public.blog_posts;
CREATE POLICY "Authors can update own posts" ON public.blog_posts FOR UPDATE TO authenticated USING (author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can view own posts" ON public.blog_posts;
CREATE POLICY "Authors can view own posts" ON public.blog_posts FOR SELECT TO authenticated USING (author_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all posts" ON public.blog_posts;
CREATE POLICY "Admins can manage all posts" ON public.blog_posts FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete posts" ON public.blog_posts;
CREATE POLICY "Admins can delete posts" ON public.blog_posts FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
