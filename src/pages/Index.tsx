import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import TrustSection from "@/components/TrustSection";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Tradevithika — India's B2B Textiles & Apparel Export Marketplace"
        description="Connect with verified Indian textiles and apparel manufacturers. Source fabrics, garments, and home textiles with trust, transparency, and export support."
        path="/"
      />
      <Header />
      <main className="flex-1">
        <Hero />
        <Categories />
        <TrustSection />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
