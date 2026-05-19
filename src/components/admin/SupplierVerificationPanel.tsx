import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ShieldCheck, Shield, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from 'react-router-dom';

interface SupplierRow {
  id: string;
  full_name: string | null;
  company_name: string | null;
  email: string | null;
  is_verified: boolean | null;
  totalDocs: number;
  verifiedDocs: number;
}

const SupplierVerificationPanel = () => {
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'supplier');

    const supplierIds = (roles || []).map(r => r.user_id);
    if (supplierIds.length === 0) {
      setSuppliers([]);
      setLoading(false);
      return;
    }

    const [{ data: profiles }, { data: docs }] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, company_name, email, is_verified')
        .in('id', supplierIds),
      supabase
        .from('documents')
        .select('user_id, is_verified')
        .in('user_id', supplierIds),
    ]);

    const docMap = new Map<string, { total: number; verified: number }>();
    docs?.forEach(d => {
      const ex = docMap.get(d.user_id) || { total: 0, verified: 0 };
      ex.total++;
      if (d.is_verified) ex.verified++;
      docMap.set(d.user_id, ex);
    });

    const rows: SupplierRow[] = (profiles || []).map(p => {
      const s = docMap.get(p.id) || { total: 0, verified: 0 };
      return { ...p, totalDocs: s.total, verifiedDocs: s.verified };
    });

    // Sort: eligible-unverified first, then unverified, then verified
    rows.sort((a, b) => {
      const aEligible = !a.is_verified && a.totalDocs > 0 && a.verifiedDocs === a.totalDocs ? 0 : !a.is_verified ? 1 : 2;
      const bEligible = !b.is_verified && b.totalDocs > 0 && b.verifiedDocs === b.totalDocs ? 0 : !b.is_verified ? 1 : 2;
      return aEligible - bEligible;
    });

    setSuppliers(rows);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggle = async (s: SupplierRow) => {
    if (!s.is_verified) {
      if (s.totalDocs === 0) {
        toast({ title: 'Cannot verify', description: 'No documents uploaded by this supplier.', variant: 'destructive' });
        return;
      }
      if (s.verifiedDocs < s.totalDocs) {
        toast({ title: 'Cannot verify', description: `Only ${s.verifiedDocs}/${s.totalDocs} documents are verified.`, variant: 'destructive' });
        return;
      }
    }
    setBusyId(s.id);
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: !s.is_verified })
      .eq('id', s.id);
    setBusyId(null);

    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: !s.is_verified ? 'Supplier verified ✅' : 'Badge removed' });
    setSuppliers(prev => prev.map(x => x.id === s.id ? { ...x, is_verified: !s.is_verified } : x));
  };

  const eligible = suppliers.filter(s => !s.is_verified && s.totalDocs > 0 && s.verifiedDocs === s.totalDocs);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            Supplier Verification
          </CardTitle>
          {eligible.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {eligible.length} supplier{eligible.length > 1 ? 's' : ''} eligible for badge
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/users">View All Users</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : suppliers.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No suppliers registered yet.</p>
        ) : (
          <TooltipProvider>
            <div className="divide-y">
              {suppliers.slice(0, 10).map(s => {
                const canVerify = s.totalDocs > 0 && s.verifiedDocs === s.totalDocs;
                return (
                  <div key={s.id} className="flex items-center justify-between py-3 gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{s.company_name || s.full_name || 'Unnamed'}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-sm">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          <span className={canVerify ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                            {s.verifiedDocs}/{s.totalDocs}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {s.totalDocs === 0 ? 'No documents uploaded' : `${s.verifiedDocs} of ${s.totalDocs} documents verified`}
                      </TooltipContent>
                    </Tooltip>
                    {s.is_verified ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        <ShieldCheck className="h-3 w-3 mr-1" /> Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        <Shield className="h-3 w-3 mr-1" /> Unverified
                      </Badge>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            size="sm"
                            variant={s.is_verified ? 'outline' : 'default'}
                            disabled={busyId === s.id || (!s.is_verified && !canVerify)}
                            onClick={() => toggle(s)}
                          >
                            {busyId === s.id ? <Loader2 className="h-3 w-3 animate-spin" /> : s.is_verified ? 'Remove' : 'Give Badge'}
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {!s.is_verified && !canVerify && (
                        <TooltipContent className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          All documents must be verified first
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </div>
                );
              })}
            </div>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
};

export default SupplierVerificationPanel;
