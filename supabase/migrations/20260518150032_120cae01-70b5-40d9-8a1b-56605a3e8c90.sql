CREATE OR REPLACE FUNCTION public.prevent_buyer_financial_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() = OLD.buyer_id AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    IF NEW.total_amount IS DISTINCT FROM OLD.total_amount
       OR NEW.unit_price IS DISTINCT FROM OLD.unit_price
       OR NEW.quantity IS DISTINCT FROM OLD.quantity
       OR NEW.supplier_id IS DISTINCT FROM OLD.supplier_id
       OR NEW.buyer_id IS DISTINCT FROM OLD.buyer_id
       OR NEW.product_id IS DISTINCT FROM OLD.product_id THEN
      RAISE EXCEPTION 'Buyers cannot modify financial or party fields on an order';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_buyer_financial_changes ON public.orders;
CREATE TRIGGER trg_prevent_buyer_financial_changes
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_buyer_financial_changes();

DROP POLICY IF EXISTS "RFQ owners can view responses" ON public.rfq_responses;
CREATE POLICY "RFQ owners can view responses"
ON public.rfq_responses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.rfqs
    WHERE rfqs.id = rfq_responses.rfq_id
      AND rfqs.buyer_id = auth.uid()
  )
  AND NOT public.has_role(auth.uid(), 'supplier'::app_role)
);

DROP POLICY IF EXISTS "Authenticated users can view open RFQs" ON public.rfqs;
CREATE POLICY "Buyers and admins can view open RFQs"
ON public.rfqs
FOR SELECT
TO authenticated
USING (
  status = 'open'
  AND NOT public.has_role(auth.uid(), 'supplier'::app_role)
);

CREATE OR REPLACE VIEW public.rfqs_open_public AS
SELECT
  id,
  buyer_id,
  category_id,
  title,
  description,
  quantity,
  unit,
  location,
  deadline,
  status,
  created_at
FROM public.rfqs
WHERE status = 'open';

ALTER VIEW public.rfqs_open_public OWNER TO postgres;
GRANT SELECT ON public.rfqs_open_public TO authenticated;

DROP POLICY IF EXISTS "Suppliers can update their product images" ON storage.objects;
CREATE POLICY "Suppliers can update their product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Suppliers can delete their product images" ON storage.objects;
CREATE POLICY "Suppliers can delete their product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Authenticated users can view supplier roles" ON public.user_roles;

CREATE OR REPLACE FUNCTION public.is_supplier(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'supplier'::app_role
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_supplier(uuid) TO authenticated, anon;

ALTER VIEW public.supplier_profiles_public SET (security_invoker = off);
ALTER VIEW public.supplier_profiles_public OWNER TO postgres;