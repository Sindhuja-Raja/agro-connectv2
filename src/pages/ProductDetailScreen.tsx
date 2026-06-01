import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Leaf, Tag } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { fetchProductById, DbProduct } from '@/services/productService';
import Header from '@/components/common/Header';

const ProductDetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { language, t } = useLanguage();
  const [product, setProduct] = useState<DbProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      try {
        const data = await fetchProductById(id);
        setProduct(data);
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">
          {language === 'ta' ? 'பொருள் கிடைக்கவில்லை' : 'Product not found'}
        </p>
      </div>
    );
  }

  const name = language === 'ta' && product.name_ta ? product.name_ta : product.name;
  const description = language === 'ta' && product.description_ta ? product.description_ta : product.description;
  const usage = language === 'ta' && product.usage_ta ? product.usage_ta : product.usage;
  const suitableFor = language === 'ta' && product.suitable_for_ta ? product.suitable_for_ta : product.suitable_for;
  const hasOffer = product.special_offer_active && product.special_offer_price;
  const offerText = language === 'ta' && product.special_offer_text_ta 
    ? product.special_offer_text_ta 
    : product.special_offer_text;

  return (
    <div className="min-h-screen bg-background pb-8">
      <Header title={name} showCart={false} />

      {/* Special Offer Banner */}
      {hasOffer && (
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-3 flex items-center justify-center gap-2">
          <Tag className="h-5 w-5" />
          <span className="font-bold text-lg">
            {offerText || (language === 'ta' ? 'சிறப்பு சலுகை!' : 'Special Offer!')}
          </span>
        </div>
      )}

      {/* Product Image */}
      <div className="relative aspect-square bg-muted">
        <img
          src={product.image_url || 'https://placehold.co/400x400?text=Product'}
          alt={name}
          className="w-full h-full object-cover"
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
            <span className="text-background font-semibold text-xl">
              {t('outOfStock')}
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <main className="px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{name}</h1>
          <div className="flex items-center gap-4">
            {hasOffer ? (
              <div className="flex items-center gap-3">
                <span className="text-xl text-muted-foreground line-through">₹{product.price}</span>
                <span className="text-3xl font-bold text-red-500">₹{product.special_offer_price}</span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-primary">₹{product.price}</span>
            )}
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${
              product.stock > 10 
                ? 'bg-primary/10 text-primary' 
                : product.stock > 0 
                  ? 'bg-sunrise/10 text-sunrise' 
                  : 'bg-muted text-muted-foreground'
            }`}>
              {product.stock > 0 
                ? `${t('inStock')}: ${product.stock}` 
                : t('outOfStock')}
            </span>
          </div>
        </div>

        {description && (
          <p className="text-foreground/80 leading-relaxed">{description}</p>
        )}

        {/* Usage Instructions */}
        {usage && (
          <div className="bg-leaf-light rounded-2xl p-4">
            <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
              <Leaf size={20} />
              {t('usage')}
            </h3>
            <p className="text-foreground/80 text-sm">{usage}</p>
          </div>
        )}

        {/* Suitable For */}
        {suitableFor && suitableFor.length > 0 && (
          <div>
            <h3 className="font-semibold text-foreground mb-3">{t('suitableFor')}</h3>
            <div className="flex flex-wrap gap-2">
              {suitableFor.map((item, index) => (
                <span
                  key={index}
                  className="bg-secondary text-secondary-foreground px-4 py-2 rounded-full text-sm font-medium"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductDetailScreen;
