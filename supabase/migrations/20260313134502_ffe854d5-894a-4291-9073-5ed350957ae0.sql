
-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can view published blog posts
CREATE POLICY "Anyone can view published posts"
ON public.blog_posts FOR SELECT
USING (is_published = true);

-- Admins can manage all posts
CREATE POLICY "Admins can manage all posts"
ON public.blog_posts FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Authors can view their own posts
CREATE POLICY "Authors can view own posts"
ON public.blog_posts FOR SELECT
USING (author_id = auth.uid());

-- Authors can insert posts
CREATE POLICY "Authors can insert posts"
ON public.blog_posts FOR INSERT
WITH CHECK (author_id = auth.uid());

-- Authors can update own posts
CREATE POLICY "Authors can update own posts"
ON public.blog_posts FOR UPDATE
USING (author_id = auth.uid());

-- Updated at trigger
CREATE TRIGGER handle_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
