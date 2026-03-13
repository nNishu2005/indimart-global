import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  tags: string[];
  published_at: string | null;
  created_at: string;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (!error && data) {
        setPost(data as BlogPostData);
      }
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/blog" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Blog
            </Link>
          </Button>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : !post ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Post Not Found</h2>
              <p className="text-muted-foreground mb-4">यह blog post उपलब्ध नहीं है।</p>
              <Button asChild>
                <Link to="/blog">Browse All Posts</Link>
              </Button>
            </div>
          ) : (
            <article>
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {post.title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                <Calendar className="h-4 w-4" />
                {format(new Date(post.published_at || post.created_at), "dd MMMM yyyy")}
              </div>
              {post.cover_image && (
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full rounded-lg mb-8 object-cover max-h-[400px]"
                />
              )}
              <div
                className="prose prose-lg max-w-none text-foreground
                  prose-headings:text-foreground prose-p:text-muted-foreground
                  prose-a:text-primary prose-strong:text-foreground"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </article>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
