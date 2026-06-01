import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Search, Mic, MicOff, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { fetchProducts, fetchProductsByCategory, DbProduct, categories } from '@/services/productService';
import ProductCard from '@/components/common/ProductCard';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import { toast } from 'sonner';

const ProductListScreen: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const { t, language } = useLanguage();
  const [allProducts, setAllProducts] = useState<DbProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState(initialSearch);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        let data: DbProduct[];
        if (category === 'all') {
          data = await fetchProducts();
        } else {
          data = await fetchProductsByCategory(category || '');
        }
        setAllProducts(data);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [category]);

  // Filter products when search text or products change
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredProducts(allProducts);
      return;
    }
    const q = searchText.toLowerCase();
    const filtered = allProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.name_ta && p.name_ta.includes(searchText)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.description_ta && p.description_ta.includes(searchText)) ||
      p.category.toLowerCase().includes(q)
    );
    setFilteredProducts(filtered);
  }, [searchText, allProducts]);

  const startVoiceSearch = useCallback(() => {
    // Stop any existing recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(language === 'ta' ? 'குரல் தேடல் ஆதரிக்கப்படவில்லை' : 'Voice search not supported');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
      
      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        if (event.results && event.results[0] && event.results[0][0]) {
          const transcript = event.results[0][0].transcript;
          setSearchText(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error(language === 'ta' ? 'மீண்டும் முயற்சிக்கவும்' : 'Could not understand. Try again.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (error) {
      console.error('Failed to start voice search:', error);
      setIsListening(false);
      toast.error(language === 'ta' ? 'குரல் தேடல் தோல்வியடைந்தது' : 'Voice search failed');
    }
  }, [language]);

  const stopVoiceSearch = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping voice search:', error);
      }
    }
    setIsListening(false);
  }, []);

  const title = category === 'all'
    ? (language === 'ta' ? 'அனைத்து பொருட்கள்' : 'All Products')
    : t(category || '');

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={title} />

      {/* Search Bar */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 shadow-sm">
          <Search size={20} className="text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={language === 'ta' ? 'பொருட்களை தேடு...' : 'Search products...'}
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-[15px]"
            autoFocus={!initialSearch}
          />
          {searchText && (
            <button onClick={() => setSearchText('')} className="text-muted-foreground p-1">
              <X size={18} />
            </button>
          )}
          <button
            onClick={isListening ? stopVoiceSearch : startVoiceSearch}
            className={`p-2 rounded-lg transition-all ${
              isListening ? 'bg-destructive text-destructive-foreground animate-pulse' : 'text-primary'
            }`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        </div>
        {searchText && (
          <p className="text-xs text-muted-foreground mt-2 px-1">
            {filteredProducts.length} {language === 'ta' ? 'முடிவுகள்' : 'results'}
            {searchText && ` — "${searchText}"`}
          </p>
        )}
      </div>

      <main className="px-4 py-2">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-lg">
              {language === 'ta' ? 'பொருட்கள் இல்லை' : 'No products found'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default ProductListScreen;
