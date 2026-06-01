import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Flower2, Bug, Wrench } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CategoryCardProps {
  id: string;
  icon: string;
  color: string;
}

const iconMap = {
  Sprout,
  Flower2,
  Bug,
  Wrench,
};

const CategoryCard: React.FC<CategoryCardProps> = ({ id, icon, color }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const Icon = iconMap[icon as keyof typeof iconMap] || Sprout;

  return (
    <button
      onClick={() => navigate(`/products/${id}`)}
      className="flex flex-col items-center justify-center p-4 rounded-2xl bg-card shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 aspect-square border border-border/50"
    >
      <div className={`${color} p-4 rounded-xl mb-3 text-primary-foreground`}>
        <Icon size={32} strokeWidth={2} />
      </div>
      <span className="text-sm font-semibold text-foreground text-center">
        {t(id)}
      </span>
    </button>
  );
};

export default CategoryCard;
