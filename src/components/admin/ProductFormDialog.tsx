import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DbProduct, ProductFormData, categories } from '@/services/productService';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, X, Loader2, Tag } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: DbProduct | null;
  onSubmit: (data: ProductFormData) => void;
  isLoading?: boolean;
}

const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  open,
  onOpenChange,
  product,
  onSubmit,
  isLoading,
}) => {
  const { language } = useLanguage();
  const isEditing = !!product;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    name_ta: '',
    price: 0,
    stock: 0,
    weight_kg: 0,
    category: 'seeds',
    description: '',
    description_ta: '',
    image_url: '',
    special_offer_price: null,
    special_offer_text: '',
    special_offer_text_ta: '',
    special_offer_active: false,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        name_ta: product.name_ta || '',
        price: product.price,
        stock: product.stock,
        weight_kg: product.weight_kg || 0,
        category: product.category,
        description: product.description || '',
        description_ta: product.description_ta || '',
        image_url: product.image_url || '',
        special_offer_price: product.special_offer_price || null,
        special_offer_text: product.special_offer_text || '',
        special_offer_text_ta: product.special_offer_text_ta || '',
        special_offer_active: product.special_offer_active || false,
      });
      setPreviewUrl(product.image_url || null);
    } else {
      setFormData({
        name: '',
        name_ta: '',
        price: 0,
        stock: 0,
        weight_kg: 0,
        category: 'seeds',
        description: '',
        description_ta: '',
        image_url: '',
        special_offer_price: null,
        special_offer_text: '',
        special_offer_text_ta: '',
        special_offer_active: false,
      });
      setPreviewUrl(null);
    }
  }, [product, open]);

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      setPreviewUrl(publicUrl);
    } catch (error) {
      console.error('Upload error:', error);
      alert(language === 'ta' ? 'படம் பதிவேற்றம் தோல்வி' : 'Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image_url: '' }));
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price < 0 || formData.stock < 0) return;
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? language === 'ta' ? 'பொருளை திருத்து' : 'Edit Product'
              : language === 'ta' ? 'புதிய பொருள்' : 'Add Product'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'ta' ? 'பெயர் (ஆங்கிலம்)' : 'Name (English)'}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Product name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ta' ? 'பெயர் (தமிழ்)' : 'Name (Tamil)'}</Label>
              <Input
                value={formData.name_ta}
                onChange={(e) => setFormData({ ...formData, name_ta: e.target.value })}
                placeholder="பொருள் பெயர்"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{language === 'ta' ? 'விலை (₹)' : 'Price (₹)'}</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ta' ? 'கையிருப்பு' : 'Stock'}</Label>
              <Input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ta' ? 'எடை (கிலோ)' : 'Weight (kg)'}</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.weight_kg}
                onChange={(e) => setFormData({ ...formData, weight_kg: parseFloat(e.target.value) || 0 })}
                placeholder="0.5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{language === 'ta' ? 'வகை' : 'Category'}</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.id.charAt(0).toUpperCase() + cat.id.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{language === 'ta' ? 'படம்' : 'Image'}</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {previewUrl ? (
              <div className="relative w-full h-32 border rounded-lg overflow-hidden bg-muted">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={removeImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {language === 'ta' ? 'பதிவேற்றுகிறது...' : 'Uploading...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {language === 'ta' ? 'படம் பதிவேற்ற கிளிக் செய்யவும்' : 'Click to upload image'}
                    </span>
                  </>
                )}
              </div>
            )}
            
            <Input
              value={formData.image_url}
              onChange={(e) => {
                setFormData({ ...formData, image_url: e.target.value });
                setPreviewUrl(e.target.value || null);
              }}
              placeholder={language === 'ta' ? 'அல்லது URL உள்ளிடவும்' : 'Or enter URL'}
              className="text-xs"
            />
          </div>

          {/* Special Offer Section */}
          <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-red-500" />
                <Label className="font-semibold">
                  {language === 'ta' ? 'சிறப்பு சலுகை' : 'Special Offer'}
                </Label>
              </div>
              <Switch
                checked={formData.special_offer_active || false}
                onCheckedChange={(checked) => setFormData({ ...formData, special_offer_active: checked })}
              />
            </div>

            {formData.special_offer_active && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>{language === 'ta' ? 'சலுகை விலை (₹)' : 'Offer Price (₹)'}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.special_offer_price || ''}
                    onChange={(e) => setFormData({ ...formData, special_offer_price: parseFloat(e.target.value) || null })}
                    placeholder={language === 'ta' ? 'சலுகை விலை' : 'Discounted price'}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>{language === 'ta' ? 'சலுகை குறிப்பு (EN)' : 'Offer Text (EN)'}</Label>
                    <Input
                      value={formData.special_offer_text || ''}
                      onChange={(e) => setFormData({ ...formData, special_offer_text: e.target.value })}
                      placeholder="e.g. 20% OFF!"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ta' ? 'சலுகை குறிப்பு (TA)' : 'Offer Text (TA)'}</Label>
                    <Input
                      value={formData.special_offer_text_ta || ''}
                      onChange={(e) => setFormData({ ...formData, special_offer_text_ta: e.target.value })}
                      placeholder="எ.கா. 20% தள்ளுபடி!"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>{language === 'ta' ? 'விளக்கம் (ஆங்கிலம்)' : 'Description (English)'}</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>{language === 'ta' ? 'விளக்கம் (தமிழ்)' : 'Description (Tamil)'}</Label>
            <Textarea
              value={formData.description_ta}
              onChange={(e) => setFormData({ ...formData, description_ta: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              {language === 'ta' ? 'ரத்து' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              variant="farmer"
              className="flex-1"
              disabled={isLoading || !formData.name}
            >
              {isLoading
                ? (language === 'ta' ? 'சேமிக்கிறது...' : 'Saving...')
                : (language === 'ta' ? 'சேமி' : 'Save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
