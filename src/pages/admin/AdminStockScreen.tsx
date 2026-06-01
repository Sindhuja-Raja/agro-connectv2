import React from 'react';
import { AlertTriangle, Package } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { fetchProducts, updateProductStock } from '@/services/productService';
import Header from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AdminStockScreen: React.FC = () => {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const updateStockMutation = useMutation({
    mutationFn: ({ id, stock }: { id: string; stock: number }) => updateProductStock(id, stock),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(language === 'ta' ? 'கையிருப்பு புதுப்பிக்கப்பட்டது' : 'Stock updated');
    },
    onError: () => {
      toast.error(language === 'ta' ? 'புதுப்பிப்பதில் பிழை' : 'Failed to update stock');
    },
  });

  const sortedProducts = [...products].sort((a, b) => a.stock - b.stock);
  const lowStockCount = products.filter(p => p.stock <= 10).length;

  const handleRestock = (productId: string, currentStock: number) => {
    updateStockMutation.mutate({ id: productId, stock: currentStock + 10 });
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      <Header title={t('stock')} showCart={false} />

      <main className="px-4 py-4 space-y-4">
        {/* Low Stock Alert */}
        <div className="bg-sunrise/10 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle size={24} className="text-sunrise" />
          <div>
            <p className="font-semibold text-foreground">
              {language === 'ta' ? 'குறைந்த கையிருப்பு எச்சரிக்கை' : 'Low Stock Alert'}
            </p>
            <p className="text-sm text-muted-foreground">
              {lowStockCount} {language === 'ta' ? 'பொருட்கள் குறைவாக உள்ளன' : 'items running low'}
            </p>
          </div>
        </div>

        {/* Stock List */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            {language === 'ta' ? 'ஏற்றுகிறது...' : 'Loading...'}
          </div>
        ) : (
          <div className="space-y-3">
            {sortedProducts.map((product) => {
              const name = language === 'ta' ? (product.name_ta || product.name) : product.name;
              const isLow = product.stock <= 10;
              const isOut = product.stock === 0;
              
              return (
                <div
                  key={product.id}
                  className={`bg-card rounded-2xl p-4 shadow-sm border animate-fade-in ${
                    isOut ? 'border-destructive/50' : isLow ? 'border-sunrise/50' : 'border-border/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={product.image_url || '/placeholder.svg'}
                      alt={name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground line-clamp-1">{name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Package size={16} className="text-muted-foreground" />
                        <span className={`font-bold ${
                          isOut ? 'text-destructive' : isLow ? 'text-sunrise' : 'text-primary'
                        }`}>
                          {product.stock} {language === 'ta' ? 'உள்ளது' : 'in stock'}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant={isOut ? "farmer" : "outline"}
                      size="sm"
                      onClick={() => handleRestock(product.id, product.stock)}
                      disabled={updateStockMutation.isPending}
                    >
                      {isOut 
                        ? (language === 'ta' ? 'சேர்' : 'Add') 
                        : (language === 'ta' ? '+10' : '+10')
                      }
                    </Button>
                  </div>

                  {/* Stock Bar */}
                  <div className="mt-3">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOut ? 'bg-destructive' : isLow ? 'bg-sunrise' : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min(100, (product.stock / 100) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminStockScreen;
