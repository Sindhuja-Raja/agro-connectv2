import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Globe, LogOut, ChevronRight, Phone, HelpCircle, MapPin, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import { Button } from '@/components/ui/button';

const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const userName = user?.user_metadata?.name || 'Farmer';
  const userMobile = user?.user_metadata?.mobile || user?.email || '';

  const [showHelp, setShowHelp] = useState(false);

  const menuItems = [
    {
      icon: Globe,
      label: t('language'),
      value: language === 'en' ? 'English' : 'தமிழ்',
      onClick: () => setLanguage(language === 'en' ? 'ta' : 'en'),
    },
    {
      icon: HelpCircle,
      label: language === 'ta' ? 'உதவி' : 'Help & Support',
      onClick: () => setShowHelp(!showHelp),
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={t('profile')} showBack={false} showCart={false} />

      <main className="px-4 py-6 space-y-6">
        {/* User Info Card */}
        <div className="bg-card rounded-2xl p-6 shadow-md border border-border/50 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 rounded-full p-4">
              <User size={40} className="text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">{userName}</h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone size={14} />
                <span>{userMobile}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-card rounded-2xl shadow-md border border-border/50 overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
            >
              <div className="flex items-center gap-4">
                <div className="bg-muted rounded-xl p-2">
                  <item.icon size={22} className="text-primary" />
                </div>
                <span className="font-medium text-foreground">{item.label}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                {item.value && <span className="text-sm">{item.value}</span>}
                <ChevronRight size={20} />
              </div>
            </button>
          ))}
        </div>

        {/* Help & Support Details */}
        {showHelp && (
          <div className="bg-card rounded-2xl p-5 shadow-md border border-border/50 animate-fade-in space-y-3">
            <h3 className="font-bold text-foreground text-lg">
              {language === 'ta' ? 'ஸ்ரீ முருகன் அக்ரோ' : 'Sri Murugan Agro'}
            </h3>
            <div className="flex items-start gap-3 text-muted-foreground">
              <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
              <span className="text-sm">2/262 Near South Indian Bank, Rasipuram Main Road, Vaiyappamalai Village and Marapparai Post, Namakkal-637410</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Phone size={18} className="text-primary shrink-0" />
              <a href="tel:+919578059813" className="text-sm text-primary font-medium">+91 95780 59813</a>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Mail size={18} className="text-primary shrink-0" />
              <a href="mailto:srimuruganagro.vpm@gmail.com" className="text-sm text-primary font-medium">srimuruganagro.vpm@gmail.com</a>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <Button
          variant="outline"
          size="lg"
          className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          {t('logout')}
        </Button>

        <p className="text-center text-sm text-muted-foreground">AgroMart v1.0.0</p>
      </main>

      <BottomNav />
    </div>
  );
};

export default ProfileScreen;
