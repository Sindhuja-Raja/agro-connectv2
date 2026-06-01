import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, Truck, Package, XCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { fetchAllOrders, updateOrderStatus } from '@/services/orderService';
import Header from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  delivery_address: string | null;
  order_items: {
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
  }[];
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  pending: { icon: Clock, color: 'bg-sunrise/10 text-sunrise', label: 'Pending' },
  confirmed: { icon: CheckCircle, color: 'bg-primary/10 text-primary', label: 'Confirmed' },
  shipped: { icon: Truck, color: 'bg-blue-500/10 text-blue-600', label: 'Shipped' },
  delivered: { icon: Package, color: 'bg-primary/10 text-primary', label: 'Delivered' },
  rejected: { icon: XCircle, color: 'bg-destructive/10 text-destructive', label: 'Rejected' },
};

const AdminOrdersScreen: React.FC = () => {
  const { t, language } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const data = await fetchAllOrders();
      setOrders(data as Order[]);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order updated to ${newStatus}`);
      loadOrders();
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      <Header title={t('manageOrders')} showCart={false} />

      <main className="px-4 py-4 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl h-40 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-muted rounded-full p-6 mb-6">
              <Package size={48} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No orders yet</p>
          </div>
        ) : (
          orders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = status.icon;

            return (
              <div
                key={order.id}
                className="bg-card rounded-2xl p-4 shadow-sm border border-border/50 animate-fade-in"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-foreground">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                    <StatusIcon size={14} />
                    {status.label}
                  </div>
                </div>

                {order.delivery_address && (
                  <p className="text-sm text-muted-foreground mb-2">📍 {order.delivery_address}</p>
                )}

                <div className="border-t border-border pt-3 mb-3">
                  <div className="text-sm text-foreground space-y-1">
                    {order.order_items.map((item) => (
                      <p key={item.id}>
                        • {item.product_name} × {item.quantity} — ₹{item.unit_price * item.quantity}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-lg font-bold text-primary">₹{order.total_amount}</span>

                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive"
                          onClick={() => handleUpdateStatus(order.id, 'rejected')}
                        >
                          <XCircle size={16} />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="farmer"
                          onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                        >
                          <CheckCircle size={16} />
                          Approve
                        </Button>
                      </>
                    )}
                    {order.status === 'confirmed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(order.id, 'shipped')}
                      >
                        <Truck size={16} />
                        Ship
                      </Button>
                    )}
                    {order.status === 'shipped' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(order.id, 'delivered')}
                      >
                        <Package size={16} />
                        Delivered
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
};

export default AdminOrdersScreen;
