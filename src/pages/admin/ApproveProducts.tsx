import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, ArrowLeft, CheckCircle, XCircle, 
  Eye, Calendar, User
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface PendingProduct {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  moq: number;
  unit: string | null;
  images: string[] | null;
  created_at: string;
  supplier_id: string;
  category: { name: string } | null;
  supplier?: { company_name: string | null; email: string | null };
}

const ApproveProducts = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<PendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<PendingProduct | null>(null);

  useEffect(() => {
    loadPendingProducts();
  }, []);

  const loadPendingProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name)
      `)
      .eq('is_approved', false)
      .order('created_at', { ascending: false });

    // Fetch supplier info for each product
    const productsWithSuppliers = await Promise.all(
      (data || []).map(async (product) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_name, email')
          .eq('id', product.supplier_id)
          .single();
        
        return { ...product, supplier: profile };
      })
    );

    setProducts(productsWithSuppliers);
    setLoading(false);
  };

  const handleApprove = async (productId: string) => {
    const { error } = await supabase
      .from('products')
      .update({ is_approved: true })
      .eq('id', productId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Product Approved', description: 'The product is now visible to buyers' });
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  const handleReject = async (productId: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Product Rejected', description: 'The product has been removed' });
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/admin/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Product Approvals</h1>
          <p className="text-muted-foreground">Review and approve product listings from suppliers</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground">No products pending approval</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {products.map(product => (
              <Card key={product.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Product Image */}
                    <div className="w-32 h-32 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                      {product.images && product.images[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <Badge variant="outline">Pending</Badge>
                      </div>

                      {product.description && (
                        <p className="text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm mb-4">
                        {product.category && (
                          <span className="flex items-center">
                            <Package className="h-4 w-4 mr-1 text-muted-foreground" />
                            {product.category.name}
                          </span>
                        )}
                        <span>MOQ: {product.moq} {product.unit}</span>
                        {product.price && <span>₹{product.price}</span>}
                        <span className="flex items-center text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(product.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {product.supplier && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="h-4 w-4 mr-1" />
                          {product.supplier.company_name || product.supplier.email}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" onClick={() => setSelectedProduct(product)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Product Details</DialogTitle>
                          </DialogHeader>
                          {selectedProduct && (
                            <div className="space-y-4 mt-4">
                              {selectedProduct.images && selectedProduct.images.length > 0 && (
                                <div className="grid grid-cols-4 gap-2">
                                  {selectedProduct.images.map((img, idx) => (
                                    <img key={idx} src={img} alt="" className="w-full aspect-square object-cover rounded-lg" />
                                  ))}
                                </div>
                              )}
                              <div>
                                <h3 className="font-semibold text-lg">{selectedProduct.name}</h3>
                                <p className="text-muted-foreground mt-2">{selectedProduct.description}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><strong>Price:</strong> {selectedProduct.price ? `₹${selectedProduct.price}` : 'Not set'}</div>
                                <div><strong>MOQ:</strong> {selectedProduct.moq} {selectedProduct.unit}</div>
                                <div><strong>Category:</strong> {selectedProduct.category?.name || 'Uncategorized'}</div>
                                <div><strong>Supplier:</strong> {selectedProduct.supplier?.company_name || selectedProduct.supplier?.email}</div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button onClick={() => handleApprove(product.id)} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button variant="destructive" onClick={() => handleReject(product.id)}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ApproveProducts;