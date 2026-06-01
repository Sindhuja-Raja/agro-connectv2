import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DbProduct } from '@/services/productService';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Tag, ShoppingCart, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { addToWishlist, removeFromWishlist } from '@/services/wishlistService';

interface ProductCardProps {
  product: DbProduct;
  wishlistedIds?: string[];
  onWishlistChange?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, wishlistedIds = [], onWishlistChange }) => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(wishlistedIds.includes(product.id));

  useEffect(() => {
    setIsWishlisted(wishlistedIds.includes(product.id));
  }, [wishlistedIds, product.id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock > 0) {
      addToCart(product);
      toast.success(language === 'ta' ? 'வண்டியில் சேர்க்கப்பட்டது' : 'Added to cart');
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error(language === 'ta' ? 'உள்நுழைக' : 'Please login first');
      return;
    }
    try {
      if (isWishlisted) {
        await removeFromWishlist(user.id, product.id);
        setIsWishlisted(false);
        toast.success(language === 'ta' ? 'விருப்பப்பட்டியலிலிருந்து நீக்கப்பட்டது' : 'Removed from wishlist');
      } else {
        await addToWishlist(user.id, product.id);
        setIsWishlisted(true);
        toast.success(language === 'ta' ? 'விருப்பப்பட்டியலில் சேர்க்கப்பட்டது' : 'Added to wishlist');
      }
      onWishlistChange?.();
    } catch {
      toast.error(language === 'ta' ? 'பிழை ஏற்பட்டது' : 'Something went wrong');
    }
  };

  const name = language === 'ta' && product.name_ta ? product.name_ta : product.name;
  const hasOffer = product.special_offer_active && product.special_offer_price;
  const offerText = language === 'ta' && product.special_offer_text_ta
    ? product.special_offer_text_ta
    : product.special_offer_text;

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-card rounded-2xl shadow-md overflow-hidden border border-border/50 hover:shadow-lg transition-all duration-300 active:scale-[0.98] cursor-pointer animate-fade-in relative"
    >
      {hasOffer && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 flex items-center gap-1 justify-center">
          <Tag className="h-3 w-3" />
          {offerText || (language === 'ta' ? 'சிறப்பு சலுகை!' : 'Special Offer!')}
        </div>
      )}

      <div className={`relative aspect-[4/3] overflow-hidden bg-muted ${hasOffer ? 'mt-6' : ''}`}>
        <img
          src={product.image_url || 'https://placehold.co/400x300?text=Product'}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Wishlist button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-2 left-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-all z-10"
        >
          <Heart size={16} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground'} />
        </button>
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
            <span className="text-background font-semibold text-lg">{t('outOfStock')}</span>
          </div>
        )}
        {product.stock > 0 && product.stock <= 10 && (
          <div className="absolute top-2 right-2 bg-sunrise text-accent-foreground text-xs font-bold px-2 py-1 rounded-full">
            {product.stock} left
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-foreground text-sm line-clamp-2 min-h-[2.25rem] mb-2">
          {name}
        </h3>
        <div className="flex items-end justify-between gap-1">
          <div>
            {hasOffer ? (
              <>
                <span className="text-xs text-muted-foreground line-through">₹{product.price}</span>
                <span className="text-lg font-bold text-red-500 ml-1">₹{product.special_offer_price}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-primary">₹{product.price}</span>
            )}
          </div>
          {product.stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:opacity-90 active:scale-95 transition-all"
            >
              <ShoppingCart size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
