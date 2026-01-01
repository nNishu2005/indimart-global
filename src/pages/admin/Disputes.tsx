import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertTriangle, ArrowLeft, Calendar, User, 
  CheckCircle, Clock, MessageSquare
} from 'lucide-react';

interface Dispute {
  id: string;
  subject: string;
  description: string;
  status: string;
  resolution: string | null;
  created_at: string;
  complainant_id: string;
  respondent_id: string;
  complainant?: { email: string | null; company_name: string | null };
  respondent?: { email: string | null; company_name: string | null };
}

const Disputes = () => {
  const { toast } = useToast();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState('');
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    const { data } = await supabase
      .from('disputes')
      .select('*')
      .order('created_at', { ascending: false });

    // Fetch user info
    const disputesWithUsers = await Promise.all(
      (data || []).map(async (dispute) => {
        const [complainant, respondent] = await Promise.all([
          supabase.from('profiles').select('email, company_name').eq('id', dispute.complainant_id).single(),
          supabase.from('profiles').select('email, company_name').eq('id', dispute.respondent_id).single(),
        ]);
        
        return { 
          ...dispute, 
          complainant: complainant.data,
          respondent: respondent.data 
        };
      })
    );

    setDisputes(disputesWithUsers);
    setLoading(false);
  };

  const handleUpdateDispute = async () => {
    if (!selectedDispute) return;

    const updates: any = {};
    if (newStatus) updates.status = newStatus;
    if (resolution) updates.resolution = resolution;

    if (Object.keys(updates).length === 0) {
      toast({ title: 'No changes', description: 'Please make changes before updating' });
      return;
    }

    const { error } = await supabase
      .from('disputes')
      .update(updates)
      .eq('id', selectedDispute.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Updated', description: 'Dispute has been updated' });
      setSelectedDispute(null);
      setResolution('');
      setNewStatus('');
      loadDisputes();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="destructive">Open</Badge>;
      case 'in_progress':
        return <Badge variant="default">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'closed':
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/admin/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dispute Management</h1>
          <p className="text-muted-foreground">Review and resolve disputes between buyers and suppliers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open</p>
                  <p className="text-2xl font-bold">{disputes.filter(d => d.status === 'open').length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{disputes.filter(d => d.status === 'in_progress').length}</p>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold">{disputes.filter(d => d.status === 'resolved').length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{disputes.length}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading disputes...</p>
          </div>
        ) : disputes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">No Disputes</h3>
              <p className="text-muted-foreground">There are no disputes to review</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {disputes.map(dispute => (
              <Card key={dispute.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{dispute.subject}</h3>
                        {getStatusBadge(dispute.status)}
                      </div>

                      <p className="text-muted-foreground mb-4">{dispute.description}</p>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1 text-muted-foreground" />
                          Complainant: {dispute.complainant?.company_name || dispute.complainant?.email || 'Unknown'}
                        </span>
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1 text-muted-foreground" />
                          Respondent: {dispute.respondent?.company_name || dispute.respondent?.email || 'Unknown'}
                        </span>
                        <span className="flex items-center text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(dispute.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {dispute.resolution && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium">Resolution:</p>
                          <p className="text-sm text-muted-foreground">{dispute.resolution}</p>
                        </div>
                      )}
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button onClick={() => {
                          setSelectedDispute(dispute);
                          setNewStatus(dispute.status);
                          setResolution(dispute.resolution || '');
                        }}>
                          Manage
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Manage Dispute</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4 mt-4">
                          <div className="p-4 bg-muted rounded-lg">
                            <h4 className="font-semibold mb-2">{selectedDispute?.subject}</h4>
                            <p className="text-sm text-muted-foreground">{selectedDispute?.description}</p>
                          </div>

                          <div className="space-y-2">
                            <Label>Update Status</Label>
                            <Select value={newStatus} onValueChange={setNewStatus}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Resolution Notes</Label>
                            <Textarea
                              rows={4}
                              value={resolution}
                              onChange={(e) => setResolution(e.target.value)}
                              placeholder="Enter resolution details..."
                            />
                          </div>

                          <Button className="w-full" onClick={handleUpdateDispute}>
                            Update Dispute
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Disputes;