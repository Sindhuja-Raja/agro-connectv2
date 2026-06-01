import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) return;
      
      if (isAuthenticated) {
        navigate(isAdmin ? '/admin' : '/home');
      } else {
        navigate('/login');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate, isAuthenticated, isAdmin, isLoading]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary to-primary/80 px-6">
      <div className="animate-grow">
        <div className="bg-card rounded-full p-6 shadow-2xl mb-6">
          <Leaf size={80} className="text-primary" strokeWidth={1.5} />
        </div>
      </div>
      
      <h1 className="text-4xl font-bold text-primary-foreground mb-2 animate-fade-in">
        {t('appName')}
      </h1>
      
      <p className="text-lg text-primary-foreground/80 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        {t('tagline')}
      </p>

      <div className="mt-12 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full bg-primary-foreground/50 animate-pulse-soft"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export default SplashScreen;
