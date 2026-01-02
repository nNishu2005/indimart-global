import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Products from "./pages/Products";
import CategoriesPage from "./pages/CategoriesPage";
import HowItWorks from "./pages/HowItWorks";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import ComparisonDashboard from "./pages/ComparisonDashboard";
import NotFound from "./pages/NotFound";

// Buyer Pages
import BuyerDashboard from "./pages/buyer/BuyerDashboard";
import BuyerOrders from "./pages/buyer/Orders";
import SupplierList from "./pages/buyer/SupplierList";
import SupplierProfile from "./pages/buyer/SupplierProfile";
import CreateRFQ from "./pages/buyer/CreateRFQ";

// Supplier Pages
import SupplierDashboard from "./pages/supplier/SupplierDashboard";
import AddProduct from "./pages/supplier/AddProduct";
import EditProduct from "./pages/supplier/EditProduct";
import ProductList from "./pages/supplier/ProductList";
import ProductLibrary from "./pages/supplier/ProductLibrary";
import SupplierOrders from "./pages/supplier/Orders";
import RFQInbox from "./pages/supplier/RFQInbox";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ApproveProducts from "./pages/admin/ApproveProducts";
import Disputes from "./pages/admin/Disputes";
import VerifyDocuments from "./pages/admin/VerifyDocuments";

// Shared Pages
import Messages from "./pages/Messages";
import Analytics from "./pages/Analytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/comparison" element={<ComparisonDashboard />} />
          <Route path="/suppliers" element={<SupplierList />} />
          <Route path="/supplier/:id" element={<SupplierProfile />} />
          
          {/* Legacy Dashboard (redirect based on role) */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Buyer Routes */}
          <Route path="/buyer/dashboard" element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <BuyerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/buyer/orders" element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <BuyerOrders />
            </ProtectedRoute>
          } />
          <Route path="/buyer/create-rfq" element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <CreateRFQ />
            </ProtectedRoute>
          } />
          
          {/* Supplier Routes */}
          <Route path="/supplier/dashboard" element={
            <ProtectedRoute allowedRoles={['supplier']}>
              <SupplierDashboard />
            </ProtectedRoute>
          } />
          <Route path="/supplier/add-product" element={
            <ProtectedRoute allowedRoles={['supplier']}>
              <AddProduct />
            </ProtectedRoute>
          } />
          <Route path="/supplier/products" element={
            <ProtectedRoute allowedRoles={['supplier']}>
              <ProductList />
            </ProtectedRoute>
          } />
          <Route path="/supplier/product-library" element={
            <ProtectedRoute allowedRoles={['supplier']}>
              <ProductLibrary />
            </ProtectedRoute>
          } />
          <Route path="/supplier/edit-product/:id" element={
            <ProtectedRoute allowedRoles={['supplier']}>
              <EditProduct />
            </ProtectedRoute>
          } />
          <Route path="/supplier/orders" element={
            <ProtectedRoute allowedRoles={['supplier']}>
              <SupplierOrders />
            </ProtectedRoute>
          } />
          <Route path="/supplier/rfq-inbox" element={
            <ProtectedRoute allowedRoles={['supplier']}>
              <RFQInbox />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/approve-products" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ApproveProducts />
            </ProtectedRoute>
          } />
          <Route path="/admin/disputes" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Disputes />
            </ProtectedRoute>
          } />
          <Route path="/admin/verify-documents" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <VerifyDocuments />
            </ProtectedRoute>
          } />
          
          {/* Shared Authenticated Routes */}
          <Route path="/messages" element={
            <ProtectedRoute allowedRoles={['buyer', 'supplier', 'admin']}>
              <Messages />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute allowedRoles={['supplier', 'admin']}>
              <Analytics />
            </ProtectedRoute>
          } />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
