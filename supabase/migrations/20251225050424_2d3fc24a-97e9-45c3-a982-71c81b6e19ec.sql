-- Add custom_fields and price_per_copy columns to services table
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS custom_fields jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS price_per_copy boolean DEFAULT false;