import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Users, Globe2 } from "lucide-react";
import heroImage from "@/assets/hero-trade.jpg";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      <div className="absolute inset-0 bg-black/40" />
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      <div className="container relative mx-auto px-4 py-24 md:py-32">
        <div className="max-w-3xl">
          {/* Trust Badge */}
          <div className="inline-flex items-center space-x-2 rounded-full bg-secondary/20 px-4 py-2 backdrop-blur-sm mb-6">
            <TrendingUp className="h-4 w-4 text-secondary" />
            <span className="text-sm font-medium text-white">India's Fastest Growing Export Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            India's Export Powerhouse
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
            Connect with verified Indian manufacturers and reach global buyers. 
            Build trusted trade relationships that scale your business.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button 
              size="lg" 
              className="bg-secondary hover:bg-secondary/90 text-white shadow-lg hover:shadow-xl transition-all"
              asChild
            >
              <Link to="/register">
                Join as Supplier
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20"
              asChild
            >
              <Link to="/products">Find Products</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Users className="h-10 w-10 text-secondary" />
              <div>
                <div className="text-2xl font-bold text-white">5,000+</div>
                <div className="text-sm text-white/70">Verified Suppliers</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Globe2 className="h-10 w-10 text-secondary" />
              <div>
                <div className="text-2xl font-bold text-white">120+</div>
                <div className="text-sm text-white/70">Countries</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-10 w-10 text-secondary" />
              <div>
                <div className="text-2xl font-bold text-white">$50M+</div>
                <div className="text-sm text-white/70">Trade Value</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
