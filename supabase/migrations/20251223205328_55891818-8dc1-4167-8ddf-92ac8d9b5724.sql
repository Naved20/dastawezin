-- Add expected_delivery_date column to orders table
ALTER TABLE public.orders 
ADD COLUMN expected_delivery_date date DEFAULT NULL;