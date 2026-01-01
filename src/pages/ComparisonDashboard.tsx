import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle, TrendingDown, ShieldCheck, Clock, DollarSign, Package, MapPin, Star, AlertTriangle, Calculator, TrendingUp, BarChart3, Download, Layers, Eye, Info, Scale, Sparkles, Image as ImageIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell } from "recharts";

const ComparisonDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedProducts = location.state?.products || [];
  const [orderQuantity, setOrderQuantity] = useState(1000);
  const [shippingCost, setShippingCost] = useState(500);

  if (selectedProducts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>No Products Selected</CardTitle>
              <CardDescription>Please select products to compare from the products page</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/products")}>Browse Products</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate comparison insights
  const priceRanges = selectedProducts.map((p: any) => {
    const match = p.price.match(/\$(\d+)-(\d+)/);
    return match ? { min: parseInt(match[1]), max: parseInt(match[2]), avg: (parseInt(match[1]) + parseInt(match[2])) / 2 } : { min: 0, max: 0, avg: 0 };
  });

  const lowestPriceSupplier = selectedProducts[priceRanges.indexOf(priceRanges.reduce((min, p) => p.avg < min.avg ? p : min))];
  const avgPrice = priceRanges.reduce((sum, p) => sum + p.avg, 0) / priceRanges.length;
  const potentialSavings = Math.max(...priceRanges.map(p => p.avg)) - Math.min(...priceRanges.map(p => p.avg));

  const moqValues = selectedProducts.map((p: any) => parseInt(p.moq.match(/\d+/)?.[0] || "0"));
  const lowestMOQ = Math.min(...moqValues);

  // Calculate total costs with shipping
  const totalCosts = selectedProducts.map((product: any, index: number) => {
    const avgPrice = priceRanges[index].avg;
    const totalProductCost = avgPrice * orderQuantity;
    const totalCost = totalProductCost + shippingCost;
    return {
      supplier: product.supplier,
      unitCost: avgPrice,
      productCost: totalProductCost,
      shippingCost: shippingCost,
      totalCost: totalCost,
      costPerUnit: totalCost / orderQuantity
    };
  });

  // Prepare chart data
  const priceChartData = selectedProducts.map((product: any, index: number) => ({
    supplier: product.supplier,
    minPrice: priceRanges[index].min,
    avgPrice: priceRanges[index].avg,
    maxPrice: priceRanges[index].max,
    moq: moqValues[index]
  }));

  const totalCostChartData = totalCosts.map(cost => ({
    supplier: cost.supplier,
    "Product Cost": cost.productCost,
    "Shipping": cost.shippingCost,
    "Total": cost.totalCost
  }));

  const radarData = selectedProducts.map((product: any, index: number) => ({
    subject: product.supplier,
    price: 100 - (priceRanges[index].avg / Math.max(...priceRanges.map(p => p.avg)) * 100),
    moq: 100 - (moqValues[index] / Math.max(...moqValues) * 100),
    verified: product.verified ? 100 : 0,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/products")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
          <h1 className="text-4xl font-bold mb-2">Supplier Comparison Dashboard</h1>
          <p className="text-muted-foreground">Analyzing {selectedProducts.length} suppliers to help you make the best decision</p>
        </div>

        {/* Key Insights Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-primary" />
                Best Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">${Math.min(...priceRanges.map(p => p.avg)).toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mt-1">per unit lowest price</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-secondary" />
                Lowest MOQ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-secondary">{lowestMOQ}</p>
              <p className="text-sm text-muted-foreground mt-1">units minimum order</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-accent" />
                Potential ROI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-accent">{((potentialSavings / Math.max(...priceRanges.map(p => p.avg))) * 100).toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground mt-1">cost reduction possible</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5 text-green-500" />
                Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-500">{selectedProducts.filter((p: any) => p.verified).length}/{selectedProducts.length}</p>
              <p className="text-sm text-muted-foreground mt-1">suppliers verified</p>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Analytics Tabs */}
        <Tabs defaultValue="sidebyside" className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="sidebyside">Side-by-Side</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pricing">Pricing Analysis</TabsTrigger>
            <TabsTrigger value="calculator">Cost Calculator</TabsTrigger>
            <TabsTrigger value="comparison">Performance</TabsTrigger>
          </TabsList>

          {/* New Side-by-Side Comparison Tab */}
          <TabsContent value="sidebyside" className="space-y-6">
            {/* Product Cards Grid */}
            <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(selectedProducts.length, 5)}, 1fr)` }}>
              {selectedProducts.map((product: any, index: number) => {
                const isLowestPrice = product.id === lowestPriceSupplier.id;
                const isLowestMOQ = moqValues[index] === lowestMOQ;
                const specs = product.specifications || {};
                
                return (
                  <Card key={product.id} className={`relative ${isLowestPrice ? 'ring-2 ring-primary' : ''}`}>
                    {isLowestPrice && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                        <Badge className="bg-primary text-primary-foreground shadow-lg">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Best Value
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="pb-3">
                      {/* Product Image */}
                      <div className="aspect-square rounded-lg bg-muted overflow-hidden mb-3 flex items-center justify-center">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      
                      {/* Supplier & Product Name */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                            {product.supplier}
                          </span>
                          {product.verified && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <ShieldCheck className="h-4 w-4 text-primary" />
                                </TooltipTrigger>
                                <TooltipContent>Verified Supplier</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        <CardTitle className="text-base line-clamp-2">{product.name}</CardTitle>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Price Section */}
                      <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-bold text-primary">{product.price}</span>
                          {isLowestPrice && (
                            <Badge variant="outline" className="text-primary border-primary/30 text-xs">
                              Lowest
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">per {product.unit || 'unit'}</span>
                      </div>
                      
                      {/* Key Metrics */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Package className="h-3.5 w-3.5" />
                            MOQ
                          </span>
                          <span className={`font-medium ${isLowestMOQ ? 'text-secondary' : ''}`}>
                            {product.moq}
                            {isLowestMOQ && <span className="text-xs ml-1">(Lowest)</span>}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            Location
                          </span>
                          <span className="font-medium">{product.location}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Layers className="h-3.5 w-3.5" />
                            Category
                          </span>
                          <span className="font-medium">{product.category}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            Views
                          </span>
                          <span className="font-medium">{product.views || 0}</span>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Specifications */}
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                          <Info className="h-3.5 w-3.5" />
                          Specifications
                        </h4>
                        <div className="space-y-1.5">
                          {Object.keys(specs).length > 0 ? (
                            Object.entries(specs).slice(0, 5).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-xs">
                                <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                                <span className="font-medium text-right max-w-[50%] truncate">{String(value)}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground italic">No specifications available</p>
                          )}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Score Indicators */}
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                          <Scale className="h-3.5 w-3.5" />
                          Score
                        </h4>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Price Score</span>
                              <span className="font-medium">{(100 - (priceRanges[index].avg / Math.max(...priceRanges.map(p => p.avg)) * 100)).toFixed(0)}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${100 - (priceRanges[index].avg / Math.max(...priceRanges.map(p => p.avg)) * 100)}%` }}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">MOQ Flexibility</span>
                              <span className="font-medium">{(100 - (moqValues[index] / Math.max(...moqValues) * 100)).toFixed(0)}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                              <div 
                                className="h-full bg-secondary rounded-full transition-all"
                                style={{ width: `${100 - (moqValues[index] / Math.max(...moqValues) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="pt-2 space-y-2">
                        <Button className="w-full" size="sm">Contact Supplier</Button>
                        <Button variant="outline" className="w-full" size="sm">Request Quote</Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {/* Feature Comparison Matrix */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Feature Comparison Matrix
                </CardTitle>
                <CardDescription>Quick visual comparison of key features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold bg-muted/50">Feature</th>
                        {selectedProducts.map((product: any) => (
                          <th key={product.id} className="text-center p-3 font-semibold bg-muted/50 min-w-[150px]">
                            {product.supplier}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium">Verified Supplier</td>
                        {selectedProducts.map((product: any) => (
                          <td key={product.id} className="p-3 text-center">
                            {product.verified ? (
                              <CheckCircle className="h-5 w-5 text-primary mx-auto" />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium">Best Price</td>
                        {selectedProducts.map((product: any) => (
                          <td key={product.id} className="p-3 text-center">
                            {product.id === lowestPriceSupplier.id ? (
                              <CheckCircle className="h-5 w-5 text-primary mx-auto" />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium">Lowest MOQ</td>
                        {selectedProducts.map((product: any, index: number) => (
                          <td key={product.id} className="p-3 text-center">
                            {moqValues[index] === lowestMOQ ? (
                              <CheckCircle className="h-5 w-5 text-secondary mx-auto" />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium">Price (per unit)</td>
                        {selectedProducts.map((product: any) => (
                          <td key={product.id} className="p-3 text-center font-semibold">{product.price}</td>
                        ))}
                      </tr>
                      <tr className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium">MOQ</td>
                        {selectedProducts.map((product: any) => (
                          <td key={product.id} className="p-3 text-center">{product.moq}</td>
                        ))}
                      </tr>
                      <tr className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium">Location</td>
                        {selectedProducts.map((product: any) => (
                          <td key={product.id} className="p-3 text-center">{product.location}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            {/* Price Distribution Pie Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Price Distribution
                  </CardTitle>
                  <CardDescription>Relative pricing across suppliers</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={selectedProducts.map((product: any, index: number) => ({
                          name: product.supplier,
                          value: priceRanges[index].avg
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {selectedProducts.map((_: any, index: number) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`hsl(var(--${index === 0 ? 'primary' : index === 1 ? 'secondary' : 'accent'}))`}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Value Score Comparison
                  </CardTitle>
                  <CardDescription>Combined score based on price & flexibility</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart 
                      data={selectedProducts.map((product: any, index: number) => ({
                        supplier: product.supplier,
                        score: (
                          (100 - (priceRanges[index].avg / Math.max(...priceRanges.map(p => p.avg)) * 100)) +
                          (100 - (moqValues[index] / Math.max(...moqValues) * 100)) +
                          (product.verified ? 30 : 0)
                        ) / 2.3
                      }))}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="supplier" type="category" width={80} />
                      <RechartsTooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                      <Bar dataKey="score" fill="hsl(var(--primary))" name="Value Score" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            {/* Price Comparison Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Price Range Comparison
                </CardTitle>
                <CardDescription>Compare min, average, and max prices across suppliers</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priceChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="supplier" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="minPrice" fill="hsl(var(--primary))" name="Min Price" />
                    <Bar dataKey="avgPrice" fill="hsl(var(--secondary))" name="Avg Price" />
                    <Bar dataKey="maxPrice" fill="hsl(var(--accent))" name="Max Price" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* MOQ Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Minimum Order Quantity Analysis
                </CardTitle>
                <CardDescription>Lower MOQ means more flexibility for your business</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={priceChartData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="supplier" type="category" width={100} />
                    <RechartsTooltip />
                    <Bar dataKey="moq" fill="hsl(var(--secondary))" name="MOQ (units)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Total Cost Breakdown
                </CardTitle>
                <CardDescription>Based on {orderQuantity.toLocaleString()} units + ${shippingCost} shipping</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={totalCostChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="supplier" />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="Product Cost" stackId="a" fill="hsl(var(--primary))" />
                    <Bar dataKey="Shipping" stackId="a" fill="hsl(var(--secondary))" />
                  </BarChart>
                </ResponsiveContainer>
                
                <div className="mt-6 space-y-3">
                  {totalCosts.map((cost, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-semibold">{cost.supplier}</p>
                        <p className="text-sm text-muted-foreground">Total: ${cost.totalCost.toLocaleString()} | Per unit: ${cost.costPerUnit.toFixed(2)}</p>
                      </div>
                      {cost.totalCost === Math.min(...totalCosts.map(c => c.totalCost)) && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">Best Value</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calculator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Interactive Cost Calculator
                </CardTitle>
                <CardDescription>Adjust quantities and shipping to see total costs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Order Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={orderQuantity}
                      onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                      min={lowestMOQ}
                    />
                    <p className="text-xs text-muted-foreground">Minimum: {lowestMOQ} units</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping">Estimated Shipping Cost ($)</Label>
                    <Input
                      id="shipping"
                      type="number"
                      value={shippingCost}
                      onChange={(e) => setShippingCost(Math.max(0, parseInt(e.target.value) || 0))}
                      min={0}
                    />
                    <p className="text-xs text-muted-foreground">Varies by location and method</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Calculated Costs</h3>
                  {totalCosts.map((cost, index) => {
                    const savings = cost.totalCost - Math.min(...totalCosts.map(c => c.totalCost));
                    return (
                      <Card key={index} className={cost.totalCost === Math.min(...totalCosts.map(c => c.totalCost)) ? "border-primary" : ""}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-semibold text-lg">{cost.supplier}</h4>
                              <p className="text-sm text-muted-foreground">{selectedProducts[index].location}</p>
                            </div>
                            {cost.totalCost === Math.min(...totalCosts.map(c => c.totalCost)) && (
                              <Badge className="bg-primary text-primary-foreground">Best Deal</Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Unit Price</p>
                              <p className="font-semibold">${cost.unitCost.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Product Cost</p>
                              <p className="font-semibold">${cost.productCost.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Shipping</p>
                              <p className="font-semibold">${cost.shippingCost.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Total Cost</p>
                              <p className="font-bold text-lg">${cost.totalCost.toLocaleString()}</p>
                            </div>
                          </div>
                          
                          {savings > 0 && (
                            <div className="mt-4 p-3 bg-muted rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                <span className="text-destructive font-semibold">${savings.toLocaleString()}</span> more expensive than best option
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Supplier Performance Radar
                </CardTitle>
                <CardDescription>Multi-dimensional comparison of key factors</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Price Competitiveness" dataKey="price" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                    <Radar name="MOQ Flexibility" dataKey="moq" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" fillOpacity={0.6} />
                    <Radar name="Verification Status" dataKey="verified" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.6} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
                
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Score Interpretation</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• <span className="text-primary font-medium">Price Competitiveness</span>: Higher score = lower prices</li>
                    <li>• <span className="text-secondary font-medium">MOQ Flexibility</span>: Higher score = lower minimum orders</li>
                    <li>• <span className="text-accent font-medium">Verification Status</span>: 100 = verified, 0 = not verified</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Buyer Benefits Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Key Benefits for Your Business
            </CardTitle>
            <CardDescription>Why comparing these suppliers gives you a competitive advantage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-3 p-4 rounded-lg bg-muted/50">
                <TrendingDown className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Cost Optimization</h3>
                  <p className="text-sm text-muted-foreground">Save up to ${potentialSavings.toFixed(2)} per unit by selecting the most cost-effective supplier without compromising quality.</p>
                </div>
              </div>

              <div className="flex gap-3 p-4 rounded-lg bg-muted/50">
                <Clock className="h-6 w-6 text-secondary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Flexible Order Quantities</h3>
                  <p className="text-sm text-muted-foreground">Lower MOQ options available starting from {lowestMOQ} units, reducing upfront investment and inventory risk.</p>
                </div>
              </div>

              <div className="flex gap-3 p-4 rounded-lg bg-muted/50">
                <ShieldCheck className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Verified Quality Assurance</h3>
                  <p className="text-sm text-muted-foreground">All suppliers are verified, ensuring reliable product quality and reducing business risk.</p>
                </div>
              </div>

              <div className="flex gap-3 p-4 rounded-lg bg-muted/50">
                <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Geographic Diversity</h3>
                  <p className="text-sm text-muted-foreground">Multiple location options help optimize shipping costs and lead times based on your target markets.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Supplier Comparison</CardTitle>
            <CardDescription>Side-by-side analysis of all key factors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Criteria</th>
                    {selectedProducts.map((product: any) => (
                      <th key={product.id} className="text-left p-4 font-semibold min-w-[200px]">
                        {product.supplier}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">Product</td>
                    {selectedProducts.map((product: any) => (
                      <td key={product.id} className="p-4">{product.name}</td>
                    ))}
                  </tr>

                  <tr className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">Location</td>
                    {selectedProducts.map((product: any) => (
                      <td key={product.id} className="p-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {product.location}
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b hover:bg-muted/50 bg-primary/5">
                    <td className="p-4 font-medium">Price per Unit</td>
                    {selectedProducts.map((product: any, index: number) => {
                      const isLowest = product.id === lowestPriceSupplier.id;
                      return (
                        <td key={product.id} className="p-4">
                          <div className="flex items-center gap-2">
                            <span className={isLowest ? "text-primary font-bold" : ""}>{product.price}</span>
                            {isLowest && <Badge variant="secondary" className="text-xs">Best Price</Badge>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">Minimum Order Quantity</td>
                    {selectedProducts.map((product: any, index: number) => {
                      const isLowest = moqValues[index] === lowestMOQ;
                      return (
                        <td key={product.id} className="p-4">
                          <div className="flex items-center gap-2">
                            <span className={isLowest ? "text-secondary font-bold" : ""}>{product.moq}</span>
                            {isLowest && <Badge variant="secondary" className="text-xs">Lowest MOQ</Badge>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">Verification Status</td>
                    {selectedProducts.map((product: any) => (
                      <td key={product.id} className="p-4">
                        {product.verified ? (
                          <div className="flex items-center gap-2 text-accent">
                            <CheckCircle className="h-4 w-4" />
                            <span>Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <AlertTriangle className="h-4 w-4" />
                            <span>Not Verified</span>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">Category</td>
                    {selectedProducts.map((product: any) => (
                      <td key={product.id} className="p-4">
                        <Badge variant="outline">{product.category}</Badge>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recommendation Section */}
        <Card className="mt-8 border-primary/50 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Our Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{lowestPriceSupplier.supplier}</h3>
                  <p className="text-muted-foreground mb-4">
                    Best overall value offering {lowestPriceSupplier.price} with {lowestPriceSupplier.moq} MOQ. 
                    Located in {lowestPriceSupplier.location}, this verified supplier provides excellent cost efficiency.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Button>Contact Supplier</Button>
                    <Button variant="outline">Request Quote</Button>
                    <Button variant="outline">View Full Profile</Button>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold mb-2">Decision Factors:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Compare total landed costs including shipping to your location</li>
                  <li>Consider payment terms and lead times from each supplier</li>
                  <li>Request samples before placing large orders</li>
                  <li>Verify supplier certifications match your market requirements</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center flex-wrap">
          <Button size="lg" onClick={() => navigate("/products")}>
            Compare More Suppliers
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
          <Button size="lg" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ComparisonDashboard;
