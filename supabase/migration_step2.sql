-- Add original_price to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS original_price numeric(12,2);

-- Add address to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS address text;

-- Add a comment to the columns
COMMENT ON COLUMN public.products.original_price IS 'Original price of the product before discount';
COMMENT ON COLUMN public.profiles.address IS 'Full address of the user for shipping';
