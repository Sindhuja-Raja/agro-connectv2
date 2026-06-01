import { supabase } from '@/integrations/supabase/client';

export interface DbProduct {
  id: string;
  name: string;
  name_ta: string | null;
  price: number;
  image_url: string | null;
  category: string;
  stock: number;
  weight_kg: number | null;
  description: string | null;
  description_ta: string | null;
  usage: string | null;
  usage_ta: string | null;
  suitable_for: string[] | null;
  suitable_for_ta: string[] | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  special_offer_price: number | null;
  special_offer_text: string | null;
  special_offer_text_ta: string | null;
  special_offer_active: boolean | null;
}

export const fetchProducts = async (): Promise<DbProduct[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  return data || [];
};

export const fetchProductsByCategory = async (category: string): Promise<DbProduct[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }

  return data || [];
};

export const fetchProductById = async (id: string): Promise<DbProduct | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching product:', error);
    throw error;
  }

  return data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

export const updateProductStock = async (id: string, stock: number): Promise<void> => {
  const { error } = await supabase
    .from('products')
    .update({ stock })
    .eq('id', id);

  if (error) {
    console.error('Error updating stock:', error);
    throw error;
  }
};

export interface ProductFormData {
  name: string;
  name_ta?: string;
  price: number;
  stock: number;
  weight_kg?: number;
  category: string;
  description?: string;
  description_ta?: string;
  image_url?: string;
  special_offer_price?: number | null;
  special_offer_text?: string;
  special_offer_text_ta?: string;
  special_offer_active?: boolean;
}

export const createProduct = async (data: ProductFormData): Promise<DbProduct> => {
  const { data: product, error } = await supabase
    .from('products')
    .insert({
      name: data.name,
      name_ta: data.name_ta || null,
      price: data.price,
      stock: data.stock,
      weight_kg: data.weight_kg || null,
      category: data.category,
      description: data.description || null,
      description_ta: data.description_ta || null,
      image_url: data.image_url || null,
      is_active: true,
      special_offer_price: data.special_offer_price || null,
      special_offer_text: data.special_offer_text || null,
      special_offer_text_ta: data.special_offer_text_ta || null,
      special_offer_active: data.special_offer_active || false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }

  return product as DbProduct;
};

export const updateProduct = async (id: string, data: Partial<ProductFormData>): Promise<void> => {
  const { error } = await supabase
    .from('products')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const categories = [
  { id: 'seeds', icon: 'Sprout', color: 'bg-primary' },
  { id: 'fertilizers', icon: 'Flower2', color: 'bg-sunrise' },
  { id: 'pesticides', icon: 'Bug', color: 'bg-sky' },
  { id: 'tools', icon: 'Wrench', color: 'bg-soil' },
];
