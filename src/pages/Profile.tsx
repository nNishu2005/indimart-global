import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { User } from "@supabase/supabase-js";
import { Camera, User as UserIcon, Building2, FileText, Upload, Loader2, Trash2, CheckCircle, Clock, FileWarning } from "lucide-react";

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  company_name: string | null;
  company_description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  pincode: string | null;
  gst_number: string | null;
  pan_number: string | null;
  is_verified: boolean | null;
  created_at: string;
  updated_at: string;
}

interface Document {
  id: string;
  user_id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  is_verified: boolean | null;
  created_at: string;
}

const DOCUMENT_TYPES = [
  { value: 'gst_certificate', label: 'GST Certificate' },
  { value: 'trade_license', label: 'Trade License' },
  { value: 'incorporation_certificate', label: 'Incorporation Certificate' },
  { value: 'pan_card', label: 'PAN Card' },
  { value: 'msme_certificate', label: 'MSME Certificate' },
  { value: 'iso_certificate', label: 'ISO Certificate' },
  { value: 'export_license', label: 'Export License' },
  { value: 'import_license', label: 'Import License' },
  { value: 'other', label: 'Other Document' },
];

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role } = useUserRole();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState(DOCUMENT_TYPES[0].value);
  
  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [pincode, setPincode] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");

  const fetchDocuments = async (userId: string) => {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setDocuments(data);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      setUser(user);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      } else if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setCompanyName(data.company_name || "");
        setCompanyDescription(data.company_description || "");
        setAddress(data.address || "");
        setCity(data.city || "");
        setState(data.state || "");
        setCountry(data.country || "");
        setPincode(data.pincode || "");
        setGstNumber(data.gst_number || "");
        setPanNumber(data.pan_number || "");
      }
      
      // Fetch documents
      await fetchDocuments(user.id);
      
      setLoading(false);
    };

    checkUser();
  }, [navigate, toast]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingAvatar(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);

      toast({
        title: "Success",
        description: role === 'supplier' ? "Logo updated successfully" : "Profile photo updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    try {
      const updates: Partial<Profile> = {
        full_name: fullName,
        phone,
        company_name: companyName,
        company_description: companyDescription,
        address,
        city,
        state,
        country,
        pincode,
        gst_number: gstNumber,
        pan_number: panNumber,
      };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (data) setProfile(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or image file (JPG, PNG, WebP)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingDocument(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${selectedDocType}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('business-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save document record
      const { error: insertError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          document_type: selectedDocType,
          file_name: file.name,
          file_path: fileName,
          file_size: file.size,
        });

      if (insertError) throw insertError;

      await fetchDocuments(user.id);

      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setUploadingDocument(false);
      if (documentInputRef.current) {
        documentInputRef.current.value = '';
      }
    }
  };

  const handleDeleteDocument = async (doc: Document) => {
    if (!user) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('business-documents')
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      // Delete record
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id);

      if (deleteError) throw deleteError;

      setDocuments(prev => prev.filter(d => d.id !== doc.id));

      toast({
        title: "Document deleted",
        description: "Your document has been removed",
      });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    return DOCUMENT_TYPES.find(dt => dt.value === type)?.label || type;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getInitials = () => {
    if (fullName) {
      return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return profile?.email?.charAt(0).toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <Card className="p-6 md:p-8 mb-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Avatar Section */}
                <div className="relative group">
                  <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                    <AvatarImage src={profile?.avatar_url || ''} alt={fullName || 'Profile'} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    ) : (
                      <Camera className="h-8 w-8 text-white" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl md:text-3xl font-bold mb-1">
                    {fullName || 'Complete Your Profile'}
                  </h1>
                  <p className="text-muted-foreground mb-2">{profile?.email}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    {role && (
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm capitalize">
                        {role}
                      </span>
                    )}
                    {profile?.is_verified && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm">
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>

                {/* Logout Button */}
                <Button variant="outline" onClick={handleLogout} className="shrink-0">
                  Logout
                </Button>
              </div>
            </Card>

            {/* Profile Form Tabs */}
            <Card className="p-6 md:p-8">
              <form onSubmit={handleUpdateProfile}>
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className={`grid w-full ${role === 'buyer' ? 'grid-cols-1' : 'grid-cols-3'} mb-6`}>
                    <TabsTrigger value="personal" className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Personal</span>
                    </TabsTrigger>
                    {role !== 'buyer' && (
                      <>
                        <TabsTrigger value="company" className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Company</span>
                        </TabsTrigger>
                        <TabsTrigger value="documents" className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="hidden sm:inline">Documents</span>
                        </TabsTrigger>
                      </>
                    )}
                  </TabsList>

                  {/* Personal Info Tab */}
                  <TabsContent value="personal" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          placeholder="Enter your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile?.email || ""}
                          disabled
                          className="bg-muted"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+91 9876543210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        placeholder="Enter your full address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          placeholder="Mumbai"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          placeholder="Maharashtra"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          placeholder="India"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input
                          id="pincode"
                          placeholder="400001"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Company Info Tab */}
                  <TabsContent value="company" className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">
                        {role === 'supplier' ? 'Company Name' : 'Company/Organization Name (Optional)'}
                      </Label>
                      <Input
                        id="companyName"
                        placeholder="Enter company name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyDescription">
                        {role === 'supplier' ? 'Company Description' : 'About (Optional)'}
                      </Label>
                      <Textarea
                        id="companyDescription"
                        placeholder={role === 'supplier' 
                          ? "Describe your company, products, and services..."
                          : "Tell us about yourself or your organization..."
                        }
                        value={companyDescription}
                        onChange={(e) => setCompanyDescription(e.target.value)}
                        rows={4}
                      />
                    </div>

                    {role === 'supplier' && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">Tip for Suppliers</h4>
                        <p className="text-sm text-muted-foreground">
                          A complete company profile helps buyers find and trust you. Add your logo, 
                          detailed description, and business documents to increase your visibility.
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Documents Tab */}
                  <TabsContent value="documents" className="space-y-6">
                    {/* GST and PAN Numbers */}
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="gstNumber">GST Number</Label>
                        <Input
                          id="gstNumber"
                          placeholder="22AAAAA0000A1Z5"
                          value={gstNumber}
                          onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                        />
                        <p className="text-xs text-muted-foreground">
                          15-digit GST identification number
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="panNumber">PAN Number</Label>
                        <Input
                          id="panNumber"
                          placeholder="AAAAA0000A"
                          value={panNumber}
                          onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                        />
                        <p className="text-xs text-muted-foreground">
                          10-digit Permanent Account Number
                        </p>
                      </div>
                    </div>

                    {/* Document Upload Section */}
                    <div className="border-t pt-6">
                      <h3 className="font-semibold mb-4">Upload Business Documents</h3>
                      
                      <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <select
                          value={selectedDocType}
                          onChange={(e) => setSelectedDocType(e.target.value)}
                          className="flex h-10 w-full sm:w-auto rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {DOCUMENT_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                        
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => documentInputRef.current?.click()}
                          disabled={uploadingDocument}
                          className="flex-1 sm:flex-none"
                        >
                          {uploadingDocument ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Document
                            </>
                          )}
                        </Button>
                        <input
                          ref={documentInputRef}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          onChange={handleDocumentUpload}
                          className="hidden"
                        />
                      </div>

                      <p className="text-xs text-muted-foreground mb-4">
                        Accepted formats: PDF, JPG, PNG, WebP (Max 10MB)
                      </p>

                      {/* Uploaded Documents List */}
                      {documents.length > 0 ? (
                        <div className="space-y-3">
                          {documents.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between p-4 border rounded-lg bg-muted/30"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{getDocumentTypeLabel(doc.document_type)}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {doc.file_name} • {formatFileSize(doc.file_size)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {doc.is_verified ? (
                                  <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                    <CheckCircle className="h-4 w-4" />
                                    Verified
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                                    <Clock className="h-4 w-4" />
                                    Pending
                                  </span>
                                )}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteDocument(doc)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 border-2 border-dashed rounded-lg">
                          <FileWarning className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                          <p className="text-muted-foreground">No documents uploaded yet</p>
                          <p className="text-sm text-muted-foreground">
                            Upload your business certificates and licenses for verification
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Why provide these documents?</h4>
                      <p className="text-sm text-muted-foreground">
                        Verified business documents help establish trust with trading partners 
                        and may be required for certain transactions. Your documents are stored 
                        securely and only shared when necessary.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Save Button */}
                <div className="mt-8 flex justify-end">
                  <Button type="submit" disabled={saving} size="lg">
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
