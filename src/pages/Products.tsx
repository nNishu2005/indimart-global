import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, SlidersHorizontal, CheckCircle, MapPin, MessageSquare, X, GitCompare, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  category_id: string | null;
  category_name?: string;
  supplier_id: string;
  supplier_name?: string;
  location?: string;
  moq: number;
  unit: string | null;
  price: number | null;
  is_approved: boolean | null;
  images: string[] | null;
}

interface Category {
  id: string;
  name: string;
}

const Products = () => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [moqFilter, setMoqFilter] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("relevant");

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");
      
      if (categoriesData) {
        setCategories(categoriesData);
      }

      // Fetch approved and active products with supplier info
      const { data: productsData, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          category_id,
          supplier_id,
          moq,
          unit,
          price,
          is_approved,
          images,
          categories(name)
        `)
        .eq("is_approved", true)
        .eq("is_active", true);

      if (error) throw error;

      if (productsData) {
        // Fetch supplier profiles for the products
        const supplierIds = [...new Set(productsData.map(p => p.supplier_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, company_name, city, state")
          .in("id", supplierIds);

        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

        const formattedProducts = productsData.map(product => {
          const profile = profilesMap.get(product.supplier_id);
          const category = product.categories as { name: string } | null;
          return {
            id: product.id,
            name: product.name,
            category_id: product.category_id,
            category_name: category?.name || "Uncategorized",
            supplier_id: product.supplier_id,
            supplier_name: profile?.company_name || "Unknown Supplier",
            location: profile?.city && profile?.state 
              ? `${profile.city}, ${profile.state}` 
              : "India",
            moq: product.moq,
            unit: product.unit,
            price: product.price,
            is_approved: product.is_approved,
            images: product.images,
          };
        });

        setProducts(formattedProducts);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.category_name?.toLowerCase().includes(query) ||
        p.supplier_name?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter(p => p.category_id === categoryFilter);
    }

    // Price filter
    if (priceFilter !== "all") {
      result = result.filter(p => {
        if (!p.price) return false;
        switch (priceFilter) {
          case "0-10": return p.price <= 10;
          case "10-25": return p.price > 10 && p.price <= 25;
          case "25-50": return p.price > 25 && p.price <= 50;
          case "50+": return p.price > 50;
          default: return true;
        }
      });
    }

    // MOQ filter
    if (moqFilter !== "all") {
      result = result.filter(p => {
        switch (moqFilter) {
          case "0-100": return p.moq <= 100;
          case "100-500": return p.moq > 100 && p.moq <= 500;
          case "500-1000": return p.moq > 500 && p.moq <= 1000;
          case "1000+": return p.moq > 1000;
          default: return true;
        }
      });
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "moq-low":
        result.sort((a, b) => a.moq - b.moq);
        break;
      default:
        // Keep original order for "relevant"
        break;
    }

    return result;
  }, [products, searchQuery, categoryFilter, priceFilter, moqFilter, verifiedOnly, sortBy]);

  const handleProductSelect = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      if (selectedProducts.length >= 5) {
        toast({
          title: "Maximum reached",
          description: "You can compare up to 5 products only",
          variant: "destructive",
        });
        return;
      }
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const handleCompare = () => {
    if (selectedProducts.length < 2) {
      toast({
        title: "Select more products",
        description: "Please select at least 2 products to compare",
        variant: "destructive",
      });
      return;
    }
    
    const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));
    navigate("/comparison", { state: { products: selectedProductsData } });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already reactive via useMemo
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setPriceFilter("all");
    setMoqFilter("all");
    setVerifiedOnly(false);
  };

  const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));

  const formatPrice = (price: number | null) => {
    if (!price) return "Contact for price";
    return `₹${price.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        {/* Search Bar Section */}
        <section className="bg-primary py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6 text-center">
              Find Quality Products from India
            </h1>
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    placeholder="Search products, suppliers, or categories..." 
                    className="pl-10 h-12 bg-background"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" size="lg" className="bg-secondary hover:bg-secondary/90">
                  Search
                </Button>
              </div>
            </form>
          </div>
        </section>

        {/* Filters & Products Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar */}
              <aside className="lg:w-64 space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">Filters</h3>
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        Clear
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Category</label>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(cat => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Price Range</label>
                        <Select value={priceFilter} onValueChange={setPriceFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Any Price" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any Price</SelectItem>
                            <SelectItem value="0-10">₹0 - ₹10</SelectItem>
                            <SelectItem value="10-25">₹10 - ₹25</SelectItem>
                            <SelectItem value="25-50">₹25 - ₹50</SelectItem>
                            <SelectItem value="50+">₹50+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">MOQ</label>
                        <Select value={moqFilter} onValueChange={setMoqFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Any MOQ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any MOQ</SelectItem>
                            <SelectItem value="0-100">0 - 100 units</SelectItem>
                            <SelectItem value="100-500">100 - 500 units</SelectItem>
                            <SelectItem value="500-1000">500 - 1000 units</SelectItem>
                            <SelectItem value="1000+">1000+ units</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="pt-4 border-t">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <Checkbox 
                            checked={verifiedOnly} 
                            onCheckedChange={(checked) => setVerifiedOnly(checked === true)}
                          />
                          <span className="text-sm">Verified Suppliers Only</span>
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </aside>

              {/* Products Grid */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{filteredProducts.length}</span> products
                  </p>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevant">Most Relevant</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="moq-low">MOQ: Low to High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <Card className="p-12 text-center">
                    <p className="text-muted-foreground mb-4">No products found matching your criteria</p>
                    <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow group relative">
                        <div className="absolute top-4 left-4 z-10">
                          <Checkbox
                            checked={selectedProducts.includes(product.id)}
                            onCheckedChange={() => handleProductSelect(product.id)}
                            className="bg-background border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                        </div>
                        <div className="relative overflow-hidden aspect-[4/3] cursor-pointer">
                          <img 
                            src={product.images?.[0] || "/placeholder.svg"} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {product.is_approved && (
                            <Badge className="absolute top-3 right-3 bg-gradient-trust shadow-trust">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{product.category_name}</p>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm">
                              <span className="text-muted-foreground mr-2">Supplier:</span>
                              <span className="font-medium">{product.supplier_name}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 mr-1" />
                              {product.location}
                            </div>
                          </div>

                          <div className="flex justify-between items-center mb-4 py-3 border-t border-border">
                            <div>
                              <div className="text-xs text-muted-foreground">MOQ</div>
                              <div className="font-semibold text-sm">{product.moq} {product.unit || "units"}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-muted-foreground">Price</div>
                              <div className="font-semibold text-secondary">{formatPrice(product.price)}</div>
                            </div>
                          </div>

                          <Button 
                            className="w-full" 
                            variant="default"
                            onClick={() => navigate(`/buyer/supplier/${product.supplier_id}`)}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Contact Supplier
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Compare Button */}
      {selectedProducts.length >= 2 && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-4">
          <Button 
            size="lg" 
            onClick={handleCompare}
            className="shadow-lg hover:shadow-xl transition-shadow"
          >
            <GitCompare className="h-5 w-5 mr-2" />
            Compare ({selectedProducts.length})
          </Button>
        </div>
      )}

      {/* Comparison Dialog */}
      <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center justify-between">
              <span>Compare Suppliers</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedProducts([]);
                  setShowCompareDialog(false);
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {selectedProductsData.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="relative aspect-[4/3]">
                  <img 
                    src={product.images?.[0] || "/placeholder.svg"} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.is_approved && (
                    <Badge className="absolute top-3 right-3 bg-gradient-trust shadow-trust">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.category_name}</p>
                  </div>

                  <div className="space-y-3 pt-3 border-t">
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">Supplier</span>
                      <span className="font-medium text-sm">{product.supplier_name}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span>{product.location}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">MOQ</span>
                        <span className="font-semibold text-sm">{product.moq} {product.unit || "units"}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground block mb-1">Price</span>
                        <span className="font-semibold text-sm text-secondary">{formatPrice(product.price)}</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full mt-4" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Supplier
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Products;
