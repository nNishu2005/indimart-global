import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, MessageSquare, ShoppingCart, TrendingUp } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: "Search & Discover",
      description: "Browse our extensive catalog of products or search for specific items. Filter by category, price, location, and more.",
      color: "text-blue-500",
    },
    {
      icon: MessageSquare,
      title: "Connect with Suppliers",
      description: "Send inquiries directly to verified suppliers. Chat, negotiate prices, and discuss your requirements in detail.",
      color: "text-green-500",
    },
    {
      icon: ShoppingCart,
      title: "Place Your Order",
      description: "Once you've found the right supplier and agreed on terms, place your order securely through our platform.",
      color: "text-orange-500",
    },
    {
      icon: TrendingUp,
      title: "Grow Your Business",
      description: "Receive quality products, build lasting supplier relationships, and scale your business with confidence.",
      color: "text-purple-500",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                How It Works
              </h1>
              <p className="text-lg text-muted-foreground">
                Connect with verified suppliers in 4 simple steps
              </p>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <step.icon className={`h-8 w-8 ${step.color}`} />
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-primary mb-2">
                    Step {index + 1}
                  </div>
                  <h3 className="font-semibold text-xl mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* For Suppliers Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">For Suppliers</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="font-semibold text-xl mb-3">1. Register Your Business</h3>
                  <p className="text-muted-foreground">
                    Create a supplier account and complete verification process with your business documents.
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="font-semibold text-xl mb-3">2. List Your Products</h3>
                  <p className="text-muted-foreground">
                    Upload product catalogs with detailed descriptions, pricing, and high-quality images.
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="font-semibold text-xl mb-3">3. Receive Inquiries</h3>
                  <p className="text-muted-foreground">
                    Get connected with buyers worldwide looking for your products. Respond to inquiries promptly.
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="font-semibold text-xl mb-3">4. Close Deals</h3>
                  <p className="text-muted-foreground">
                    Negotiate terms, finalize orders, and grow your business with a global customer base.
                  </p>
                </Card>
              </div>
              <div className="text-center mt-8">
                <Button size="lg" asChild>
                  <Link to="/register">Join as Supplier</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Card className="p-8 md:p-12 text-center bg-gradient-to-br from-primary/10 to-secondary/10">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join thousands of businesses already trading on Indimart Global
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link to="/products">Browse Products</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/register">Register as Supplier</Link>
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;
