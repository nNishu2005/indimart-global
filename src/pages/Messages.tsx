import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Messages = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<{ id: string; name: string }[]>([]);
  const [selectedContact, setSelectedContact] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Load all users this person has messaged or received from
      const { data: msgs } = await supabase
        .from('messages')
        .select('sender_id, receiver_id')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      const contactIds = new Set<string>();
      msgs?.forEach(m => {
        if (m.sender_id !== user.id) contactIds.add(m.sender_id);
        if (m.receiver_id !== user.id) contactIds.add(m.receiver_id);
      });

      // Also load from quotes
      const { data: quotes } = await supabase
        .from('custom_quotes')
        .select('requester_id, responder_id')
        .or(`requester_id.eq.${user.id},responder_id.eq.${user.id}`);

      quotes?.forEach(q => {
        if (q.requester_id !== user.id) contactIds.add(q.requester_id);
        if (q.responder_id !== user.id) contactIds.add(q.responder_id);
      });

      if (contactIds.size > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, company_name')
          .in('id', Array.from(contactIds));

        setContacts(
          (profiles || []).map(p => ({
            id: p.id,
            name: p.company_name || p.full_name || 'Unknown',
          }))
        );
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!selectedContact || !userId) return;
    loadMessages();

    // Realtime subscription
    const channel = supabase
      .channel('messages-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const msg = payload.new as any;
        if (
          (msg.sender_id === userId && msg.receiver_id === selectedContact) ||
          (msg.sender_id === selectedContact && msg.receiver_id === userId)
        ) {
          setMessages(prev => [...prev, msg]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedContact, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    if (!userId || !selectedContact) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${selectedContact}),and(sender_id.eq.${selectedContact},receiver_id.eq.${userId})`
      )
      .order('created_at', { ascending: true });
    setMessages(data || []);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedContact || !userId) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: userId,
        receiver_id: selectedContact,
        message: newMessage.trim(),
      });
      if (error) throw error;
      setNewMessage('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" /> Messages
            </CardTitle>
            <div className="mt-2">
              <Select value={selectedContact} onValueChange={setSelectedContact}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a contact to chat..." />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] border rounded-lg p-4 overflow-y-auto mb-4 bg-muted/30">
              {!selectedContact ? (
                <p className="text-muted-foreground text-center py-8">Select a contact to start chatting</p>
              ) : messages.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No messages yet. Start the conversation!</p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`mb-3 flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                      msg.sender_id === userId
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border'
                    }`}>
                      <p>{msg.message}</p>
                      <p className="text-[10px] opacity-60 mt-1">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {selectedContact && (
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button onClick={handleSend} disabled={loading || !newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Messages;
