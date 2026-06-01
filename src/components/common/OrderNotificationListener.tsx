import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

const statusLabels: Record<string, { en: string; ta: string }> = {
  confirmed: { en: '✅ Your order has been approved!', ta: '✅ உங்கள் ஆர்டர் ஒப்புக்கொள்ளப்பட்டது!' },
  rejected: { en: '❌ Your order was rejected', ta: '❌ உங்கள் ஆர்டர் நிராகரிக்கப்பட்டது' },
  shipped: { en: '🚚 Your order has been shipped!', ta: '🚚 உங்கள் ஆர்டர் அனுப்பப்பட்டது!' },
  delivered: { en: '📦 Your order has been delivered!', ta: '📦 உங்கள் ஆர்டர் டெலிவரி ஆனது!' },
};

const OrderNotificationListener = () => {
  const { user } = useAuth();
  const { language } = useLanguage();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('order-status-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newStatus = payload.new.status as string;
          const label = statusLabels[newStatus];
          if (label) {
            toast(language === 'ta' ? label.ta : label.en, {
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, language]);

  return null;
};

export default OrderNotificationListener;
