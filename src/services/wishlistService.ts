import { supabase } from '@/integrations/supabase/client';

export const fetchWishlist = async (userId: string) => {
  const { data, error } = await supabase
    .from('wishlist')
    .select('product_id')
    .eq('user_id', userId);

  if (error) throw error;
  return data?.map(w => w.product_id) || [];
};

export const addToWishlist = async (userId: string, productId: string) => {
  const { error } = await supabase
    .from('wishlist')
    .insert({ user_id: userId, product_id: productId });

  if (error && error.code !== '23505') throw error; // ignore duplicate
};

export const removeFromWishlist = async (userId: string, productId: string) => {
  const { error } = await supabase
    .from('wishlist')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) throw error;
};
