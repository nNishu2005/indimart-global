import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Shirt, Scissors, Sparkles, Layers, User, Users, Baby, Home, Crown, Spool } from "lucide-react";

const categories = [
  { name: "Cotton Fabrics", icon: Layers, color: "text-blue-600", bgColor: "bg-blue-50" },
  { name: "Silk Fabrics", icon: Sparkles, color: "text-pink-600", bgColor: "bg-pink-50" },
  { name: "Synthetic Fabrics", icon: Scissors, color: "text-purple-600", bgColor: "bg-purple-50" },
  { name: "Men's Apparel", icon: User, color: "text-indigo-600", bgColor: "bg-indigo-50" },
  { name: "Women's Apparel", icon: Users, color: "text-rose-600", bgColor: "bg-rose-50" },
  { name: "Kids Apparel", icon: Baby, color: "text-amber-600", bgColor: "bg-amber-50" },
  { name: "Home Textiles", icon: Home, color: "text-emerald-600", bgColor: "bg-emerald-50" },
  { name: "Ethnic Wear", icon: Crown, color: "text-orange-600", bgColor: "bg-orange-50" },
  { name: "Yarn & Threads", icon: Shirt, color: "text-teal-600", bgColor: "bg-teal-50" },
];

const Categories = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Browse by Category
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover quality products from verified Indian manufacturers across various categories
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link key={category.name} to={`/products?category=${category.name}`}>
              <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-secondary">
                <CardContent className="flex items-center space-x-4 p-6">
                  <div className={`${category.bgColor} p-4 rounded-lg`}>
                    <category.icon className={`h-8 w-8 ${category.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{category.count}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/categories"
            className="text-secondary font-semibold hover:underline inline-flex items-center"
          >
            View All Categories
            <svg
              className="ml-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Categories;
