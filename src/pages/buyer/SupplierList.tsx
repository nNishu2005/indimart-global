import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Search, MapPin, CheckCircle, Building2, Package, Star } from 'lucide-react';
import SEO from '@/components/SEO';

interface Supplier {
  id: string;
  company_name: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  company_description: string | null;
  is_verified: boolean | null;
  avatar_url: string | null;
  productCount?: number;
}

interface Category {
  id: string;
  name: string;
}

const SupplierList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // Load categories
    const { data: cats } = await supabase.from('categories').select('id, name').order('name');
    setCategories(cats || []);

    // Load suppliers (users with supplier role)
    const { data: supplierRoles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'supplier');

    if (supplierRoles && supplierRoles.length > 0) {
      const supplierIds = supplierRoles.map(r => r.user_id);
      
      // Use the safe view that excludes PII (email, phone, pan_number, gst_number)
      const { data: profiles } = await supabase
        .from('supplier_profiles_public')
        .select('id, company_name, city, state, country, company_description, is_verified, avatar_url')
        .in('id', supplierIds);

      // Get product counts for each supplier
      const suppliersWithCounts = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('supplier_id', profile.id)
            .eq('is_approved', true);
          
          return { ...profile, productCount: count || 0 };
        })
      );

      setSuppliers(suppliersWithCounts);
    }
    
    setLoading(false);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (locationFilter) params.set('location', locationFilter);
    if (categoryFilter && categoryFilter !== 'all') params.set('category', categoryFilter);
    setSearchParams(params);
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = !searchQuery || 
      supplier.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.company_description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation = !locationFilter || 
      supplier.city?.toLowerCase().includes(locationFilter.toLowerCase()) ||
      supplier.state?.toLowerCase().includes(locationFilter.toLowerCase()) ||
      supplier.country?.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesLocation;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Verified Indian Textile & Apparel Suppliers | Tradevithika"
        description="Browse verified Indian manufacturers and exporters of textiles, apparel, and home textiles. Filter by location and capability to find your match."
        path="/suppliers"
      />
      <Header />
      
      <main className="flex-1 bg-muted/30">
        {/* Search Section */}
        <section className="bg-primary py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6 text-center">
              Find Verified Suppliers
            </h1>
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    placeholder="Search suppliers by name or description..." 
                    className="pl-10 h-12 bg-background"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button size="lg" onClick={handleSearch}>
                  Search
                </Button>
              </div>
              
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <Input 
                    placeholder="Filter by location (city, state, country)..." 
                    className="bg-background"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[200px] bg-background">
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
            </div>
          </div>
        </section>

        {/* Suppliers Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filteredSuppliers.length}</span> suppliers
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading suppliers...</p>
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No suppliers found</h3>
                <p className="text-muted-foreground">Try adjusting your search filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSuppliers.map((supplier) => (
                  <Card key={supplier.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {supplier.avatar_url ? (
                            <img src={supplier.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <Building2 className="h-8 w-8 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg truncate">
                              {supplier.company_name || 'Unnamed Supplier'}
                            </h3>
                            {supplier.is_verified && (
                              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                            )}
                          </div>
                          {(supplier.city || supplier.state) && (
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              {[supplier.city, supplier.state, supplier.country].filter(Boolean).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>

                      {supplier.company_description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {supplier.company_description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mb-4 py-3 border-t border-b">
                        <div className="flex items-center text-sm">
                          <Package className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{supplier.productCount} Products</span>
                        </div>
                        {supplier.is_verified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>

                      <Button asChild className="w-full">
                        <Link to={`/supplier/${supplier.id}`}>
                          View Profile
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SupplierList;