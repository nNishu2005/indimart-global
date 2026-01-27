import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ship, Package, Truck, MapPin, AlertCircle } from 'lucide-react';

interface IncotermData {
  code: string;
  name: string;
  icon: React.ReactNode;
  costBearer: string;
  riskBearer: string;
  ownershipTransfer: string;
  useCase: string;
  sellerResponsibility: string[];
  buyerResponsibility: string[];
  hinglish: string;
}

const incoterms: IncotermData[] = [
  {
    code: 'FOB',
    name: 'Free On Board',
    icon: <Ship className="h-6 w-6" />,
    costBearer: 'Seller pays until goods are loaded on ship. Buyer pays freight & insurance.',
    riskBearer: 'Risk transfers to buyer once goods cross the ship\'s rail at port of shipment.',
    ownershipTransfer: 'At the port of shipment when goods are loaded on vessel.',
    useCase: 'Most common for Indian exporters. Ideal when buyer has better freight rates or prefers their own shipping arrangements.',
    sellerResponsibility: [
      'Export customs clearance',
      'Delivery to port',
      'Loading charges at origin port',
      'All costs until goods are on board'
    ],
    buyerResponsibility: [
      'Ocean/air freight',
      'Marine insurance',
      'Import customs clearance',
      'Destination charges'
    ],
    hinglish: 'Maal ship par load hone tak seller ka risk. Uske baad buyer sambhalta hai.'
  },
  {
    code: 'CIF',
    name: 'Cost, Insurance & Freight',
    icon: <Package className="h-6 w-6" />,
    costBearer: 'Seller pays freight and insurance to destination port.',
    riskBearer: 'Risk still transfers at origin port (like FOB), but seller arranges insurance.',
    ownershipTransfer: 'At the port of shipment when goods are loaded on vessel.',
    useCase: 'When buyer wants a "delivered price" quote. Common for first-time importers or smaller orders.',
    sellerResponsibility: [
      'Export customs clearance',
      'Delivery to port',
      'Ocean/air freight',
      'Marine insurance (minimum coverage)',
      'All costs until destination port'
    ],
    buyerResponsibility: [
      'Import customs clearance',
      'Destination port charges',
      'Inland transport from port'
    ],
    hinglish: 'Seller freight aur insurance bhi deta hai, but risk FOB jaisa hi origin port par transfer hota hai.'
  },
  {
    code: 'EXW',
    name: 'Ex Works',
    icon: <MapPin className="h-6 w-6" />,
    costBearer: 'Buyer pays all costs from seller\'s premises/factory.',
    riskBearer: 'Risk transfers at seller\'s premises itself.',
    ownershipTransfer: 'At seller\'s factory/warehouse when goods are made available.',
    useCase: 'Rarely used for exports. Suitable when buyer has local agent in India to handle everything.',
    sellerResponsibility: [
      'Making goods available at premises',
      'Packing goods for export'
    ],
    buyerResponsibility: [
      'Loading at seller\'s premises',
      'Export customs clearance',
      'All transport costs',
      'Ocean/air freight',
      'Insurance',
      'Import clearance'
    ],
    hinglish: 'Factory se nikalne ke baad sab kuch buyer ka. Seller sirf maal ready karta hai.'
  },
  {
    code: 'DAP',
    name: 'Delivered at Place',
    icon: <Truck className="h-6 w-6" />,
    costBearer: 'Seller pays all costs until goods reach buyer\'s specified destination.',
    riskBearer: 'Seller bears risk until goods reach the named destination.',
    ownershipTransfer: 'At the named place of destination, ready for unloading.',
    useCase: 'When buyer wants door delivery. Higher risk for Indian exporter but can command premium pricing.',
    sellerResponsibility: [
      'Export customs clearance',
      'All transport to destination',
      'Ocean/air freight',
      'Insurance (recommended)',
      'Delivery to named place'
    ],
    buyerResponsibility: [
      'Import customs clearance',
      'Import duties & taxes',
      'Unloading at destination'
    ],
    hinglish: 'Seller poora delivery tak responsible hai. Buyer ke darwaze tak pahunchana seller ka kaam.'
  }
];

const IncotermsGuide = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
        <AlertCircle className="h-5 w-5 text-amber-600" />
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Disclaimer:</strong> This is an educational guide only. For specific transactions, consult with a licensed customs broker or trade consultant.
        </p>
      </div>

      <Tabs defaultValue="FOB" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {incoterms.map((term) => (
            <TabsTrigger key={term.code} value={term.code} className="flex items-center gap-2">
              {term.icon}
              <span className="hidden sm:inline">{term.code}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {incoterms.map((term) => (
          <TabsContent key={term.code} value={term.code} className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {term.icon}
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {term.code}
                      <Badge variant="secondary">{term.name}</Badge>
                    </CardTitle>
                    <CardDescription className="mt-1 italic text-muted-foreground">
                      "{term.hinglish}"
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        💰 Cost Bearer
                      </h4>
                      <p className="text-sm text-muted-foreground">{term.costBearer}</p>
                    </div>
                    
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        ⚠️ Risk Bearer
                      </h4>
                      <p className="text-sm text-muted-foreground">{term.riskBearer}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        🔄 Ownership Transfer
                      </h4>
                      <p className="text-sm text-muted-foreground">{term.ownershipTransfer}</p>
                    </div>
                    
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        🇮🇳 India Exporter Tip
                      </h4>
                      <p className="text-sm text-muted-foreground">{term.useCase}</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <h4 className="font-semibold text-sm mb-3 text-green-800 dark:text-green-200">
                      ✅ Seller (Exporter) Responsibilities
                    </h4>
                    <ul className="space-y-2">
                      {term.sellerResponsibility.map((item, index) => (
                        <li key={index} className="text-sm text-green-700 dark:text-green-300 flex items-start gap-2">
                          <span className="mt-1">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <h4 className="font-semibold text-sm mb-3 text-blue-800 dark:text-blue-200">
                      📦 Buyer (Importer) Responsibilities
                    </h4>
                    <ul className="space-y-2">
                      {term.buyerResponsibility.map((item, index) => (
                        <li key={index} className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
                          <span className="mt-1">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="text-lg">🤔 Which Incoterm Should You Choose?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-background rounded-lg">
              <strong>Choose FOB if:</strong>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• Buyer has better freight rates</li>
                <li>• You want to minimize your liability</li>
                <li>• Standard export transaction</li>
              </ul>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <strong>Choose CIF if:</strong>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• Buyer wants all-inclusive pricing</li>
                <li>• First-time buyer relationship</li>
                <li>• You have good freight partnerships</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncotermsGuide;
