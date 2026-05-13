
-- Blog posts: admin-only writes
DROP POLICY IF EXISTS "Authors can insert posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authors can update own posts" ON public.blog_posts;

CREATE POLICY "Admins can insert posts"
  ON public.blog_posts FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update posts"
  ON public.blog_posts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- user_roles: admin-only INSERT/UPDATE/DELETE (prevents privilege escalation)
CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- payments: remove broad UPDATE policy (admins retain full access via existing policy)
DROP POLICY IF EXISTS "Users can update their payments" ON public.payments;

-- rfqs: require authentication to view (protects target_price from public)
DROP POLICY IF EXISTS "Anyone can view open RFQs" ON public.rfqs;

CREATE POLICY "Authenticated users can view open RFQs"
  ON public.rfqs FOR SELECT TO authenticated
  USING (status = 'open'::text);

-- product-images storage: require supplier role and own folder
DROP POLICY IF EXISTS "Suppliers can upload product images" ON storage.objects;

CREATE POLICY "Suppliers can upload product images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND public.has_role(auth.uid(), 'supplier'::public.app_role)
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );
