-- Fix 1: Role Self-Assignment Vulnerability
-- Drop the vulnerable policy that allows users to insert their own roles
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;

-- Drop the policy that allows users to update their own role (also a vulnerability)
DROP POLICY IF EXISTS "Users can update their own role" ON public.user_roles;

-- Create a function to assign roles from user metadata during signup
CREATE OR REPLACE FUNCTION public.assign_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  requested_role text;
BEGIN
  -- Get the role from user metadata (set during signup)
  requested_role := NEW.raw_user_meta_data->>'role';
  
  -- Only allow 'buyer' or 'supplier' roles, default to 'buyer'
  IF requested_role = 'supplier' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'supplier'::app_role);
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'buyer'::app_role);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-assign role on user creation
DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_user_role();

-- Fix 2: Public PII Exposure
-- Drop the vulnerable policy that exposes PII to unauthenticated users
DROP POLICY IF EXISTS "Anyone can view supplier profiles" ON public.profiles;

-- Create a new policy requiring authentication to view verified supplier profiles
CREATE POLICY "Authenticated users can view verified supplier profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = profiles.id
      AND user_roles.role = 'supplier'::app_role
      AND profiles.is_verified = true
  )
);