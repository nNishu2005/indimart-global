import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Plus, MessageSquare } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  accepted: 'default',
  rejected: 'destructive',
  countered: 'outline',
};

const Quotes = () => {
  const navigate = useNavigate();
  const { role } = useUserRole();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('custom_quotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setQuotes(data);
      // Load profile names
      const ids = [...new Set(data.flatMap(q => [q.requester_id, q.responder_id]))];
      if (ids.length > 0) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, full_name, company_name')
          .in('id', ids);
        const map: Record<string, any> = {};
        profs?.forEach(p => { map[p.id] = p; });
        setProfiles(map);
      }
    }
  };

  const getName = (id: string) => {
    const p = profiles[id];
    return p?.company_name || p?.full_name || 'Unknown';
  };

  const handleUpdateStatus = async (quoteId: string, status: string) => {
    await supabase.from('custom_quotes').update({ status }).eq('id', quoteId);
    loadQuotes();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Custom Quotes</h1>
              <p className="text-sm text-muted-foreground">Manage your quote requests</p>
            </div>
          </div>
          {role === 'supplier' && (
            <Button onClick={() => navigate('/supplier/private-order')} className="gap-2">
              <Plus className="h-4 w-4" /> New Quote
            </Button>
          )}
          {role === 'buyer' && (
            <Button onClick={() => navigate('/buyer/request-quote')} className="gap-2">
              <Plus className="h-4 w-4" /> Request Quote
            </Button>
          )}
        </div>

        {quotes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No quotes yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {quotes.map((quote) => (
              <Card key={quote.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{quote.title}</h3>
                        <Badge variant={statusVariants[quote.status] || 'secondary'}>{quote.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        From: {getName(quote.requester_id)} → To: {getName(quote.responder_id)}
                      </p>
                      {quote.description && (
                        <p className="text-sm text-muted-foreground">{quote.description}</p>
                      )}
                      {quote.quoted_price && (
                        <p className="text-sm font-medium mt-1">
                          ₹{Number(quote.quoted_price).toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => navigate('/messages')} className="gap-1">
                        <MessageSquare className="h-3 w-3" /> Chat
                      </Button>
                      {quote.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => handleUpdateStatus(quote.id, 'accepted')}
                            variant="default">Accept</Button>
                          <Button size="sm" variant="destructive"
                            onClick={() => handleUpdateStatus(quote.id, 'rejected')}>Reject</Button>
                        </>
                      )}
                    </div>
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

export default Quotes;
