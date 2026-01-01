import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Categories from "@/components/Categories";
import { Card } from "@/components/ui/card";

const CategoriesPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Explore Product Categories
              </h1>
              <p className="text-lg text-muted-foreground">
                Browse through our extensive range of products across multiple categories. 
                Find verified suppliers for all your business needs.
              </p>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <Categories />

        {/* Additional Info */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6">
                <h3 className="font-semibold text-xl mb-3">Quality Assured</h3>
                <p className="text-muted-foreground">
                  All suppliers are verified and products meet international quality standards.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold text-xl mb-3">Wide Selection</h3>
                <p className="text-muted-foreground">
                  Access thousands of products across diverse categories from global suppliers.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold text-xl mb-3">Competitive Pricing</h3>
                <p className="text-muted-foreground">
                  Get the best deals with direct access to manufacturers and wholesalers.
                </p>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CategoriesPage;
