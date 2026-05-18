import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import { Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Category {
  id: string;
  name: string;
  icon: string | null;
  image_url: string | null;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name, icon, image_url")
        .order("name");
      setCategories(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const renderVisual = (cat: Category) => {
    if (cat.image_url) {
      return (
        <img
          src={cat.image_url}
          alt={cat.name}
          loading="lazy"
          className="h-16 w-16 rounded-lg object-cover"
        />
      );
    }
    const IconComp = (cat.icon && (Icons as any)[cat.icon]) || Package;
    return (
      <div className="bg-secondary/10 p-4 rounded-lg">
        <IconComp className="h-8 w-8 text-secondary" />
      </div>
    );
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Browse Agriculture Categories
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover quality agricultural produce and inputs from verified Indian farmers and suppliers
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-center text-muted-foreground">No categories available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link key={category.id} to={`/products?category=${encodeURIComponent(category.name)}`}>
                <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-secondary">
                  <CardContent className="flex items-center space-x-4 p-6">
                    {renderVisual(category)}
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">Verified suppliers</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/categories"
            className="text-secondary font-semibold hover:underline inline-flex items-center"
          >
            View All Categories
            <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Categories;
