import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Pencil, 
  Eye, 
  EyeOff, 
  Trash2,
  Package,
  ArrowLeft,
  Loader2,
  LayoutGrid,
  List,
  Filter,
  X
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  moq: number;
  unit: string | null;
  is_approved: boolean;
  is_active: boolean;
  views: number;
  images: string[] | null;
  created_at: string;
  category_id: string | null;
  category: { id: string; name: string } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const ProductLibrary = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [productsResult, categoriesResult] = await Promise.all([
        supabase
          .from('products')
          .select(`
            id,
            name,
            description,
            price,
            moq,
            unit,
            is_approved,
            is_active,
            views,
            images,
            created_at,
            category_id,
            category:categories(id, name)
          `)
          .eq('supplier_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('categories')
          .select('id, name, slug')
          .order('name')
      ]);

      if (productsResult.error) throw productsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;

      setProducts(productsResult.data || []);
      setCategories(categoriesResult.data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.map(p => 
        p.id === productId ? { ...p, is_active: !currentStatus } : p
      ));

      toast({
        title: currentStatus ? 'Product Deactivated' : 'Product Activated',
        description: currentStatus 
          ? 'Product is now hidden from buyers' 
          : 'Product is now visible to buyers',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.filter(p => p.id !== productId));
      toast({
        title: 'Product Deleted',
        description: 'Product has been removed successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setStatusFilter('all');
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && product.is_active && product.is_approved) ||
      (statusFilter === 'inactive' && !product.is_active) ||
      (statusFilter === 'pending' && !product.is_approved);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || statusFilter !== 'all';

  const formatPrice = (price: number | null) => {
    if (price === null) return 'Price on request';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const getStatusBadge = (product: Product) => {
    if (!product.is_approved) {
      return <Badge variant="secondary">Pending Approval</Badge>;
    }
    if (!product.is_active) {
      return <Badge variant="outline">Inactive</Badge>;
    }
    return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Active</Badge>;
  };

  const ProductActions = ({ product }: { product: Product }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to={`/supplier/edit-product/${product.id}`}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => toggleProductStatus(product.id, product.is_active)}
        >
          {product.is_active ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Deactivate
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Activate
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => deleteProduct(product.id)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const ProductGridCard = ({ product }: { product: Product }) => (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square relative bg-muted">
        {product.images && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          {getStatusBadge(product)}
        </div>
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ProductActions product={product} />
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold line-clamp-1 mb-1">{product.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {product.description || 'No description'}
        </p>
        <div className="flex items-center justify-between">
          <span className="font-medium text-primary">{formatPrice(product.price)}</span>
          <span className="text-sm text-muted-foreground">
            MOQ: {product.moq} {product.unit || 'units'}
          </span>
        </div>
        {product.category && (
          <Badge variant="outline" className="mt-2">
            {product.category.name}
          </Badge>
        )}
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <Eye className="h-3 w-3" />
          {product.views} views
        </div>
      </CardContent>
    </Card>
  );

  const ProductListItem = ({ product }: { product: Product }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
            {product.images && product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground/50" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{product.name}</h3>
              {getStatusBadge(product)}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
              {product.description || 'No description'}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium text-primary">{formatPrice(product.price)}</span>
              <span className="text-muted-foreground">
                MOQ: {product.moq} {product.unit || 'units'}
              </span>
              {product.category && (
                <Badge variant="outline" className="text-xs">
                  {product.category.name}
                </Badge>
              )}
              <span className="flex items-center gap-1 text-muted-foreground">
                <Eye className="h-3 w-3" />
                {product.views}
              </span>
            </div>
          </div>
          <ProductActions product={product} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          asChild
          className="mb-4"
        >
          <Link to="/supplier/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Library
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your product listings, inventory, and pricing here.
              </p>
            </div>
            <Button asChild>
              <Link to="/supplier/add-product">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {/* Filters Section */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending Approval</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear Filters
                  </Button>
                )}

                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Stats */}
            <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
              <span>{filteredProducts.length} products</span>
              {hasActiveFilters && (
                <span>(filtered from {products.length} total)</span>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  {hasActiveFilters 
                    ? 'No products found matching your criteria' 
                    : 'Get started by adding your first product'}
                </p>
                <div className="flex items-center justify-center gap-2">
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                  {!searchTerm && (
                    <Button asChild>
                      <Link to="/supplier/add-product">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductGridCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map((product) => (
                  <ProductListItem key={product.id} product={product} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ProductLibrary;
