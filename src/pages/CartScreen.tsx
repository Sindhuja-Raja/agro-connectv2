import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import { Button } from '@/components/ui/button';

const CartScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title={t('yourCart')} showCart={false} />
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="bg-muted rounded-full p-6 mb-6">
            <ShoppingBag size={48} className="text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {t('emptyCart')}
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            {language === 'ta'
              ? 'உங்கள் வண்டியில் எந்த பொருளும் இல்லை'
              : 'Add some products to get started'}
          </p>
          <Button variant="farmer" onClick={() => navigate('/home')}>
            {t('continueShopping')}
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-40">
      <Header title={t('yourCart')} showCart={false} />

      <main className="px-4 py-4 space-y-4">
        {items.map(({ product, quantity }) => {
          const name = language === 'ta' && product.name_ta ? product.name_ta : product.name;
          return (
            <div
              key={product.id}
              className="bg-card rounded-2xl p-4 shadow-sm border border-border/50 animate-fade-in"
            >
              <div className="flex gap-4">
                <img
                  src={product.image_url || 'https://placehold.co/100x100?text=Product'}
                  alt={name}
                  className="w-24 h-24 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground line-clamp-2 mb-1">
                    {name}
                  </h3>
                  <p className="text-lg font-bold text-primary mb-3">
                    ₹{product.price}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="text-lg font-semibold w-8 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-destructive p-2"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                <span className="text-muted-foreground">{t('total')}</span>
                <span className="text-lg font-bold text-foreground">
                  ₹{product.price * quantity}
                </span>
              </div>
            </div>
          );
        })}
      </main>

      {/* Checkout Bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border p-4 safe-bottom">
        <div className="flex items-center justify-between mb-4">
          <span className="text-muted-foreground">{t('total')}</span>
          <span className="text-2xl font-bold text-primary">₹{totalPrice}</span>
        </div>
        <Button
          variant="farmer"
          className="w-full"
          onClick={() => navigate('/checkout')}
        >
          {t('checkout')}
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default CartScreen;
