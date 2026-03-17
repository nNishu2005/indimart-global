
# Security Fix Plan: Restrict Profile PII and Remove Public Supplier Roles Policy

## Overview
This plan addresses two error-level security vulnerabilities:
1. **Customer Personal Information Exposed** - The `profiles` table currently exposes sensitive fields (email, phone, PAN, GST) to all authenticated users viewing supplier profiles
2. **User Identity Information Leaked** - The `user_roles` table has a policy "Anyone can view supplier roles" that exposes user IDs and role associations publicly

## Current Security Issues

### Issue 1: Profiles Table PII Exposure
- Current RLS policy "Authenticated users can view verified supplier profiles" allows any authenticated user to access ALL columns including `email`, `phone`, `pan_number`, and `gst_number`
- The `SupplierProfile.tsx` page explicitly displays email, phone, and GST number in the "Contact Info" tab
- The `SupplierList.tsx` uses `select('*')` fetching all sensitive fields even though only a few are displayed

### Issue 2: User Roles Public Exposure
- Current policy "Anyone can view supplier roles" allows unauthenticated access to `user_roles` table
- This leaks user IDs and their associated roles, which is unnecessary exposure

## Solution Approach

### Database Changes (Migration)

**1. Replace the profiles viewing policy with a more restrictive one:**
- Drop the current "Authenticated users can view verified supplier profiles" policy
- Create a new policy that only allows viewing non-sensitive columns for verified suppliers
- Use a database view or function to expose only safe fields

**2. Restrict user_roles access:**
- Drop the "Anyone can view supplier roles" policy
- Create a new policy requiring authentication to view supplier roles

### Code Changes

**1. Update `src/pages/buyer/SupplierList.tsx`:**
- Change `select('*')` to select only non-sensitive fields: `id, company_name, city, state, country, company_description, is_verified, avatar_url`

**2. Update `src/pages/buyer/SupplierProfile.tsx`:**
- Change `select('*')` to select only non-sensitive fields
- Remove or hide the Contact Info tab that displays email, phone, and GST number
- Replace with a "Request Contact Info" button that uses the messaging system

**3. Update `src/pages/Products.tsx`:**
- Already correctly selects only `id, company_name, city, state` - no changes needed

**4. Update `src/pages/ProductDetail.tsx`:**
- Already correctly selects only `company_name, city, state, is_verified` - no changes needed

## Technical Details

### Migration SQL

```sql
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

-- Create a database view for safe profile data
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

-- Grant access to the view
GRANT SELECT ON public.supplier_profiles_public TO authenticated;
GRANT SELECT ON public.supplier_profiles_public TO anon;
```

### File Changes Summary

| File | Change |
|------|--------|
| `src/pages/buyer/SupplierList.tsx` | Replace `select('*')` with explicit safe fields |
| `src/pages/buyer/SupplierProfile.tsx` | Replace `select('*')` with safe fields, modify Contact tab to hide PII |

## Outcome

After implementation:
- Sensitive fields (email, phone, PAN, GST) will only be accessible by the profile owner or admins
- User roles will only be visible to authenticated users
- Buyer-facing pages will show only business information (company name, location, verification status)
- Contact between buyers and suppliers will be through the existing messaging system
