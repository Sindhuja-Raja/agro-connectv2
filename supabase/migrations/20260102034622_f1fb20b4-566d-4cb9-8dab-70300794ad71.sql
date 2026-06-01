-- Add special offer fields to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS special_offer_price numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS special_offer_text text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS special_offer_text_ta text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS special_offer_active boolean DEFAULT false;