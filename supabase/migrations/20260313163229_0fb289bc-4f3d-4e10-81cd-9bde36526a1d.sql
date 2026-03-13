CREATE POLICY "Admins can delete posts"
ON public.blog_posts
FOR DELETE
TO public
USING (has_role(auth.uid(), 'admin'::app_role));