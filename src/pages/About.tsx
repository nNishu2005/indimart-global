import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Globe, Shield, Users, Target } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connecting businesses across 150+ countries worldwide",
    },
    {
      icon: Shield,
      title: "Trust & Security",
      description: "Verified suppliers and secure transactions guaranteed",
    },
    {
      icon: Users,
      title: "Customer First",
      description: "Dedicated support to help your business succeed",
    },
    {
      icon: Target,
      title: "Quality Focus",
      description: "Only the best products from certified suppliers",
    },
  ];

  const stats = [
    { value: "50,000+", label: "Verified Suppliers" },
    { value: "150+", label: "Countries" },
    { value: "$2.5B+", label: "Trade Value" },
    { value: "1M+", label: "Products" },
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
                About Tradevithika
              </h1>
              <p className="text-lg text-muted-foreground">
                Your trusted partner in global B2B trade
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-center">Our Mission</h2>
              <p className="text-lg text-muted-foreground text-center mb-8">
                At Indimart Global, we're revolutionizing international trade by creating 
                a transparent, efficient, and secure marketplace that connects businesses 
                worldwide. Our mission is to empower businesses of all sizes to access 
                global markets and grow beyond borders.
              </p>
              <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10">
                <p className="text-lg leading-relaxed">
                  Founded in 2020, Indimart Global has grown to become one of the leading 
                  B2B marketplaces, facilitating billions in trade value annually. We believe 
                  in making global trade accessible to everyone, from small businesses to 
                  large enterprises, by providing the tools, connections, and support needed 
                  to succeed in international markets.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <value.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-xl mb-3">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {value.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Our Team</h2>
              <p className="text-lg text-muted-foreground mb-8">
                We're a diverse team of trade experts, technology professionals, and 
                customer success specialists dedicated to making global trade seamless 
                for businesses worldwide. Our team operates across multiple time zones 
                to provide 24/7 support to our global community.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Card className="p-8 md:p-12 text-center bg-gradient-to-br from-primary/10 to-secondary/10">
              <h2 className="text-3xl font-bold mb-4">Join Our Growing Community</h2>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                Whether you're looking to source products or expand your market reach, 
                Indimart Global is here to support your journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link to="/products">Start Sourcing</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/register">Become a Supplier</Link>
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

export default About;
