import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertCircle, CheckCircle2, FileText, Shield, Globe, Gift, Building, Leaf } from 'lucide-react';

interface ComplianceItem {
  id: string;
  name: string;
  fullName: string;
  icon: React.ReactNode;
  description: string;
  hinglish: string;
  issuingAuthority: string;
  validity: string;
  importance: 'mandatory' | 'recommended' | 'conditional';
  steps: string[];
  documents: string[];
  tips: string[];
}

const complianceItems: ComplianceItem[] = [
  {
    id: 'iec',
    name: 'IEC',
    fullName: 'Import Export Code',
    icon: <FileText className="h-5 w-5" />,
    description: 'A 10-digit code issued by DGFT, mandatory for all import/export businesses in India. Without IEC, you cannot clear customs.',
    hinglish: 'Bina IEC ke India se export ya import nahi kar sakte. Ye aapka export license hai.',
    issuingAuthority: 'Directorate General of Foreign Trade (DGFT)',
    validity: 'Lifetime (No renewal needed)',
    importance: 'mandatory',
    steps: [
      'Register on DGFT website (dgft.gov.in)',
      'Fill online application form ANF 2A',
      'Upload required documents',
      'Pay fee of ₹500',
      'IEC issued within 1-2 working days'
    ],
    documents: [
      'PAN Card of entity',
      'Aadhaar of proprietor/partners/directors',
      'Bank account details with cancelled cheque',
      'Address proof of business',
      'Digital photograph'
    ],
    tips: [
      'Apply online for faster processing',
      'Keep IEC active by updating KYC annually',
      'One IEC is enough for multiple products/ports'
    ]
  },
  {
    id: 'roo',
    name: 'ROO',
    fullName: 'Rules of Origin',
    icon: <Globe className="h-5 w-5" />,
    description: 'Certificate proving that goods are manufactured/processed in India. Required to claim benefits under Free Trade Agreements (FTAs).',
    hinglish: 'Ye certificate prove karta hai ki aapka maal India mein bana hai. FTA benefit lene ke liye zaruri hai.',
    issuingAuthority: 'Authorized agencies (EIC, FIEO, Chambers of Commerce)',
    validity: 'Per shipment basis',
    importance: 'conditional',
    steps: [
      'Check if destination country has FTA with India',
      'Identify correct ROO criteria (value addition, change in tariff)',
      'Collect manufacturing records and invoices',
      'Apply to authorized issuing agency',
      'Submit Certificate of Origin with shipment'
    ],
    documents: [
      'Commercial invoice',
      'Packing list',
      'Bill of Lading/Airway Bill',
      'Manufacturing process details',
      'Value addition calculation'
    ],
    tips: [
      'Common FTAs: ASEAN, SAFTA, Japan, Korea, UAE',
      'Minimum 35-40% value addition typically required',
      'Plan ahead - some CoO applications take time'
    ]
  },
  {
    id: 'sps-tbt',
    name: 'SPS/TBT',
    fullName: 'Sanitary, Phytosanitary & Technical Barriers',
    icon: <Shield className="h-5 w-5" />,
    description: 'Health, safety, and technical standards required by importing countries. Critical for food, agriculture, pharma, and chemical exports.',
    hinglish: 'Food, dawai, chemicals export karne ke liye destination country ke health aur safety rules follow karne padenge.',
    issuingAuthority: 'Various (FSSAI, APEDA, EIC, BIS)',
    validity: 'Varies by product and certification',
    importance: 'conditional',
    steps: [
      'Identify destination country requirements',
      'Get product tested from accredited labs',
      'Obtain required certifications (FSSAI, APEDA, etc.)',
      'Ensure labeling compliance',
      'Get Phytosanitary certificate if needed'
    ],
    documents: [
      'Product test reports',
      'FSSAI license (for food)',
      'Phytosanitary certificate (for plants)',
      'Health certificate (for animal products)',
      'Lab analysis reports'
    ],
    tips: [
      'EU has strict MRL (Maximum Residue Limits)',
      'USA requires FDA registration for food',
      'Check destination country-specific requirements early'
    ]
  },
  {
    id: 'rodtep',
    name: 'RoDTEP',
    fullName: 'Remission of Duties and Taxes on Exported Products',
    icon: <Gift className="h-5 w-5" />,
    description: 'Government scheme providing refund of embedded taxes and duties not refunded through other mechanisms. Replaced MEIS scheme.',
    hinglish: 'Sarkar export ke badle mein kuch paisa wapas deti hai - jo taxes aapne pay kiye hain unka refund.',
    issuingAuthority: 'DGFT / Customs',
    validity: 'Ongoing scheme (as per government policy)',
    importance: 'recommended',
    steps: [
      'Ensure correct HS Code classification',
      'File Shipping Bill with RoDTEP claim',
      'Scroll generated by customs system',
      'Credit appears in IEC holder\'s account',
      'Use scrips or get refund as duty credit'
    ],
    documents: [
      'Shipping Bill',
      'Commercial Invoice',
      'Bank Realization Certificate (BRC)',
      'Self-declaration in shipping bill'
    ],
    tips: [
      'Rates vary from 0.3% to 4.3% of FOB value',
      'Check updated RoDTEP rates on DGFT website',
      'Claims must be made at time of export'
    ]
  },
  {
    id: 'gst',
    name: 'GST LUT',
    fullName: 'Letter of Undertaking for Export without IGST',
    icon: <Building className="h-5 w-5" />,
    description: 'Allows export of goods/services without payment of IGST. Must be filed on GST portal before export.',
    hinglish: 'LUT file karo toh export par IGST nahi lagta. Warna pay karo aur baad mein refund lo.',
    issuingAuthority: 'GST Portal',
    validity: 'One financial year',
    importance: 'mandatory',
    steps: [
      'Login to GST portal',
      'Go to Services > User Services > Furnish LUT',
      'Fill Form GST RFD-11',
      'Submit with digital signature',
      'LUT valid for entire financial year'
    ],
    documents: [
      'GST registration',
      'Previous year\'s export data (if any)',
      'Bank guarantee (only in some cases)'
    ],
    tips: [
      'File LUT before first export of the year',
      'Renew every April',
      'Keep copies of all export invoices'
    ]
  },
  {
    id: 'quality',
    name: 'Quality Certifications',
    fullName: 'Product Quality & Safety Certifications',
    icon: <Leaf className="h-5 w-5" />,
    description: 'Industry-specific certifications that build buyer confidence and may be mandatory for certain markets.',
    hinglish: 'ISO, CE, REACH jaise certificates se buyer ka trust badhta hai aur kuch markets mein mandatory hai.',
    issuingAuthority: 'Various certification bodies',
    validity: 'Typically 1-3 years',
    importance: 'recommended',
    steps: [
      'Identify required certifications for your product/market',
      'Contact accredited certification body',
      'Prepare documentation and process compliance',
      'Undergo audit/testing',
      'Receive certification'
    ],
    documents: [
      'Product specifications',
      'Manufacturing process documents',
      'Quality control records',
      'Test reports'
    ],
    tips: [
      'CE marking mandatory for EU market',
      'REACH compliance for chemicals to EU',
      'GOTS for organic textiles',
      'BIS for electronics to India'
    ]
  }
];

