import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Truck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { createOrder } from '@/services/orderService';
import Header from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const CheckoutScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { totalPrice, items, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      toast.error(language === 'ta' ? 'முகவரி தேவை' : 'Please enter delivery address');
      return;
    }

    if (!user) {
      toast.error(language === 'ta' ? 'உள்நுழைக' : 'Please login first');
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      await createOrder(user.id, {
        total_amount: totalPrice,
        delivery_address: address,
        items: items.map(({ product, quantity }) => ({
          product_id: product.id,
          product_name: product.name,
          quantity,
          unit_price: product.price,
        })),
      });

      clearCart();
      navigate('/order-confirmation');
    } catch (error) {
      console.error('Order failed:', error);
      toast.error(language === 'ta' ? 'ஆர்டர் தோல்வி' : 'Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header title={t('checkout')} showCart={false} />

      <main className="px-4 py-6 space-y-6">
        {/* Delivery Address */}
        <div className="bg-card rounded-2xl p-4 shadow-md border border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 rounded-xl p-2">
              <MapPin size={24} className="text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">
              {language === 'ta' ? 'டெலிவரி முகவரி' : 'Delivery Address'}
            </h3>
          </div>
          <Input
            placeholder={language === 'ta' ? 'உங்கள் முழு முகவரி...' : 'Enter your full address...'}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="h-14 text-base rounded-xl"
          />
        </div>

        {/* Order Summary */}
        <div className="bg-card rounded-2xl p-4 shadow-md border border-border/50">
          <h3 className="font-semibold text-foreground mb-4">
            {language === 'ta' ? 'ஆர்டர் சுருக்கம்' : 'Order Summary'}
          </h3>
          
          <div className="space-y-3">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {language === 'ta' && product.name_ta ? product.name_ta : product.name} × {quantity}
                </span>
                <span className="font-medium text-foreground">
                  ₹{product.price * quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-border mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {language === 'ta' ? 'துணை மொத்தம்' : 'Subtotal'}
              </span>
              <span>₹{totalPrice}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {language === 'ta' ? 'டெலிவரி' : 'Delivery'}
              </span>
              <span className="text-primary font-medium">FREE</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
              <span>{t('total')}</span>
              <span className="text-primary">₹{totalPrice}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-card rounded-2xl p-4 shadow-md border border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 rounded-xl p-2">
              <CreditCard size={24} className="text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">
              {language === 'ta' ? 'பணம் செலுத்தும் முறை' : 'Payment Method'}
            </h3>
          </div>
          <div className="flex items-center gap-3 p-3 bg-leaf-light rounded-xl border-2 border-primary">
            <Truck size={24} className="text-primary" />
            <div>
              <p className="font-medium text-foreground">
                {language === 'ta' ? 'கேஷ் ஆன் டெலிவரி' : 'Cash on Delivery'}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === 'ta' ? 'டெலிவரி நேரத்தில் பணம் செலுத்தவும்' : 'Pay when you receive'}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Place Order Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-bottom">
        <Button
          variant="farmer"
          className="w-full"
          onClick={handlePlaceOrder}
          disabled={loading || items.length === 0}
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <>
              {language === 'ta' ? 'ஆர்டர் செய்' : 'Place Order'} • ₹{totalPrice}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CheckoutScreen;
