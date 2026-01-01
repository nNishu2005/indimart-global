import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { 
  Building2, MapPin, CheckCircle, Package, MessageSquare, 
  Phone, Mail, Globe, Star, ArrowLeft, FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SupplierProfile {
  id: string;
  company_name: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  address: string | null;
  company_description: string | null;
  is_verified: boolean | null;
  avatar_url: string | null;
  gst_number: string | null;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  moq: number;
  unit: string | null;
  images: string[] | null;
}

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  buyer_id: string;
}

const SupplierProfilePage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [supplier, setSupplier] = useState<SupplierProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    
    setLoading(true);

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    // Load supplier profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    setSupplier(profile);

    // Load supplier's products
    const { data: prods } = await supabase
      .from('products')
      .select('*')
      .eq('supplier_id', id)
      .eq('is_approved', true)
      .eq('is_active', true);

    setProducts(prods || []);

    // Load supplier reviews
    const { data: revs } = await supabase
      .from('reviews')
      .select('*')
      .eq('supplier_id', id)
      .order('created_at', { ascending: false });

    setReviews(revs || []);

    setLoading(false);
  };

  const handleContact = async () => {
    if (!currentUser) {
      toast({
        title: 'Login Required',
        description: 'Please login to contact this supplier',
        variant: 'destructive',
      });
      return;
    }

    // Navigate to messages with this supplier
    window.location.href = `/messages?supplier=${id}`;
  };

  const handleSaveSupplier = async () => {
    if (!currentUser || !id) {
      toast({
        title: 'Login Required',
        description: 'Please login to save suppliers',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase
      .from('saved_suppliers')
      .insert({ buyer_id: currentUser.id, supplier_id: id });

    if (error) {
      if (error.code === '23505') {
        toast({ title: 'Already Saved', description: 'This supplier is already in your saved list' });
      } else {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    } else {
      toast({ title: 'Saved!', description: 'Supplier added to your saved list' });
    }
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Supplier Not Found</h2>
            <p className="text-muted-foreground mb-4">This supplier profile doesn't exist</p>
            <Button asChild>
              <Link to="/suppliers">Browse Suppliers</Link>
            </Button>
          </div>
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
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/suppliers">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Suppliers
            </Link>
          </Button>

          {/* Supplier Header */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {supplier.avatar_url ? (
                    <img src={supplier.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <Building2 className="h-12 w-12 text-primary" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold">
                      {supplier.company_name || 'Unnamed Supplier'}
                    </h1>
                    {supplier.is_verified && (
                      <Badge className="bg-primary">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  {(supplier.city || supplier.state) && (
                    <div className="flex items-center text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {[supplier.city, supplier.state, supplier.country].filter(Boolean).join(', ')}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span><Package className="h-4 w-4 inline mr-1" />{products.length} Products</span>
                    {avgRating && (
                      <span><Star className="h-4 w-4 inline mr-1 text-yellow-500" />{avgRating} ({reviews.length} reviews)</span>
                    )}
                  </div>

                  {supplier.company_description && (
                    <p className="mt-4 text-muted-foreground">{supplier.company_description}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Button onClick={handleContact}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Supplier
                  </Button>
                  <Button variant="outline" onClick={handleSaveSupplier}>
                    Save Supplier
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to={`/buyer/create-rfq?supplier=${id}`}>
                      <FileText className="h-4 w-4 mr-2" />
                      Send RFQ
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="products" className="space-y-6">
            <TabsList>
              <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
              <TabsTrigger value="contact">Contact Info</TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              {products.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No Products Listed</h3>
                    <p className="text-muted-foreground">This supplier hasn't listed any products yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(product => (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="aspect-[4/3] bg-muted">
                        {product.images && product.images[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{product.name}</h3>
                        {product.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                        )}
                        <div className="flex justify-between text-sm">
                          <span>MOQ: {product.moq} {product.unit}</span>
                          {product.price && <span className="font-semibold text-primary">₹{product.price}</span>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews">
              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No Reviews Yet</h3>
                    <p className="text-muted-foreground">Be the first to review this supplier</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star} 
                              className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`}
                            />
                          ))}
                          <span className="text-sm text-muted-foreground ml-2">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {review.review_text && (
                          <p className="text-sm">{review.review_text}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {supplier.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <span>{supplier.email}</span>
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <span>{supplier.phone}</span>
                    </div>
                  )}
                  {supplier.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <span>{supplier.address}</span>
                    </div>
                  )}
                  {supplier.gst_number && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <span>GST: {supplier.gst_number}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SupplierProfilePage;