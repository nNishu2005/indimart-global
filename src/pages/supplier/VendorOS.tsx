import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Ship, Search, CheckSquare, Calculator, BookOpen, HelpCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import IncotermsGuide from '@/components/vendor-os/IncotermsGuide';
import HSCodeFinder from '@/components/vendor-os/HSCodeFinder';
import ComplianceChecklist from '@/components/vendor-os/ComplianceChecklist';
import CostCalculator from '@/components/vendor-os/CostCalculator';

const VendorOS = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button variant="ghost" asChild className="mb-2">
              <Link to="/supplier/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Vendor OS</h1>
            <p className="text-muted-foreground">
              Your complete export documentation & compliance guide for Indian MSME exporters
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2 py-3">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="incoterms" className="flex items-center gap-2 py-3">
              <Ship className="h-4 w-4" />
              <span className="hidden sm:inline">Shipping Types</span>
            </TabsTrigger>
            <TabsTrigger value="hscode" className="flex items-center gap-2 py-3">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">HS Code</span>
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2 py-3">
              <CheckSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Compliance</span>
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center gap-2 py-3">
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">Cost Calculator</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl">🇮🇳 Welcome to Vendor OS</CardTitle>
                <CardDescription className="text-base">
                  A comprehensive guide for Indian MSME manufacturers and exporters to understand 
                  export documentation, shipping, and cost calculations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground italic">
                  "First-time exporter ho ya experienced, yahan sab kuch milega - simple English mein!"
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveTab('incoterms')}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Ship className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Shipping Types (Incoterms)</CardTitle>
                      <CardDescription>FOB, CIF, EXW, DAP explained</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Understand who bears cost & risk</li>
                    <li>• Know when ownership transfers</li>
                    <li>• Choose the right term for your export</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveTab('hscode')}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Search className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">HS Code Finder</CardTitle>
                      <CardDescription>Find the right classification</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Get probable HS Code suggestions</li>
                    <li>• Understand duty implications</li>
                    <li>• Check FTA & RoDTEP eligibility</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveTab('compliance')}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                      <CheckSquare className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Compliance Checklist</CardTitle>
                      <CardDescription>India export requirements</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• IEC, GST LUT, RoDTEP</li>
                    <li>• Rules of Origin (ROO)</li>
                    <li>• SPS/TBT compliance</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveTab('calculator')}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Calculator className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Cost Calculator</CardTitle>
                      <CardDescription>Estimate your export costs</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• FOB vs CIF comparison</li>
                    <li>• Calculate landed cost</li>
                    <li>• Estimate net realization</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Who is this for?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">🏭 First-time Exporters</h4>
                    <p className="text-sm text-muted-foreground">
                      New to exports? Start with our step-by-step compliance checklist and understand 
                      basic shipping terms.
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">📦 Mid-level Exporters</h4>
                    <p className="text-sm text-muted-foreground">
                      Already exporting? Use our cost calculator to optimize pricing and explore 
                      FTA benefits.
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">🏢 MSME Manufacturers</h4>
                    <p className="text-sm text-muted-foreground">
                      Want to start exporting? Learn everything you need to know about documentation 
                      and compliance.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incoterms">
            <IncotermsGuide />
          </TabsContent>

          <TabsContent value="hscode">
            <HSCodeFinder />
          </TabsContent>

          <TabsContent value="compliance">
            <ComplianceChecklist />
          </TabsContent>

          <TabsContent value="calculator">
            <CostCalculator />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default VendorOS;
