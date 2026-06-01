-- Add weight_kg column to products table
ALTER TABLE public.products
ADD COLUMN weight_kg numeric DEFAULT NULL;