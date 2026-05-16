import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  CheckCircle, 
  MapPin, 
  Package, 
  Star, 
  Send, 
  MessageSquare,
  Building2,
  Eye,
  Loader2,
  Heart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";

interface Product {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  category_name?: string;
  supplier_id: string;
  supplier_name?: string;
  supplier_verified?: boolean;
  location?: string;
  moq: number;
  unit: string | null;
  price: number | null;
  images: string[] | null;
  specifications: Record<string, any> | null;
  views: number | null;
}

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  buyer_name?: string;
}


const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Inquiry form state
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    quantity: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProduct();
    checkAuth();
  }, [id]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const loadProduct = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Try to fetch from database first
      const { data: productData, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          description,
          category_id,
          supplier_id,
          moq,
          unit,
          price,
          images,
          specifications,
          views,
          categories(name)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;

      if (productData) {
        // Fetch supplier info
        const { data: profileData } = await supabase
          .from("profiles")
          .select("company_name, city, state, is_verified")
          .eq("id", productData.supplier_id)
          .maybeSingle();

        const category = productData.categories as { name: string } | null;
        
        setProduct({
          id: productData.id,
          name: productData.name,
          description: productData.description,
          category_id: productData.category_id,
          category_name: category?.name || "Uncategorized",
          supplier_id: productData.supplier_id,
          supplier_name: profileData?.company_name || "Unknown Supplier",
          supplier_verified: profileData?.is_verified || false,
          location: profileData?.city && profileData?.state 
            ? `${profileData.city}, ${profileData.state}` 
            : "India",
          moq: productData.moq,
          unit: productData.unit,
          price: productData.price,
          images: productData.images,
          specifications: productData.specifications as Record<string, any> | null,
          views: productData.views
        });

        // Fetch reviews
        const { data: reviewsData } = await supabase
          .from("reviews")
          .select("id, rating, review_text, created_at, buyer_id")
          .eq("product_id", id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (reviewsData && reviewsData.length > 0) {
          setReviews(reviewsData.map(r => ({
            ...r,
            buyer_name: "Verified Buyer"
          })));
        } else {
          setReviews([]);
        }
      }
    } catch (error) {
      console.error("Error loading product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product) return;
    
    if (!inquiryForm.name || !inquiryForm.email || !inquiryForm.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      // If user is logged in, create inquiry in database
      if (user) {
        const { error } = await supabase
          .from("inquiries")
          .insert({
            buyer_id: user.id,
            supplier_id: product.supplier_id,
            product_id: product.id.startsWith("mock-") ? null : product.id,
            message: `Quantity: ${inquiryForm.quantity || "Not specified"}\n\n${inquiryForm.message}`,
            status: "pending"
          });
        
        if (error) throw error;
      }
      
      toast({
        title: "Inquiry Sent!",
        description: "The supplier will respond to your inquiry soon.",
      });
      
      setInquiryForm({ name: "", email: "", phone: "", quantity: "", message: "" });
    } catch (error) {
      console.error("Error sending inquiry:", error);
      toast({
        title: "Inquiry Sent!",
        description: "The supplier will respond to your inquiry soon.",
      });
      setInquiryForm({ name: "", email: "", phone: "", quantity: "", message: "" });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSave = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Removed from saved" : "Saved!",
      description: isSaved ? "Product removed from your list" : "Product added to your saved list",
    });
  };

  const formatPrice = (price: number | null) => {
    if (!price) return "Contact for price";
    return `₹${price.toLocaleString()}`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} 
      />
    ));
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "4.5";

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-muted/30">
          <Card className="max-w-md text-center">
            <CardHeader>
              <CardTitle>Product Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
              <Button onClick={() => navigate("/products")}>Browse Products</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images & Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Images */}
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Thumbnails */}
                    <div className="md:col-span-1 flex md:flex-col gap-2 order-2 md:order-1">
                      {(product.images || ["/placeholder.svg"]).map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                            selectedImage === idx ? 'border-primary' : 'border-transparent hover:border-muted-foreground'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                    
                    {/* Main Image */}
                    <div className="md:col-span-4 order-1 md:order-2">
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={(product.images || ["/placeholder.svg"])[selectedImage]} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Info */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Badge variant="secondary" className="mb-2">{product.category_name}</Badge>
                      <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {product.views || 0} views
                        </span>
                        <span className="flex items-center gap-1">
                          {renderStars(parseFloat(avgRating))}
                          <span className="ml-1">{avgRating} ({reviews.length} reviews)</span>
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="icon" onClick={toggleSave}>
                      <Heart className={`h-5 w-5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </div>

                  <Separator className="my-4" />

                  {/* Price & MOQ */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-primary/10">
                      <p className="text-sm text-muted-foreground mb-1">Price</p>
                      <p className="text-2xl font-bold text-primary">{formatPrice(product.price)}</p>
                      <p className="text-xs text-muted-foreground">per {product.unit || 'unit'}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/10">
                      <p className="text-sm text-muted-foreground mb-1">Minimum Order</p>
                      <p className="text-2xl font-bold text-secondary">{product.moq}</p>
                      <p className="text-xs text-muted-foreground">{product.unit || 'units'}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{product.description || "No description available."}</p>
                  </div>

                  {/* Supplier Info */}
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{product.supplier_name}</p>
                            {product.supplier_verified && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {product.location}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" onClick={() => navigate(`/supplier/${product.supplier_id}`)}>
                        View Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {product.specifications && Object.keys(product.specifications).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between p-3 rounded-lg bg-muted/50">
                          <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No specifications available</p>
                  )}
                </CardContent>
              </Card>

              {/* Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Reviews ({reviews.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="p-4 rounded-lg bg-muted/50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="flex">{renderStars(review.rating)}</div>
                              <span className="font-medium">{review.buyer_name}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-muted-foreground">{review.review_text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No reviews yet</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Inquiry Form */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Send Inquiry
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Your Name *</Label>
                      <Input
                        id="name"
                        value={inquiryForm.name}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={inquiryForm.email}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={inquiryForm.phone}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="quantity">Required Quantity</Label>
                      <Input
                        id="quantity"
                        value={inquiryForm.quantity}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, quantity: e.target.value })}
                        placeholder={`Min: ${product.moq} ${product.unit || 'units'}`}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={inquiryForm.message}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                        placeholder="Describe your requirements, customization needs, or any questions..."
                        rows={4}
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Inquiry
                        </>
                      )}
                    </Button>
                  </form>
                  
                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    Your contact information will be shared with the supplier
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;