const ComplianceChecklist = () => {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setCheckedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const mandatoryItems = complianceItems.filter(item => item.importance === 'mandatory');
  const mandatoryCompleted = mandatoryItems.filter(item => checkedItems.includes(item.id)).length;
  const progress = (checkedItems.length / complianceItems.length) * 100;

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'mandatory':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">Mandatory</Badge>;
      case 'recommended':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">Recommended</Badge>;
      case 'conditional':
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">Conditional</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Disclaimer:</strong> This checklist is for educational purposes. 
          Requirements may vary based on product type, destination country, and current regulations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Your Export Readiness
          </CardTitle>
          <CardDescription>
            Track your compliance progress. Complete all mandatory items before your first export.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{checkedItems.length} of {complianceItems.length} items</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${mandatoryCompleted === mandatoryItems.length ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>Mandatory: {mandatoryCompleted}/{mandatoryItems.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Accordion type="multiple" className="space-y-4">
        {complianceItems.map((item) => (
          <AccordionItem key={item.id} value={item.id} className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-4 w-full">
                <Checkbox
                  id={item.id}
                  checked={checkedItems.includes(item.id)}
                  onCheckedChange={() => toggleItem(item.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="p-2 bg-primary/10 rounded-lg">
                  {item.icon}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{item.name}</span>
                    {getImportanceBadge(item.importance)}
                  </div>
                  <span className="text-sm text-muted-foreground">{item.fullName}</span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4">
              <div className="space-y-4 pl-14">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm">{item.description}</p>
                  <p className="text-sm italic text-muted-foreground mt-2">"{item.hinglish}"</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="text-muted-foreground">Issuing Authority:</strong>
                    <p>{item.issuingAuthority}</p>
                  </div>
                  <div>
                    <strong className="text-muted-foreground">Validity:</strong>
                    <p>{item.validity}</p>
                  </div>
                </div>

                <div>
                  <strong className="text-sm">Steps to Obtain:</strong>
                  <ol className="mt-2 space-y-1 list-decimal list-inside text-sm text-muted-foreground">
                    {item.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>

                <div>
                  <strong className="text-sm">Required Documents:</strong>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {item.documents.map((doc, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span>•</span> {doc}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <strong className="text-sm text-green-800 dark:text-green-200">💡 Pro Tips:</strong>
                  <ul className="mt-2 space-y-1 text-sm text-green-700 dark:text-green-300">
                    {item.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span>•</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default ComplianceChecklist;
