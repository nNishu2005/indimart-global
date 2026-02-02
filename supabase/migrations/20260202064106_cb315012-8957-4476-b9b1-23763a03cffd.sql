-- Fix 1: Remove public access to user_roles for suppliers
DROP POLICY IF EXISTS "Anyone can view supplier roles" ON public.user_roles;

-- Create a policy that requires authentication to view supplier roles
CREATE POLICY "Authenticated users can view supplier roles"
ON public.user_roles
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND role = 'supplier'::app_role
);

-- Fix 2: Restrict profiles viewing to only non-sensitive fields
-- Drop the current policy that exposes all columns
DROP POLICY IF EXISTS "Authenticated users can view verified supplier profiles" ON public.profiles;

-- Create a database view for safe profile data (excludes PII: email, phone, pan_number, gst_number, full_name, address, pincode)
CREATE OR REPLACE VIEW public.supplier_profiles_public AS
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