import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  fetchProducts, 
  deleteProduct, 
  createProduct, 
  updateProduct, 
  DbProduct, 
  ProductFormData 
} from '@/services/productService';
import Header from '@/components/common/Header';
import ProductFormDialog from '@/components/admin/ProductFormDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const AdminProductsScreen: React.FC = () => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<DbProduct | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<DbProduct | null>(null);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(language === 'ta' ? 'பொருள் சேர்க்கப்பட்டது' : 'Product added');
      setDialogOpen(false);
    },
    onError: () => {
      toast.error(language === 'ta' ? 'சேர்ப்பதில் பிழை' : 'Failed to add product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductFormData> }) =>
      updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(language === 'ta' ? 'பொருள் புதுப்பிக்கப்பட்டது' : 'Product updated');
      setDialogOpen(false);
      setSelectedProduct(null);
    },
    onError: () => {
      toast.error(language === 'ta' ? 'புதுப்பிப்பதில் பிழை' : 'Failed to update product');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(language === 'ta' ? 'பொருள் நீக்கப்பட்டது' : 'Product deleted');
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    },
    onError: () => {
      toast.error(language === 'ta' ? 'நீக்குவதில் பிழை' : 'Failed to delete product');
    },
  });

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.name_ta && p.name_ta.includes(searchQuery))
  );

  const handleAddClick = () => {
    setSelectedProduct(null);
    setDialogOpen(true);
  };

  const handleEditClick = (product: DbProduct) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleDeleteClick = (product: DbProduct) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = (data: ProductFormData) => {
    if (selectedProduct) {
      updateMutation.mutate({ id: selectedProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete.id);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      <Header title={t('manageProducts')} showCart={false} />

      <main className="px-4 py-4 space-y-4">
        {/* Search & Add */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder={language === 'ta' ? 'தேடு...' : 'Search...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>
          <Button variant="farmer" size="icon" className="h-12 w-12" onClick={handleAddClick}>
            <Plus size={24} />
          </Button>
        </div>

        {/* Product List */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            {language === 'ta' ? 'ஏற்றுகிறது...' : 'Loading...'}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {language === 'ta' ? 'பொருட்கள் இல்லை' : 'No products found'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => {
              const name = language === 'ta' ? (product.name_ta || product.name) : product.name;
              return (
                <div
                  key={product.id}
                  className="bg-card rounded-2xl p-4 shadow-sm border border-border/50 animate-fade-in"
                >
                  <div className="flex gap-4">
                    <img
                      src={product.image_url || '/placeholder.svg'}
                      alt={name}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground line-clamp-1">{name}</h3>
                      <p className="text-primary font-bold">₹{product.price}</p>
                      <p className={`text-sm ${product.stock > 10 ? 'text-primary' : 'text-sunrise'}`}>
                        {t('stock')}: {product.stock}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10"
                        onClick={() => handleEditClick(product)}
                      >
                        <Edit size={18} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleDeleteClick(product)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Product Form Dialog */}
      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={selectedProduct}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'ta' ? 'பொருளை நீக்கவா?' : 'Delete Product?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ta'
                ? `"${productToDelete?.name_ta || productToDelete?.name}" நீக்கப்படும். இது மீளமுடியாது.`
                : `"${productToDelete?.name}" will be removed. This cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === 'ta' ? 'ரத்து' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {language === 'ta' ? 'நீக்கு' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProductsScreen;
