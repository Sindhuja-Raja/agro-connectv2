import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { fetchWishlist } from '@/services/wishlistService';
import { fetchProducts, DbProduct } from '@/services/productService';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import ProductCard from '@/components/common/ProductCard';

const WishlistScreen: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = async () => {
    if (!user) return;
    try {
      const [ids, allProducts] = await Promise.all([
        fetchWishlist(user.id),
        fetchProducts(),
      ]);
      setWishlistIds(ids);
      setProducts(allProducts.filter(p => ids.includes(p.id)));
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWishlist(); }, [user]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={language === 'ta' ? 'விருப்பப்பட்டியல்' : 'Wishlist'} showCart />

      <main className="px-4 py-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-card rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-muted rounded-full p-6 mb-6">
              <Heart size={48} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              {language === 'ta' ? 'விருப்பப்பட்டியல் காலியாக உள்ளது' : 'Your wishlist is empty'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                wishlistedIds={wishlistIds}
                onWishlistChange={loadWishlist}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default WishlistScreen;
