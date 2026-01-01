import { Badge, CheckCircle, Shield, TrendingUp, Clock } from "lucide-react";

const trustFeatures = [
  {
    icon: Shield,
    title: "Verified Suppliers",
    description: "Every supplier is verified with business documents and certifications",
  },
  {
    icon: CheckCircle,
    title: "Quality Assurance",
    description: "Products meet international quality standards and export requirements",
  },
  {
    icon: TrendingUp,
    title: "Secure Payments",
    description: "Safe and transparent payment process with buyer protection",
  },
  {
    icon: Clock,
    title: "Fast Response",
    description: "Connect with suppliers within 24 hours and get quick quotes",
  },
];

const TrustSection = () => {
  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-secondary/10 rounded-full px-4 py-2 mb-4">
            <Badge className="h-5 w-5 text-secondary" />
            <span className="text-sm font-semibold text-secondary">Trusted by Global Buyers</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Why Choose Indimart Global?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We ensure safe, reliable, and efficient trade connections between Indian manufacturers and international buyers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {trustFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-card rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="bg-gradient-trust rounded-full w-14 h-14 flex items-center justify-center mb-4 shadow-trust">
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 pt-8 border-t border-border">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">100%</div>
            <div className="text-sm text-muted-foreground">Verified Suppliers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">24/7</div>
            <div className="text-sm text-muted-foreground">Customer Support</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">ISO</div>
            <div className="text-sm text-muted-foreground">Quality Certified</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">SSL</div>
            <div className="text-sm text-muted-foreground">Secure Platform</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
