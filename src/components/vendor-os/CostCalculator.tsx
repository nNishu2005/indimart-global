import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Calculator, TrendingUp, TrendingDown, ArrowRight, IndianRupee } from 'lucide-react';

interface CostBreakdown {
  productCost: number;
  packingCost: number;
  inlandFreight: number;
  portCharges: number;
  customsClearance: number;
  fobValue: number;
  oceanFreight: number;
  insurance: number;
  cifValue: number;
  importDuty: number;
  totalLandedCost: number;
  rodtepCredit: number;
  netRealization: number;
}

const CostCalculator = () => {
  const [formData, setFormData] = useState({
    productPrice: '',
    quantity: '',
    packingCost: '2',
    inlandFreight: '',
    portCharges: '5000',
    customsClearance: '3000',
    oceanFreight: '',
    insuranceRate: '0.5',
    importDutyRate: '10',
    rodtepRate: '3',
    shippingType: 'fob',
  });

  const [breakdown, setBreakdown] = useState<CostBreakdown | null>(null);

  const calculateCosts = () => {
    const productPrice = parseFloat(formData.productPrice) || 0;
    const quantity = parseFloat(formData.quantity) || 1;
    const packingPercent = parseFloat(formData.packingCost) || 0;
    const inlandFreight = parseFloat(formData.inlandFreight) || 0;
    const portCharges = parseFloat(formData.portCharges) || 0;
    const customsClearance = parseFloat(formData.customsClearance) || 0;
    const oceanFreight = parseFloat(formData.oceanFreight) || 0;
    const insuranceRate = parseFloat(formData.insuranceRate) || 0;
    const importDutyRate = parseFloat(formData.importDutyRate) || 0;
    const rodtepRate = parseFloat(formData.rodtepRate) || 0;

    const productCost = productPrice * quantity;
    const packingCost = productCost * (packingPercent / 100);
    const fobValue = productCost + packingCost + inlandFreight + portCharges + customsClearance;
    const insurance = fobValue * (insuranceRate / 100);
    const cifValue = fobValue + oceanFreight + insurance;
    const importDuty = cifValue * (importDutyRate / 100);
    const totalLandedCost = cifValue + importDuty;
    const rodtepCredit = fobValue * (rodtepRate / 100);
    const netRealization = fobValue + rodtepCredit;

    setBreakdown({
      productCost,
      packingCost,
      inlandFreight,
      portCharges,
      customsClearance,
      fobValue,
      oceanFreight,
      insurance,
      cifValue,
      importDuty,
      totalLandedCost,
      rodtepCredit,
      netRealization,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Disclaimer:</strong> This calculator provides approximate estimates only. 
          Actual costs may vary based on shipping line, port, product type, and current rates.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Export Cost Calculator
            </CardTitle>
            <CardDescription>
              Enter your product and shipping details to calculate approximate export costs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productPrice">Product Price (₹/unit) *</Label>
                <Input
                  id="productPrice"
                  type="number"
                  placeholder="e.g., 500"
                  value={formData.productPrice}
                  onChange={(e) => setFormData({ ...formData, productPrice: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (units) *</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="e.g., 1000"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingType">Shipping Type (Incoterm)</Label>
              <Select value={formData.shippingType} onValueChange={(value) => setFormData({ ...formData, shippingType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fob">FOB (Free On Board)</SelectItem>
                  <SelectItem value="cif">CIF (Cost, Insurance & Freight)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2 border-t">
              <h4 className="font-medium mb-3 text-sm text-muted-foreground">Exporter Costs (India)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="packingCost">Packing Cost (%)</Label>
                  <Input
                    id="packingCost"
                    type="number"
                    value={formData.packingCost}
                    onChange={(e) => setFormData({ ...formData, packingCost: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inlandFreight">Inland Freight (₹)</Label>
                  <Input
                    id="inlandFreight"
                    type="number"
                    placeholder="Factory to port"
                    value={formData.inlandFreight}
                    onChange={(e) => setFormData({ ...formData, inlandFreight: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portCharges">Port Charges (₹)</Label>
                  <Input
                    id="portCharges"
                    type="number"
                    value={formData.portCharges}
                    onChange={(e) => setFormData({ ...formData, portCharges: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customsClearance">Customs Clearance (₹)</Label>
                  <Input
                    id="customsClearance"
                    type="number"
                    value={formData.customsClearance}
                    onChange={(e) => setFormData({ ...formData, customsClearance: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {formData.shippingType === 'cif' && (
              <div className="pt-2 border-t">
                <h4 className="font-medium mb-3 text-sm text-muted-foreground">CIF Additional Costs</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="oceanFreight">Ocean Freight (₹)</Label>
                    <Input
                      id="oceanFreight"
                      type="number"
                      placeholder="Shipping cost"
                      value={formData.oceanFreight}
                      onChange={(e) => setFormData({ ...formData, oceanFreight: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insuranceRate">Insurance Rate (%)</Label>
                    <Input
                      id="insuranceRate"
                      type="number"
                      step="0.1"
                      value={formData.insuranceRate}
                      onChange={(e) => setFormData({ ...formData, insuranceRate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 border-t">
              <h4 className="font-medium mb-3 text-sm text-muted-foreground">Destination & Incentives</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="importDutyRate">Import Duty Rate (%)</Label>
                  <Input
                    id="importDutyRate"
                    type="number"
                    value={formData.importDutyRate}
                    onChange={(e) => setFormData({ ...formData, importDutyRate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rodtepRate">RoDTEP Rate (%)</Label>
                  <Input
                    id="rodtepRate"
                    type="number"
                    step="0.1"
                    value={formData.rodtepRate}
                    onChange={(e) => setFormData({ ...formData, rodtepRate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <Button onClick={calculateCosts} className="w-full" disabled={!formData.productPrice || !formData.quantity}>
              <Calculator className="h-4 w-4 mr-2" />
              Calculate Export Costs
            </Button>
          </CardContent>
        </Card>

        {breakdown && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5" />
                Cost Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="exporter" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="exporter">Exporter View</TabsTrigger>
                  <TabsTrigger value="buyer">Buyer View</TabsTrigger>
                </TabsList>

                <TabsContent value="exporter" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Product Cost</span>
                      <span>{formatCurrency(breakdown.productCost)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Packing Cost</span>
                      <span>{formatCurrency(breakdown.packingCost)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Inland Freight</span>
                      <span>{formatCurrency(breakdown.inlandFreight)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Port Charges</span>
                      <span>{formatCurrency(breakdown.portCharges)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Customs Clearance</span>
                      <span>{formatCurrency(breakdown.customsClearance)}</span>
                    </div>
                    <div className="flex justify-between py-2 font-semibold text-primary border-b-2 border-primary">
                      <span>FOB Value</span>
                      <span>{formatCurrency(breakdown.fobValue)}</span>
                    </div>
                    
                    {formData.shippingType === 'cif' && (
                      <>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Ocean Freight</span>
                          <span>{formatCurrency(breakdown.oceanFreight)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Insurance</span>
                          <span>{formatCurrency(breakdown.insurance)}</span>
                        </div>
                        <div className="flex justify-between py-2 font-semibold text-primary border-b-2 border-primary">
                          <span>CIF Value</span>
                          <span>{formatCurrency(breakdown.cifValue)}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-800 dark:text-green-200">Incentives & Net Realization</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-green-200 dark:border-green-800">
                      <span className="text-green-700 dark:text-green-300">RoDTEP Credit</span>
                      <span className="text-green-600 font-medium">+ {formatCurrency(breakdown.rodtepCredit)}</span>
                    </div>
                    <div className="flex justify-between py-2 font-bold text-lg">
                      <span className="text-green-800 dark:text-green-200">Net Realization</span>
                      <span className="text-green-600">{formatCurrency(breakdown.netRealization)}</span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="buyer" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 font-semibold border-b-2 border-primary">
                      <span>{formData.shippingType === 'cif' ? 'CIF Value' : 'FOB Value'}</span>
                      <span>{formatCurrency(formData.shippingType === 'cif' ? breakdown.cifValue : breakdown.fobValue)}</span>
                    </div>
                    
                    {formData.shippingType === 'fob' && (
                      <>
                        <div className="flex justify-between py-2 border-b text-muted-foreground">
                          <span>+ Ocean Freight (buyer arranges)</span>
                          <span>Variable</span>
                        </div>
                        <div className="flex justify-between py-2 border-b text-muted-foreground">
                          <span>+ Insurance (buyer arranges)</span>
                          <span>Variable</span>
                        </div>
                      </>
                    )}
                    
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Import Duty ({formData.importDutyRate}%)</span>
                      <span>{formatCurrency(breakdown.importDuty)}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold text-blue-800 dark:text-blue-200">Total Landed Cost</span>
                    </div>
                    <div className="flex justify-between py-2 font-bold text-lg">
                      <span className="text-blue-800 dark:text-blue-200">Estimated Total</span>
                      <span className="text-blue-600">{formatCurrency(breakdown.totalLandedCost)}</span>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                      * Excludes destination port charges, local transport, and other import fees
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="text-lg">📊 FOB vs CIF: Quick Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-background rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                🚢 FOB (Free On Board)
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Lower risk for exporter
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Less capital tied up in shipping
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Buyer controls shipping cost
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">!</span>
                  Lower total invoice value
                </li>
              </ul>
            </div>
            <div className="p-4 bg-background rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                📦 CIF (Cost, Insurance & Freight)
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Higher invoice value (better for LC)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Buyer gets simple "all-in" pricing
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Better control over shipping partner
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">!</span>
                  More working capital needed
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CostCalculator;
