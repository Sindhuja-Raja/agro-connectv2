import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, CheckCircle, Clock, XCircle, IndianRupee } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { fetchAllOrders } from '@/services/orderService';
import Header from '@/components/common/Header';

const AdminReportsScreen: React.FC = () => {
  const { t, language } = useLanguage();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: fetchAllOrders,
  });

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;
  const confirmedOrders = orders.filter((o: any) => o.status === 'confirmed' || o.status === 'delivered').length;
  const rejectedOrders = orders.filter((o: any) => o.status === 'rejected').length;
  const totalRevenue = orders
    .filter((o: any) => o.status === 'confirmed' || o.status === 'delivered')
    .reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);

  // Top products from order items
  const productMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  orders.forEach((order: any) => {
    if (order.status === 'confirmed' || order.status === 'delivered') {
      order.order_items?.forEach((item: any) => {
        if (!productMap[item.product_name]) {
          productMap[item.product_name] = { name: item.product_name, qty: 0, revenue: 0 };
        }
        productMap[item.product_name].qty += item.quantity;
        productMap[item.product_name].revenue += item.unit_price * item.quantity;
      });
    }
  });
  const topProducts = Object.values(productMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const stats = [
    {
      label: language === 'ta' ? 'மொத்த ஆர்டர்கள்' : 'Total Orders',
      value: totalOrders,
      icon: ShoppingBag,
      color: 'bg-primary/10 text-primary',
    },
    {
      label: language === 'ta' ? 'நிலுவையில்' : 'Pending',
      value: pendingOrders,
      icon: Clock,
      color: 'bg-sunrise/10 text-sunrise',
    },
    {
      label: language === 'ta' ? 'ஒப்புக்கொள்ளப்பட்டது' : 'Approved',
      value: confirmedOrders,
      icon: CheckCircle,
      color: 'bg-primary/10 text-primary',
    },
    {
      label: language === 'ta' ? 'நிராகரிக்கப்பட்டது' : 'Rejected',
      value: rejectedOrders,
      icon: XCircle,
      color: 'bg-destructive/10 text-destructive',
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-6">
      <Header title={language === 'ta' ? 'அறிக்கைகள்' : 'Reports'} showCart={false} />

      <main className="px-4 py-4 space-y-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-2xl h-20 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Revenue Card */}
            <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-5 text-primary-foreground animate-fade-in">
              <div className="flex items-center gap-3 mb-2">
                <IndianRupee size={24} />
                <span className="text-sm opacity-80">
                  {language === 'ta' ? 'மொத்த வருவாய்' : 'Total Revenue'}
                </span>
              </div>
              <p className="text-3xl font-bold">₹{totalRevenue.toLocaleString()}</p>
              <p className="text-sm opacity-70 mt-1">
                {language === 'ta' ? 'ஒப்புக்கொள்ளப்பட்ட ஆர்டர்களிலிருந்து' : 'From approved orders'}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-card rounded-2xl p-4 shadow-sm border border-border/50 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`${stat.color} rounded-xl p-2 w-fit mb-2`}>
                    <stat.icon size={20} />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Top Products */}
            {topProducts.length > 0 && (
              <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50">
                <h3 className="font-semibold text-foreground mb-4">
                  {language === 'ta' ? 'சிறந்த பொருட்கள்' : 'Top Selling Products'}
                </h3>
                <div className="space-y-3">
                  {topProducts.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-muted-foreground w-6">
                          #{index + 1}
                        </span>
                        <span className="text-foreground font-medium text-sm">{product.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary text-sm">₹{product.revenue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{product.qty} sold</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminReportsScreen;
