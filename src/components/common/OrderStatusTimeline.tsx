import React from 'react';
import { Clock, CheckCircle, Truck, Package, XCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface OrderStatusTimelineProps {
  status: string;
}

const steps = [
  { key: 'pending', en: 'Order Placed', ta: 'ஆர்டர் செய்யப்பட்டது', icon: Clock },
  { key: 'confirmed', en: 'Confirmed', ta: 'ஒப்புக்கொள்ளப்பட்டது', icon: CheckCircle },
  { key: 'shipped', en: 'Shipped', ta: 'அனுப்பப்பட்டது', icon: Truck },
  { key: 'delivered', en: 'Delivered', ta: 'டெலிவரி ஆனது', icon: Package },
];

const statusOrder = ['pending', 'confirmed', 'shipped', 'delivered'];

const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({ status }) => {
  const { language } = useLanguage();

  if (status === 'rejected') {
    return (
      <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-xl">
        <XCircle size={20} className="text-destructive" />
        <span className="text-sm font-medium text-destructive">
          {language === 'ta' ? 'ஆர்டர் நிராகரிக்கப்பட்டது' : 'Order Rejected'}
        </span>
      </div>
    );
  }

  const currentIndex = statusOrder.indexOf(status);

  return (
    <div className="flex items-center justify-between px-2 py-3">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isComplete = i <= currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ${
                  isComplete
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                } ${isCurrent ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
              >
                <Icon size={18} />
              </div>
              <span className={`text-[10px] text-center leading-tight max-w-[60px] ${
                isComplete ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}>
                {language === 'ta' ? step.ta : step.en}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mt-[-20px] ${
                i < currentIndex ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default OrderStatusTimeline;
