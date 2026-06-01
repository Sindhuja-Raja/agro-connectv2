import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import AdminRoute from "@/components/AdminRoute";

// Pages
import SplashScreen from "./pages/SplashScreen";
import LoginScreen from "./pages/LoginScreen";
import ForgotPasswordScreen from "./pages/ForgotPasswordScreen";
import ResetPasswordScreen from "./pages/ResetPasswordScreen";
import HomeScreen from "./pages/HomeScreen";
import ProductListScreen from "./pages/ProductListScreen";
import ProductDetailScreen from "./pages/ProductDetailScreen";
import ProfileScreen from "./pages/ProfileScreen";
import CartScreen from "./pages/CartScreen";
import CheckoutScreen from "./pages/CheckoutScreen";
import OrderConfirmationScreen from "./pages/OrderConfirmationScreen";
import OrderHistoryScreen from "./pages/OrderHistoryScreen";
import InstallScreen from "./pages/InstallScreen";
import WishlistScreen from "./pages/WishlistScreen";
import OrderNotificationListener from "./components/common/OrderNotificationListener";

// Admin Pages
import AdminLoginScreen from "./pages/admin/AdminLoginScreen";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProductsScreen from "./pages/admin/AdminProductsScreen";
import AdminStockScreen from "./pages/admin/AdminStockScreen";
import AdminReportsScreen from "./pages/admin/AdminReportsScreen";
import AdminOrdersScreen from "./pages/admin/AdminOrdersScreen";

import NotFound from "./pages/NotFound";
import { Chatbot } from "./components/Chatbot";
import WhatsAppButton from "./components/common/WhatsAppButton";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" />
          <BrowserRouter>
            <div className="max-w-lg mx-auto min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<SplashScreen />} />
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
                <Route path="/reset-password" element={<ResetPasswordScreen />} />
                <Route path="/home" element={<HomeScreen />} />
                <Route path="/products/:category" element={<ProductListScreen />} />
                <Route path="/product/:id" element={<ProductDetailScreen />} />
                <Route path="/profile" element={<ProfileScreen />} />
                <Route path="/cart" element={<CartScreen />} />
                <Route path="/checkout" element={<CheckoutScreen />} />
                <Route path="/order-confirmation" element={<OrderConfirmationScreen />} />
                <Route path="/orders" element={<OrderHistoryScreen />} />
                <Route path="/install" element={<InstallScreen />} />
                <Route path="/wishlist" element={<WishlistScreen />} />
                
                {/* Admin Routes */}
                <Route path="/admin-login" element={<AdminLoginScreen />} />
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/products" element={<AdminRoute><AdminProductsScreen /></AdminRoute>} />
                <Route path="/admin/stock" element={<AdminRoute><AdminStockScreen /></AdminRoute>} />
                <Route path="/admin/reports" element={<AdminRoute><AdminReportsScreen /></AdminRoute>} />
                <Route path="/admin/orders" element={<AdminRoute><AdminOrdersScreen /></AdminRoute>} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Chatbot />
              <WhatsAppButton />
              <OrderNotificationListener />
            </div>
          </BrowserRouter>
        </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
