-- Fix 1: Add UPDATE policy for messages so users can mark messages as read
CREATE POLICY "Users can update their received messages"
ON public.messages
FOR UPDATE
USING (receiver_id = auth.uid())
WITH CHECK (receiver_id = auth.uid());

-- Fix 2: Add admin policies for complete coverage on sensitive tables

-- Admin access to messages
CREATE POLICY "Admins can view all messages"
ON public.messages
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin access to inquiries  
CREATE POLICY "Admins can view all inquiries"
ON public.inquiries
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 3: Ensure profiles table has admin access for verification workflows
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update profiles for verification"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));