import React, { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserOrders } from '@/services/orderService';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import OrderStatusTimeline from '@/components/common/OrderStatusTimeline';

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  delivery_address: string;
  order_items: {
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
  }[];
}

const OrderHistoryScreen: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;
      try {
        const data = await fetchUserOrders(user.id);
        setOrders(data as Order[]);
      } catch (error) {
        console.error('Failed to load orders:', error);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={t('orderHistory')} showCart={false} />

      <main className="px-4 py-4 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-card rounded-2xl h-40 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-muted rounded-full p-6 mb-6">
              <Package size={48} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              {language === 'ta' ? 'ஆர்டர்கள் இல்லை' : 'No orders yet'}
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-card rounded-2xl p-4 shadow-sm border border-border/50 animate-fade-in"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-foreground">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <span className="text-lg font-bold text-primary">
                  ₹{order.total_amount}
                </span>
              </div>

              {/* Delivery Tracking Timeline */}
              <div className="bg-muted/30 rounded-xl p-2 mb-3">
                <OrderStatusTimeline status={order.status} />
              </div>

              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground mb-2">
                  {language === 'ta' ? 'பொருட்கள்' : 'Items'}:
                </p>
                <ul className="text-sm text-foreground space-y-1">
                  {order.order_items.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <span>• {item.product_name} × {item.quantity}</span>
                      <span className="text-muted-foreground">₹{item.unit_price * item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default OrderHistoryScreen;
