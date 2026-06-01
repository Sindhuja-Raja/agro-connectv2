import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Package, 
  Boxes,
  ClipboardList,
  BarChart3,
  LogOut,
  ChevronRight,
  Megaphone,
  Save
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { fetchProducts } from '@/services/productService';
import { fetchAllOrders } from '@/services/orderService';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { logout } = useAuth();

  const [bannerEn, setBannerEn] = useState('');
  const [bannerTa, setBannerTa] = useState('');
  const [bannerActive, setBannerActive] = useState(true);
  const [bannerSaving, setBannerSaving] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: fetchAllOrders,
  });

  useEffect(() => {
    const loadBanner = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'offer_banner')
        .maybeSingle();
      if (data) {
        setBannerEn(data.value_en || '');
        setBannerTa(data.value_ta || '');
        setBannerActive(data.is_active ?? true);
      }
    };
    loadBanner();
  }, []);

  const saveBanner = async () => {
    setBannerSaving(true);
    try {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'offer_banner')
        .maybeSingle();

      if (existing) {
        await supabase
          .from('site_settings')
          .update({ value_en: bannerEn, value_ta: bannerTa, is_active: bannerActive, updated_at: new Date().toISOString() })
          .eq('key', 'offer_banner');
      } else {
        await supabase
          .from('site_settings')
          .insert({ key: 'offer_banner', value_en: bannerEn, value_ta: bannerTa, is_active: bannerActive });
      }
      toast.success(language === 'ta' ? 'பேனர் புதுப்பிக்கப்பட்டது!' : 'Banner updated!');
    } catch {
      toast.error('Failed to save banner');
    } finally {
      setBannerSaving(false);
    }
  };

  const lowStockItems = products.filter(p => p.stock <= 10).length;
  const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;

  const stats = [
    {
      label: t('totalProducts'),
      value: products.length,
      icon: Package,
      color: 'bg-primary text-primary-foreground',
    },
    {
      label: language === 'ta' ? 'குறைந்த கையிருப்பு' : 'Low Stock',
      value: lowStockItems,
      icon: Boxes,
      color: 'bg-sunrise text-accent-foreground',
    },
    {
      label: language === 'ta' ? 'நிலுவை ஆர்டர்கள்' : 'Pending Orders',
      value: pendingOrders,
      icon: ClipboardList,
      color: 'bg-sky text-primary-foreground',
    },
    {
      label: language === 'ta' ? 'மொத்த ஆர்டர்கள்' : 'Total Orders',
      value: orders.length,
      icon: BarChart3,
      color: 'bg-soil text-primary-foreground',
    },
  ];

  const menuItems = [
    {
      icon: Package,
      label: t('manageProducts'),
      description: language === 'ta' ? 'பொருட்கள் சேர், திருத்து, நீக்கு' : 'Add, edit, delete products',
      path: '/admin/products',
      color: 'bg-primary/10 text-primary',
    },
    {
      icon: Boxes,
      label: t('stock'),
      description: language === 'ta' ? 'கையிருப்பு நிலையை நிர்வகி' : 'Manage stock levels',
      path: '/admin/stock',
      color: 'bg-sunrise/10 text-sunrise',
    },
    {
      icon: ClipboardList,
      label: language === 'ta' ? 'ஆர்டர்கள் நிர்வகி' : 'Manage Orders',
      description: language === 'ta' ? 'ஆர்டர்களை ஒப்புக்கொள் அல்லது நிராகரி' : 'Approve or reject orders',
      path: '/admin/orders',
      color: 'bg-sky/10 text-sky',
    },
    {
      icon: BarChart3,
      label: language === 'ta' ? 'அறிக்கைகள்' : 'Reports',
      description: language === 'ta' ? 'விற்பனை மற்றும் ஆர்டர் அறிக்கைகள்' : 'Sales and order reports',
      path: '/admin/reports',
      color: 'bg-soil/10 text-soil',
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <header className="bg-soil text-primary-foreground px-4 pt-6 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-primary-foreground/80 text-sm">{t('admin')}</p>
            <h1 className="text-xl font-bold">{t('dashboard')}</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <LogOut size={24} />
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${stat.color} rounded-2xl p-4 text-center animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <stat.icon size={28} className="mx-auto mb-2" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm opacity-80">{stat.label}</p>
            </div>
          ))}
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Offer Banner Management */}
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone size={20} className="text-sunrise" />
            <h2 className="font-semibold text-foreground">
              {language === 'ta' ? 'சலுகை பேனர் நிர்வாகம்' : 'Offer Banner Management'}
            </h2>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">English Text</label>
              <Input
                value={bannerEn}
                onChange={(e) => setBannerEn(e.target.value)}
                placeholder="e.g. Get 20% off on all seeds!"
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Tamil Text (தமிழ்)</label>
              <Input
                value={bannerTa}
                onChange={(e) => setBannerTa(e.target.value)}
                placeholder="எ.கா. விதைகளில் 20% தள்ளுபடி!"
                className="rounded-xl"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">
                {language === 'ta' ? 'பேனர் செயலில்' : 'Banner Active'}
              </span>
              <Switch checked={bannerActive} onCheckedChange={setBannerActive} />
            </div>
            <Button
              variant="farmer"
              className="w-full"
              onClick={saveBanner}
              disabled={bannerSaving}
            >
              {bannerSaving ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  {language === 'ta' ? 'பேனரை சேமி' : 'Save Banner'}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="font-semibold text-foreground">
          {language === 'ta' ? 'விரைவு செயல்கள்' : 'Quick Actions'}
        </h2>

        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className="w-full bg-card rounded-2xl p-4 shadow-sm border border-border/50 flex items-center gap-4 hover:shadow-md transition-all active:scale-[0.98] animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={`${item.color} rounded-xl p-3`}>
              <item.icon size={28} />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-foreground">{item.label}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <ChevronRight size={20} className="text-muted-foreground" />
          </button>
        ))}
      </main>
    </div>
  );
};

export default AdminDashboard;