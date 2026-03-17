import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, CheckCircle, XCircle, FileText, 
  Calendar, User, Download, Eye, Clock, ShieldCheck
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Document {
  id: string;
  user_id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  is_verified: boolean | null;
  created_at: string;
  updated_at: string;
  user?: { 
    full_name: string | null; 
    email: string | null; 
    company_name: string | null;
    is_verified: boolean | null;
  };
  role?: string;
}

const documentTypeLabels: Record<string, string> = {
  'gst_certificate': 'GST Certificate',
  'pan_card': 'PAN Card',
  'trade_license': 'Trade License',
  'incorporation_cert': 'Certificate of Incorporation',
  'msme_certificate': 'MSME Certificate',
  'import_export_license': 'Import/Export License',
  'quality_certificate': 'Quality Certificate',
  'other': 'Other Document'
};

const VerifyDocuments = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [filter, setFilter] = useState<'pending' | 'verified' | 'all'>('pending');

  useEffect(() => { loadDocuments(); }, [filter]);

  const loadDocuments = async () => {
    setLoading(true);
    
    let query = supabase.from('documents').select('*').order('created_at', { ascending: false });
    if (filter === 'pending') query = query.eq('is_verified', false);
    else if (filter === 'verified') query = query.eq('is_verified', true);

    const { data } = await query;

    const documentsWithUsers = await Promise.all(
      (data || []).map(async (doc) => {
        const [profileResult, roleResult] = await Promise.all([
          supabase.from('profiles').select('full_name, email, company_name, is_verified').eq('id', doc.user_id).single(),
          supabase.from('user_roles').select('role').eq('user_id', doc.user_id).single()
        ]);
        return { ...doc, user: profileResult.data, role: roleResult.data?.role };
      })
    );

    setDocuments(documentsWithUsers);
    setLoading(false);
  };

  const handleVerify = async (documentId: string) => {
    const { error } = await supabase.from('documents')
      .update({ is_verified: true, updated_at: new Date().toISOString() })
      .eq('id', documentId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Document Verified ✅' });
      loadDocuments();
    }
  };

  const handleReject = async (documentId: string) => {
    const { error } = await supabase.from('documents')
      .update({ is_verified: false, updated_at: new Date().toISOString() })
      .eq('id', documentId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Document Rejected' });
      loadDocuments();
    }
  };

  const handleGrantBadge = async (userId: string) => {
    // Check all docs for this user are verified
    const userDocs = documents.filter(d => d.user_id === userId);
    const allVerified = userDocs.length > 0 && userDocs.every(d => d.is_verified);
    
    if (!allVerified) {
      toast({ title: 'Cannot grant badge', description: 'All documents must be verified first.', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('profiles').update({ is_verified: true }).eq('id', userId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Verified Badge Granted! 🎉' });
      loadDocuments();
    }
  };

  const handlePreview = async (doc: Document) => {
    setSelectedDocument(doc);
    const { data } = await supabase.storage.from('business-documents').createSignedUrl(doc.file_path, 3600);
    if (data?.signedUrl) setPreviewUrl(data.signedUrl);
  };

  const handleDownload = async (doc: Document) => {
    const { data } = await supabase.storage.from('business-documents').createSignedUrl(doc.file_path, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Group docs by user to show "Grant Badge" button
  const userDocGroups = new Map<string, { docs: Document[]; allVerified: boolean; profileVerified: boolean }>();
  documents.forEach(doc => {
    const group = userDocGroups.get(doc.user_id) || { docs: [], allVerified: true, profileVerified: doc.user?.is_verified ?? false };
    group.docs.push(doc);
    if (!doc.is_verified) group.allVerified = false;
    userDocGroups.set(doc.user_id, group);
  });

  const pendingCount = documents.filter(d => !d.is_verified).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/admin/dashboard"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard</Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Document Verification</h1>
          <p className="text-muted-foreground">Review and verify business documents. All documents must be verified before a user can receive the Verified Badge.</p>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mb-6">
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" /> Pending
              {pendingCount > 0 && <Badge variant="secondary" className="ml-1">{pendingCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="verified" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" /> Verified
            </TabsTrigger>
            <TabsTrigger value="all">All Documents</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="text-center py-12"><p className="text-muted-foreground">Loading documents...</p></div>
        ) : documents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">{filter === 'pending' ? 'All Caught Up!' : 'No Documents'}</h3>
              <p className="text-muted-foreground">
                {filter === 'pending' ? 'No documents pending verification' : 'No documents found in this category'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {documents.map(doc => {
              const group = userDocGroups.get(doc.user_id);
              const showBadgeButton = group && group.allVerified && !group.profileVerified && doc === group.docs[0];

              return (
                <Card key={doc.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{documentTypeLabels[doc.document_type] || doc.document_type}</h3>
                            <p className="text-sm text-muted-foreground">{doc.file_name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={doc.is_verified ? "default" : "outline"}>
                              {doc.is_verified ? 'Verified' : 'Pending'}
                            </Badge>
                            {doc.user?.is_verified && (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                <ShieldCheck className="h-3 w-3 mr-1" /> Badge Granted
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm mb-4">
                          <span className="text-muted-foreground">{formatFileSize(doc.file_size)}</span>
                          <span className="flex items-center text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />{new Date(doc.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        {doc.user && (
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center text-muted-foreground">
                              <User className="h-4 w-4 mr-1" />
                              {doc.user.company_name || doc.user.full_name || doc.user.email}
                            </span>
                            {doc.role && <Badge variant="secondary" className="capitalize">{doc.role}</Badge>}
                          </div>
                        )}

                        {/* Grant Badge CTA when all docs verified but profile not yet */}
                        {showBadgeButton && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                            <span className="text-sm text-green-800 font-medium">
                              ✅ All {group.docs.length} document(s) verified — ready for Verified Badge
                            </span>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleGrantBadge(doc.user_id)}>
                              <ShieldCheck className="h-4 w-4 mr-1" /> Grant Badge
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" onClick={() => handlePreview(doc)}>
                              <Eye className="h-4 w-4 mr-2" /> Preview
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh]">
                            <DialogHeader>
                              <DialogTitle>
                                {selectedDocument && (documentTypeLabels[selectedDocument.document_type] || selectedDocument.document_type)}
                              </DialogTitle>
                            </DialogHeader>
                            {previewUrl && selectedDocument && (
                              <div className="space-y-4 mt-4">
                                <div className="bg-muted rounded-lg overflow-hidden max-h-[60vh]">
                                  {selectedDocument.file_name.toLowerCase().endsWith('.pdf') ? (
                                    <iframe src={previewUrl} className="w-full h-[60vh]" title="Document Preview" />
                                  ) : (
                                    <img src={previewUrl} alt="Document" className="w-full h-auto max-h-[60vh] object-contain" />
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div><strong>File:</strong> {selectedDocument.file_name}</div>
                                  <div><strong>Size:</strong> {formatFileSize(selectedDocument.file_size)}</div>
                                  <div><strong>Uploaded:</strong> {new Date(selectedDocument.created_at).toLocaleString()}</div>
                                  <div><strong>User:</strong> {selectedDocument.user?.company_name || selectedDocument.user?.email}</div>
                                </div>
                              </div>
                            )}
                            <DialogFooter className="gap-2">
                              <Button variant="outline" onClick={() => selectedDocument && handleDownload(selectedDocument)}>
                                <Download className="h-4 w-4 mr-2" /> Download
                              </Button>
                              {selectedDocument && !selectedDocument.is_verified && (
                                <>
                                  <Button variant="destructive" onClick={() => { handleReject(selectedDocument.id); setPreviewUrl(null); }}>
                                    <XCircle className="h-4 w-4 mr-2" /> Reject
                                  </Button>
                                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => { handleVerify(selectedDocument.id); setPreviewUrl(null); }}>
                                    <CheckCircle className="h-4 w-4 mr-2" /> Verify
                                  </Button>
                                </>
                              )}
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <Button variant="outline" onClick={() => handleDownload(doc)}>
                          <Download className="h-4 w-4 mr-2" /> Download
                        </Button>

                        {!doc.is_verified && (
                          <>
                            <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleVerify(doc.id)}>
                              <CheckCircle className="h-4 w-4 mr-2" /> Verify
                            </Button>
                            <Button variant="destructive" onClick={() => handleReject(doc.id)}>
                              <XCircle className="h-4 w-4 mr-2" /> Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default VerifyDocuments;
