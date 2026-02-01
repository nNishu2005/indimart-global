import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to signup with ${provider}`,
        variant: "destructive",
      });
    }
  };

  const handleBuyerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("buyer-email") as string;
    const password = formData.get("buyer-password") as string;
    const firstName = formData.get("buyer-firstname") as string;
    const lastName = formData.get("buyer-lastname") as string;
    const company = formData.get("buyer-company") as string;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: firstName,
            last_name: lastName,
            company_name: company,
            role: 'buyer', // Role is assigned server-side via database trigger
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Account created successfully!",
      });

      navigate("/buyer/dashboard");
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create account";
      const isUserExists = errorMessage.toLowerCase().includes("already registered");
      
      toast({
        title: "Error",
        description: isUserExists 
          ? "This email is already registered. Please login instead." 
          : errorMessage,
        variant: "destructive",
      });
      
      if (isUserExists) {
        setTimeout(() => navigate("/login"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("supplier-email") as string;
    const password = formData.get("supplier-password") as string;
    const firstName = formData.get("supplier-firstname") as string;
    const lastName = formData.get("supplier-lastname") as string;
    const company = formData.get("supplier-company") as string;
    const phone = formData.get("supplier-phone") as string;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: firstName,
            last_name: lastName,
            company_name: company,
            phone: phone,
            role: 'supplier', // Role is assigned server-side via database trigger
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Account created successfully!",
      });

      navigate("/supplier/dashboard");
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create account";
      const isUserExists = errorMessage.toLowerCase().includes("already registered");
      
      toast({
        title: "Error",
        description: isUserExists 
          ? "This email is already registered. Please login instead." 
          : errorMessage,
        variant: "destructive",
      });
      
      if (isUserExists) {
        setTimeout(() => navigate("/login"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Join Indimart Global</h1>
              <p className="text-muted-foreground">
                Create your account and start trading globally
              </p>
            </div>

            <Tabs defaultValue="buyer" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="buyer">I'm a Buyer</TabsTrigger>
                <TabsTrigger value="supplier">I'm a Supplier</TabsTrigger>
              </TabsList>

              <TabsContent value="buyer">
                <form onSubmit={handleBuyerSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="buyer-firstname">First Name</Label>
                      <Input
                        id="buyer-firstname"
                        name="buyer-firstname"
                        placeholder="John"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="buyer-lastname">Last Name</Label>
                      <Input
                        id="buyer-lastname"
                        name="buyer-lastname"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buyer-email">Email</Label>
                    <Input
                      id="buyer-email"
                      name="buyer-email"
                      type="email"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buyer-company">Company Name</Label>
                    <Input
                      id="buyer-company"
                      name="buyer-company"
                      placeholder="Your Company Ltd."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buyer-password">Password</Label>
                    <Input
                      id="buyer-password"
                      name="buyer-password"
                      type="password"
                      placeholder="Create a strong password"
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="buyer-terms" required className="rounded" />
                    <label htmlFor="buyer-terms" className="text-sm text-muted-foreground">
                      I agree to the{" "}
                      <Link to="/terms" className="text-primary hover:underline">
                        Terms & Conditions
                      </Link>
                    </label>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? "Creating Account..." : "Create Buyer Account"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="supplier">
                <form onSubmit={handleSupplierSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="supplier-firstname">First Name</Label>
                      <Input
                        id="supplier-firstname"
                        name="supplier-firstname"
                        placeholder="John"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supplier-lastname">Last Name</Label>
                      <Input
                        id="supplier-lastname"
                        name="supplier-lastname"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supplier-email">Business Email</Label>
                    <Input
                      id="supplier-email"
                      name="supplier-email"
                      type="email"
                      placeholder="you@company.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supplier-company">Company Name</Label>
                    <Input
                      id="supplier-company"
                      name="supplier-company"
                      placeholder="Your Company Ltd."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supplier-phone">Business Phone</Label>
                    <Input
                      id="supplier-phone"
                      name="supplier-phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supplier-password">Password</Label>
                    <Input
                      id="supplier-password"
                      name="supplier-password"
                      type="password"
                      placeholder="Create a strong password"
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="supplier-terms" required className="rounded" />
                    <label htmlFor="supplier-terms" className="text-sm text-muted-foreground">
                      I agree to the{" "}
                      <Link to="/terms" className="text-primary hover:underline">
                        Terms & Conditions
                      </Link>
                    </label>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? "Creating Account..." : "Create Supplier Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => handleSocialLogin('facebook')}
                disabled={loading}
              >
                <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => handleSocialLogin('github')}
                disabled={loading}
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </Button>
            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
