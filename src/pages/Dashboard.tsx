import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Plus, 
  FileText, 
  MessageSquare,
  BarChart3
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }
      
      setUser(session.user);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const stats = [
    { 
      title: "Total Products", 
      value: "24", 
      icon: Package, 
      trend: "+12%",
      description: "vs last month"
    },
    { 
      title: "Active Orders", 
      value: "8", 
      icon: ShoppingCart, 
      trend: "+5%",
      description: "pending delivery"
    },
    { 
      title: "Network Connections", 
      value: "156", 
      icon: Users, 
      trend: "+23%",
      description: "growing network"
    },
    { 
      title: "Revenue", 
      value: "₹45.2K", 
      icon: TrendingUp, 
      trend: "+18%",
      description: "this month"
    },
  ];

  const recentActivity = [
    { action: "New order received", time: "2 hours ago", type: "order" },
    { action: "Product listing approved", time: "5 hours ago", type: "product" },
    { action: "New connection request", time: "1 day ago", type: "network" },
    { action: "Payment received", time: "2 days ago", type: "payment" },
    { action: "Review posted on your product", time: "3 days ago", type: "review" },
  ];

  const quickActions = [
    { 
      title: "Add Product", 
      description: "List a new product", 
      icon: Plus, 
      action: () => navigate("/supplier/add-product"),
      variant: "default" as const
    },
    { 
      title: "View Orders", 
      description: "Manage your orders", 
      icon: FileText, 
      action: () => navigate("/supplier/orders"),
      variant: "secondary" as const
    },
    { 
      title: "Messages", 
      description: "Check messages", 
      icon: MessageSquare, 
      action: () => navigate("/messages"),
      variant: "secondary" as const
    },
    { 
      title: "Analytics", 
      description: "View detailed reports", 
      icon: BarChart3, 
      action: () => navigate("/analytics"),
      variant: "secondary" as const
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user?.email?.split('@')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your business today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-primary font-medium">{stat.trend}</span> {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.title}
                    variant={action.variant}
                    className="w-full justify-start h-auto py-4"
                    onClick={action.action}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">{action.title}</div>
                      <div className="text-sm opacity-80">{action.description}</div>
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest business updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Business Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="network">Network</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="text-sm text-muted-foreground">
                  Your business is performing well this month. Sales are up 18% compared to last month.
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Conversion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">3.2%</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Avg. Order Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₹5,640</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Customer Rating</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">4.8/5</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="products" className="mt-4">
                <div className="text-sm text-muted-foreground">
                  Manage your product listings, inventory, and pricing here.
                </div>
                <Button className="mt-4" onClick={() => navigate("/products")}>
                  View All Products
                </Button>
              </TabsContent>
              <TabsContent value="network" className="mt-4">
                <div className="text-sm text-muted-foreground">
                  Connect with buyers and suppliers to expand your business network.
                </div>
                <Button className="mt-4" onClick={() => navigate("/about")}>
                  Explore Network
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
