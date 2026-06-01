import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Home, ClipboardList } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';

const OrderConfirmationScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="text-center animate-scale-in">
        <div className="bg-primary/10 rounded-full p-6 inline-block mb-6">
          <CheckCircle size={80} className="text-primary" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {t('orderPlaced')}
        </h1>
        
        <p className="text-muted-foreground mb-8">
          {t('orderSuccess')}
        </p>

        <div className="bg-card rounded-2xl p-6 shadow-md border border-border/50 mb-8">
          <p className="text-sm text-muted-foreground mb-2">
            {language === 'ta' ? 'ஆர்டர் எண்' : 'Order Number'}
          </p>
          <p className="text-xl font-bold text-foreground">
            #KM{Date.now().toString().slice(-6)}
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            {language === 'ta'
              ? 'உங்கள் ஆர்டர் நிர்வாகி ஒப்புதலுக்கு காத்திருக்கிறது'
              : 'Your order is pending admin approval'}
          </p>
        </div>

        <div className="flex gap-4 w-full max-w-sm mx-auto">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => navigate('/orders')}
          >
            <ClipboardList size={20} />
            {t('orders')}
          </Button>
          <Button
            variant="farmer"
            size="lg"
            className="flex-1"
            onClick={() => navigate('/home')}
          >
            <Home size={20} />
            {t('home')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationScreen;
