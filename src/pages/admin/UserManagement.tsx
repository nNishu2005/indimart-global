import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Search, Shield, ShieldCheck, Users, Mail, FileText, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UserData {
  id: string;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  is_verified: boolean | null;
  created_at: string;
  city: string | null;
  state: string | null;
  country: string | null;
  phone: string | null;
  role: string | null;
  totalDocs: number;
  verifiedDocs: number;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all');

  const loadUsers = async () => {
    setLoading(true);
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error loading users', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    if (!profiles) { setLoading(false); return; }

    // Fetch roles and documents in parallel
    const [rolesResult, docsResult] = await Promise.all([
      supabase.from('user_roles').select('user_id, role'),
      supabase.from('documents').select('user_id, is_verified'),
    ]);

    const roleMap = new Map<string, string>();
    rolesResult.data?.forEach(r => roleMap.set(r.user_id, r.role));

    // Build doc stats per user
    const docStats = new Map<string, { total: number; verified: number }>();
    docsResult.data?.forEach(d => {
      const existing = docStats.get(d.user_id) || { total: 0, verified: 0 };
      existing.total++;
      if (d.is_verified) existing.verified++;
      docStats.set(d.user_id, existing);
    });

    const merged: UserData[] = profiles.map(p => {
      const stats = docStats.get(p.id) || { total: 0, verified: 0 };
      return {
        ...p,
        role: roleMap.get(p.id) || null,
        totalDocs: stats.total,
        verifiedDocs: stats.verified,
      };
    });

    setUsers(merged);
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const toggleVerification = async (user: UserData) => {
    // If granting badge, check documents first
    if (!user.is_verified) {
      if (user.totalDocs === 0) {
        toast({ title: 'Cannot verify', description: 'This user has no uploaded documents. Documents must be uploaded and verified first.', variant: 'destructive' });
        return;
      }
      if (user.verifiedDocs < user.totalDocs) {
        toast({ title: 'Cannot verify', description: `Only ${user.verifiedDocs}/${user.totalDocs} documents are verified. All documents must be verified first.`, variant: 'destructive' });
        return;
      }
    }

    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: !user.is_verified })
      .eq('id', user.id);

    if (error) {
      toast({ title: 'Error updating verification', variant: 'destructive' });
    } else {
      toast({ title: !user.is_verified ? 'User verified! ✅' : 'Verification removed' });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_verified: !user.is_verified } : u));
    }
  };

  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = !search || 
        (u.full_name?.toLowerCase().includes(search.toLowerCase())) ||
        (u.email?.toLowerCase().includes(search.toLowerCase())) ||
        (u.company_name?.toLowerCase().includes(search.toLowerCase()));
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesVerified = verifiedFilter === 'all' || 
        (verifiedFilter === 'verified' && u.is_verified) ||
        (verifiedFilter === 'unverified' && !u.is_verified);
      return matchesSearch && matchesRole && matchesVerified;
    });
  }, [users, search, roleFilter, verifiedFilter]);

  const stats = useMemo(() => ({
    total: users.length,
    buyers: users.filter(u => u.role === 'buyer').length,
    suppliers: users.filter(u => u.role === 'supplier').length,
    verified: users.filter(u => u.is_verified).length,
  }), [users]);

  const canGrantBadge = (user: UserData) => user.totalDocs > 0 && user.verifiedDocs === user.totalDocs;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/admin/dashboard"><ArrowLeft className="h-4 w-4 mr-1" /> Admin Dashboard</Link>
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground mb-6">Manage all platform users, verify suppliers, and assign badges</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{stats.buyers}</p>
            <p className="text-sm text-muted-foreground">Buyers</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{stats.suppliers}</p>
            <p className="text-sm text-muted-foreground">Suppliers</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
            <p className="text-sm text-muted-foreground">Verified</p>
          </CardContent></Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name, email, or company..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="buyer">Buyers</SelectItem>
                  <SelectItem value="supplier">Suppliers</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
              <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
                <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground py-8 text-center">Loading users...</p>
            ) : filtered.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">No users found</p>
            ) : (
              <div className="overflow-x-auto">
                <TooltipProvider>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Docs</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map(user => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.full_name || '—'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{user.email || '—'}</span>
                            </div>
                          </TableCell>
                          <TableCell>{user.company_name || '—'}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'default' : user.role === 'supplier' ? 'secondary' : 'outline'}>
                              {user.role || 'none'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 text-sm">
                                  <FileText className="h-3 w-3 text-muted-foreground" />
                                  <span className={user.totalDocs > 0 && user.verifiedDocs === user.totalDocs ? 'text-green-600 font-medium' : ''}>
                                    {user.verifiedDocs}/{user.totalDocs}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {user.totalDocs === 0 
                                  ? 'No documents uploaded' 
                                  : `${user.verifiedDocs} of ${user.totalDocs} documents verified`}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell className="text-sm">
                            {format(new Date(user.created_at), 'dd MMM yyyy')}
                          </TableCell>
                          <TableCell>
                            {user.is_verified ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                <ShieldCheck className="h-3 w-3 mr-1" /> Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">
                                <Shield className="h-3 w-3 mr-1" /> Unverified
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <Button
                                    size="sm"
                                    variant={user.is_verified ? 'outline' : 'default'}
                                    onClick={() => toggleVerification(user)}
                                    disabled={!user.is_verified && !canGrantBadge(user)}
                                  >
                                    {user.is_verified ? 'Remove Badge' : 'Give Badge'}
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              {!user.is_verified && !canGrantBadge(user) && (
                                <TooltipContent className="flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  All documents must be verified first
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TooltipProvider>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default UserManagement;
