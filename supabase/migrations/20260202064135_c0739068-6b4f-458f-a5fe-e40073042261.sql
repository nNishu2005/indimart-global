-- Fix the view to use security_invoker=on to prevent security definer issue
DROP VIEW IF EXISTS public.supplier_profiles_public;

CREATE VIEW public.supplier_profiles_public
WITH (security_invoker=on) AS
SELECT 
  id,
  company_name,
  company_description,
  avatar_url,
  city,
  state,
  country,
  is_verified,
  created_at
FROM public.profiles
WHERE is_verified = true
AND EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_roles.user_id = profiles.id
  AND user_roles.role = 'supplier'::app_role
);

-- Grant access to the view for authenticated and anonymous users
GRANT SELECT ON public.supplier_profiles_public TO authenticated;
GRANT SELECT ON public.supplier_profiles_public TO anon;