import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, DollarSign, Package, MapPin, Trophy, Star, MessageSquare } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from "recharts";

interface CompareProduct {
  id: string;
  name: string;
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

const ComparisonDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedProducts: CompareProduct[] = location.state?.products || [];

  if (selectedProducts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-muted/30">
          <Card className="max-w-md text-center">
            <CardHeader>
              <CardTitle>No Products Selected</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Please select products to compare from the products page</p>
              <Button onClick={() => navigate("/products")}>Browse Products</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate best values
  const prices = selectedProducts.map(p => p.price || 0);
  const moqs = selectedProducts.map(p => p.moq);
  const lowestPrice = Math.min(...prices.filter(p => p > 0));
  const lowestMOQ = Math.min(...moqs);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const savings = Math.max(...prices) - lowestPrice;

  // Find best product (lowest price with verification bonus)
  const bestProductIndex = selectedProducts.reduce((bestIdx, product, idx) => {
    const currentScore = (product.price || 999999) - (product.is_approved ? 5 : 0);
    const bestScore = (selectedProducts[bestIdx].price || 999999) - (selectedProducts[bestIdx].is_approved ? 5 : 0);
    return currentScore < bestScore ? idx : bestIdx;
  }, 0);

  // Chart data
  const priceChartData = selectedProducts.map(product => ({
    name: product.supplier_name?.split(' ')[0] || 'Supplier',
    price: product.price || 0,
    moq: product.moq
  }));

  const formatPrice = (price: number | null) => {
    if (!price) return "Contact";
    return `₹${price.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/products")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
          <h1 className="text-3xl font-bold mb-2">Compare Products</h1>
          <p className="text-muted-foreground">Comparing {selectedProducts.length} products side by side</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-primary">{formatPrice(lowestPrice)}</p>
              <p className="text-sm text-muted-foreground">Best Price</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="h-8 w-8 mx-auto mb-2 text-secondary" />
              <p className="text-2xl font-bold text-secondary">{lowestMOQ}</p>
              <p className="text-sm text-muted-foreground">Lowest MOQ</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-amber-500" />
              <p className="text-2xl font-bold text-amber-500">{formatPrice(savings)}</p>
              <p className="text-sm text-muted-foreground">Potential Savings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold text-green-500">{selectedProducts.filter(p => p.is_approved).length}</p>
              <p className="text-sm text-muted-foreground">Verified Suppliers</p>
            </CardContent>
          </Card>
        </div>

        {/* Product Cards Comparison */}
        <div className={`grid gap-6 mb-8 ${selectedProducts.length <= 3 ? `grid-cols-1 md:grid-cols-${selectedProducts.length}` : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`} style={{ gridTemplateColumns: `repeat(${Math.min(selectedProducts.length, 4)}, 1fr)` }}>
          {selectedProducts.map((product, index) => {
            const isBest = index === bestProductIndex;
            const isLowestPrice = product.price === lowestPrice;
            const isLowestMOQ = product.moq === lowestMOQ;
            
            return (
              <Card key={product.id} className={`relative overflow-hidden ${isBest ? 'ring-2 ring-primary shadow-lg' : ''}`}>
                {isBest && (
                  <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                    <Trophy className="h-4 w-4 inline mr-1" />
                    Best Choice
                  </div>
                )}
                
                {/* Product Image */}
                <div className={`aspect-square bg-muted ${isBest ? 'mt-8' : ''}`}>
                  <img 
                    src={product.images?.[0] || "/placeholder.svg"} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <CardContent className="p-4">
                  {/* Supplier Name */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm">{product.supplier_name}</span>
                    {product.is_approved && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  
                  {/* Product Name */}
                  <h3 className="font-semibold mb-3 line-clamp-2">{product.name}</h3>
                  
                  {/* Price */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground text-sm">Price</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{formatPrice(product.price)}</span>
                      {isLowestPrice && (
                        <Badge variant="secondary" className="text-xs">Lowest</Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* MOQ */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground text-sm">MOQ</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{product.moq} {product.unit || 'units'}</span>
                      {isLowestMOQ && (
                        <Badge variant="secondary" className="text-xs">Lowest</Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Location */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-muted-foreground text-sm">Location</span>
                    <span className="text-sm flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {product.location || 'India'}
                    </span>
                  </div>
                  
                  {/* Category */}
                  <Badge variant="outline" className="mb-4">{product.category_name}</Badge>
                  
                  {/* Action */}
                  <Button 
                    className="w-full" 
                    variant={isBest ? "default" : "outline"}
                    onClick={() => navigate(`/supplier/${product.supplier_id}`)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Supplier
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Comparison Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Feature Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold bg-muted/50">Feature</th>
                    {selectedProducts.map((product, idx) => (
                      <th key={product.id} className={`text-center p-3 font-semibold min-w-[140px] ${idx === bestProductIndex ? 'bg-primary/10' : 'bg-muted/50'}`}>
                        {product.supplier_name?.split(' ').slice(0, 2).join(' ')}
                        {idx === bestProductIndex && <Star className="h-4 w-4 inline ml-1 text-primary" />}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Price</td>
                    {selectedProducts.map((product, idx) => (
                      <td key={product.id} className={`p-3 text-center font-semibold ${product.price === lowestPrice ? 'text-primary' : ''} ${idx === bestProductIndex ? 'bg-primary/5' : ''}`}>
                        {formatPrice(product.price)}
                        {product.price === lowestPrice && <span className="block text-xs text-primary">✓ Best</span>}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">MOQ</td>
                    {selectedProducts.map((product, idx) => (
                      <td key={product.id} className={`p-3 text-center ${product.moq === lowestMOQ ? 'text-secondary font-semibold' : ''} ${idx === bestProductIndex ? 'bg-primary/5' : ''}`}>
                        {product.moq} {product.unit || 'units'}
                        {product.moq === lowestMOQ && <span className="block text-xs text-secondary">✓ Lowest</span>}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Verified</td>
                    {selectedProducts.map((product, idx) => (
                      <td key={product.id} className={`p-3 text-center ${idx === bestProductIndex ? 'bg-primary/5' : ''}`}>
                        {product.is_approved ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Location</td>
                    {selectedProducts.map((product, idx) => (
                      <td key={product.id} className={`p-3 text-center text-sm ${idx === bestProductIndex ? 'bg-primary/5' : ''}`}>
                        {product.location || 'India'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Category</td>
                    {selectedProducts.map((product, idx) => (
                      <td key={product.id} className={`p-3 text-center text-sm ${idx === bestProductIndex ? 'bg-primary/5' : ''}`}>
                        {product.category_name}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Price Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Price Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip 
                  formatter={(value, name) => [
                    name === 'price' ? `₹${Number(value).toLocaleString()}` : value,
                    name === 'price' ? 'Price' : 'MOQ'
                  ]}
                />
                <Bar dataKey="price" fill="hsl(var(--primary))" name="Price" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default ComparisonDashboard;