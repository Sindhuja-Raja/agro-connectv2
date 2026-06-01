import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronRight, Sparkles, Tag, Mic, MicOff } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { fetchProducts, DbProduct, categories } from '@/services/productService';
import { supabase } from '@/integrations/supabase/client';
import CategoryCard from '@/components/common/CategoryCard';
import ProductCard from '@/components/common/ProductCard';
import BottomNav from '@/components/common/BottomNav';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [bannerText, setBannerText] = useState<{ en: string; ta: string } | null>(null);
  const recognitionRef = useRef<any>(null);

  const startVoiceSearch = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(language === 'ta' ? 'குரல் தேடல் ஆதரிக்கப்படவில்லை' : 'Voice search not supported on this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      toast.success(language === 'ta' ? `"${transcript}" தேடுகிறது...` : `Searching "${transcript}"...`);
      // Navigate to product list with search query
      navigate(`/products/all?search=${encodeURIComponent(transcript)}`);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error(language === 'ta' ? 'குரலைப் புரிந்துகொள்ள இயலவில்லை. மீண்டும் முயற்சிக்கவும்.' : 'Could not understand. Please try again.');
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  }, [language, navigate]);

  const stopVoiceSearch = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };

    const loadBanner = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('value_en, value_ta')
          .eq('key', 'offer_banner')
          .eq('is_active', true)
          .maybeSingle();
        if (data) {
          setBannerText({ en: data.value_en || '', ta: data.value_ta || '' });
        }
      } catch (err) {
        console.error('Failed to load banner:', err);
      }
    };

    loadProducts();
    loadBanner();
  }, []);

  const featuredProducts = products.slice(0, 4);
  const specialOfferProducts = products.filter(p => p.special_offer_active === true);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 pt-6 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-primary-foreground/80 text-sm">{t('welcome')},</p>
            <h1 className="text-xl font-bold">{user?.user_metadata?.name || 'Farmer'}</h1>
          </div>
          <button className="relative p-2 bg-primary-foreground/10 rounded-full">
            <Bell size={24} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-sunrise rounded-full" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/products/all')}
            className="flex-1 flex items-center gap-3 bg-primary-foreground/10 rounded-xl px-4 py-3"
          >
            <Search size={20} className="text-primary-foreground/70" />
            <span className="text-primary-foreground/70">
              {language === 'ta' ? 'பொருட்களை தேடு...' : 'Search products...'}
            </span>
          </button>
          <button
            onClick={isListening ? stopVoiceSearch : startVoiceSearch}
            className={`p-3 rounded-xl transition-all ${
              isListening
                ? 'bg-destructive text-destructive-foreground animate-pulse'
                : 'bg-primary-foreground/10 text-primary-foreground'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Voice search'}
          >
            {isListening ? <MicOff size={22} /> : <Mic size={22} />}
          </button>
        </div>
      </header>

      <main className="px-4 -mt-4 space-y-6">
        {/* Offer Banner */}
        {bannerText && (
        <div className="bg-gradient-to-r from-wheat to-sunrise rounded-2xl p-4 shadow-lg animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={20} className="text-accent-foreground" />
            <span className="font-semibold text-accent-foreground">{t('offers')}</span>
          </div>
          <p className="text-accent-foreground/90 text-sm mb-3">
            {language === 'ta' ? bannerText.ta : bannerText.en}
          </p>
          <Button variant="secondary" size="sm" onClick={() => navigate('/products/all')}>
            {t('shopNow')}
            <ChevronRight size={16} />
          </Button>
        </div>
        )}

        {/* Categories */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {language === 'ta' ? 'வகைகள்' : 'Categories'}
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} {...cat} />
            ))}
          </div>
        </section>

        {/* Special Offers Section */}
        {specialOfferProducts.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Tag size={20} className="text-sunrise" />
              <h2 className="text-lg font-semibold text-foreground">
                {language === 'ta' ? 'சிறப்பு சலுகைகள்' : 'Special Offers'}
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {specialOfferProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Farming Tip */}
        <div className="bg-leaf-light rounded-2xl p-4 border border-primary/20">
          <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
            💡 {t('farmingTips')}
          </h3>
          <p className="text-sm text-foreground/80">
            {language === 'ta'
              ? 'காலை நேரத்தில் நீர் பாய்ச்சுவது சிறந்தது. வெப்பம் குறைவாக இருக்கும்.'
              : 'Water your crops early morning for best results. Less evaporation!'}
          </p>
        </div>

        {/* Featured Products */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              {language === 'ta' ? 'சிறப்பு பொருட்கள்' : 'Featured Products'}
            </h2>
            <button
              onClick={() => navigate('/products/all')}
              className="text-primary text-sm font-medium flex items-center gap-1"
            >
              {language === 'ta' ? 'அனைத்தும்' : 'View All'}
              <ChevronRight size={16} />
            </button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card rounded-2xl h-48 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default HomeScreen;
