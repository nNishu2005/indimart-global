import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Wheat, Sprout, Carrot, Apple, Flame, Milk, Droplet, Coffee, Leaf, FlaskConical, Tractor, Bird } from "lucide-react";

const categories = [
  { name: "Grains & Cereals", icon: Wheat, color: "text-amber-700", bgColor: "bg-amber-50" },
  { name: "Pulses & Lentils", icon: Sprout, color: "text-yellow-700", bgColor: "bg-yellow-50" },
  { name: "Fresh Vegetables", icon: Carrot, color: "text-orange-600", bgColor: "bg-orange-50" },
  { name: "Fresh Fruits", icon: Apple, color: "text-red-600", bgColor: "bg-red-50" },
  { name: "Spices & Herbs", icon: Flame, color: "text-rose-700", bgColor: "bg-rose-50" },
  { name: "Dairy & Milk Products", icon: Milk, color: "text-blue-600", bgColor: "bg-blue-50" },
  { name: "Oilseeds & Edible Oils", icon: Droplet, color: "text-yellow-600", bgColor: "bg-yellow-50" },
  { name: "Tea, Coffee & Beverages", icon: Coffee, color: "text-amber-800", bgColor: "bg-amber-50" },
  { name: "Seeds & Saplings", icon: Leaf, color: "text-green-600", bgColor: "bg-green-50" },
  { name: "Fertilizers & Pesticides", icon: FlaskConical, color: "text-emerald-700", bgColor: "bg-emerald-50" },
  { name: "Farm Machinery & Tools", icon: Tractor, color: "text-slate-700", bgColor: "bg-slate-50" },
  { name: "Livestock & Poultry", icon: Bird, color: "text-stone-700", bgColor: "bg-stone-50" },
];

const Categories = () => {
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link key={category.name} to={`/products?category=${encodeURIComponent(category.name)}`}>
              <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-secondary">
                <CardContent className="flex items-center space-x-4 p-6">
                  <div className={`${category.bgColor} p-4 rounded-lg`}>
                    <category.icon className={`h-8 w-8 ${category.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">Verified suppliers</p>
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
