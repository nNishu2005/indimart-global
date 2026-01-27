import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, AlertCircle, BookOpen, FileText, Globe, Percent, Gift } from 'lucide-react';

interface HSCodeSuggestion {
  code: string;
  description: string;
  chapter: string;
  dutyRate: string;
  ftaEligible: boolean;
  rodtepRate: string;
}

const categories = [
  { value: 'textiles', label: 'Textiles & Garments' },
  { value: 'handicrafts', label: 'Handicrafts & Artware' },
  { value: 'leather', label: 'Leather Products' },
  { value: 'gems', label: 'Gems & Jewelry' },
  { value: 'machinery', label: 'Machinery & Parts' },
  { value: 'chemicals', label: 'Chemicals & Pharma' },
  { value: 'food', label: 'Food & Agriculture' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'plastics', label: 'Plastics & Rubber' },
  { value: 'metals', label: 'Iron, Steel & Metals' },
];

const materials = [
  { value: 'cotton', label: 'Cotton' },
  { value: 'silk', label: 'Silk' },
  { value: 'synthetic', label: 'Synthetic/Man-made' },
  { value: 'leather', label: 'Leather' },
  { value: 'wood', label: 'Wood' },
  { value: 'metal', label: 'Metal' },
  { value: 'plastic', label: 'Plastic' },
  { value: 'glass', label: 'Glass' },
  { value: 'ceramic', label: 'Ceramic' },
  { value: 'paper', label: 'Paper' },
];

// Sample HS Code database for demonstration
const hsCodeDatabase: Record<string, HSCodeSuggestion[]> = {
  'textiles-cotton': [
    {
      code: '6205.20.00',
      description: 'Men\'s cotton shirts',
      chapter: 'Chapter 62 - Articles of apparel and clothing accessories, not knitted',
      dutyRate: '0% (Most exports)',
      ftaEligible: true,
      rodtepRate: '4.3%',
    },
    {
      code: '6206.30.00',
      description: 'Women\'s cotton blouses and shirts',
      chapter: 'Chapter 62 - Articles of apparel and clothing accessories, not knitted',
      dutyRate: '0% (Most exports)',
      ftaEligible: true,
      rodtepRate: '4.3%',
    },
  ],
  'handicrafts-wood': [
    {
      code: '4420.10.00',
      description: 'Statuettes and other ornaments of wood',
      chapter: 'Chapter 44 - Wood and articles of wood',
      dutyRate: '0%',
      ftaEligible: true,
      rodtepRate: '3.2%',
    },
  ],
  'leather-leather': [
    {
      code: '4202.11.00',
      description: 'Trunks, suit-cases with outer surface of leather',
      chapter: 'Chapter 42 - Articles of leather',
      dutyRate: '0%',
      ftaEligible: true,
      rodtepRate: '4.0%',
    },
  ],
  'gems-metal': [
    {
      code: '7113.19.00',
      description: 'Articles of jewellery of other precious metal',
      chapter: 'Chapter 71 - Natural or cultured pearls, precious stones, precious metals',
      dutyRate: '0%',
      ftaEligible: true,
      rodtepRate: '1.5%',
    },
  ],
};

const HSCodeFinder = () => {
  const [category, setCategory] = useState('');
  const [material, setMaterial] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [suggestions, setSuggestions] = useState<HSCodeSuggestion[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    setSearched(true);
    const key = `${category}-${material}`;
    const results = hsCodeDatabase[key] || [];
    setSuggestions(results);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Disclaimer:</strong> HS Codes shown are approximate suggestions only. 
          Final classification must be done by a licensed customs broker or verified from DGFT/ICEGATE portal.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Your HS Code
          </CardTitle>
          <CardDescription>
            Answer a few questions to get probable HS Code suggestions for your product
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Product Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="material">Primary Material *</Label>
              <Select value={material} onValueChange={setMaterial}>
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {materials.map((mat) => (
                    <SelectItem key={mat.value} value={mat.value}>
                      {mat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Product Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your product in detail (e.g., 'Handwoven cotton saree with zari border, 6 meters length')"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              rows={3}
            />
          </div>

          <Button onClick={handleSearch} disabled={!category || !material} className="w-full">
            <Search className="h-4 w-4 mr-2" />
            Search HS Code
          </Button>
        </CardContent>
      </Card>

      {searched && (
        <div className="space-y-4">
          {suggestions.length > 0 ? (
            <>
              <h3 className="text-lg font-semibold">Suggested HS Codes</h3>
              {suggestions.map((suggestion, index) => (
                <Card key={index} className="border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl font-mono">{suggestion.code}</CardTitle>
                        <CardDescription className="mt-1">{suggestion.description}</CardDescription>
                      </div>
                      {suggestion.ftaEligible && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          FTA Eligible
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <BookOpen className="h-4 w-4" />
                          <span className="font-medium">Chapter</span>
                        </div>
                        <p className="text-xs">{suggestion.chapter}</p>
                      </div>
                      
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Percent className="h-4 w-4" />
                          <span className="font-medium">Export Duty</span>
                        </div>
                        <p>{suggestion.dutyRate}</p>
                      </div>
                      
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Gift className="h-4 w-4" />
                          <span className="font-medium">RoDTEP Rate</span>
                        </div>
                        <p className="text-green-600 font-semibold">{suggestion.rodtepRate}</p>
                      </div>
                      
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Globe className="h-4 w-4" />
                          <span className="font-medium">FTA Benefits</span>
                        </div>
                        <p>{suggestion.ftaEligible ? 'Available under various FTAs' : 'Check specific FTA'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No Exact Match Found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We couldn't find an exact HS Code match for your selection. 
                  Please consult the DGFT website or a customs broker.
                </p>
                <Button variant="outline" asChild>
                  <a href="https://www.icegate.gov.in" target="_blank" rel="noopener noreferrer">
                    Visit ICEGATE Portal
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <CardHeader>
          <CardTitle className="text-lg">📚 Why Does HS Code Matter?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-background rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Percent className="h-4 w-4 text-primary" />
                Customs Duty
              </h4>
              <p className="text-sm text-muted-foreground">
                HS Code determines the import duty rate in destination country. Wrong code = wrong duty = disputes.
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                FTA Eligibility
              </h4>
              <p className="text-sm text-muted-foreground">
                Many products get reduced/zero duty under Free Trade Agreements. HS Code determines eligibility.
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Gift className="h-4 w-4 text-primary" />
                Incentives (RoDTEP)
              </h4>
              <p className="text-sm text-muted-foreground">
                Government incentive rates under RoDTEP are linked to specific HS Codes. Correct code = correct refund.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HSCodeFinder;
