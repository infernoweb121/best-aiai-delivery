-- Add address fields to orders table
ALTER TABLE public.orders ADD COLUMN customer_address TEXT;
ALTER TABLE public.orders ADD COLUMN customer_city TEXT;
ALTER TABLE public.orders ADD COLUMN customer_state TEXT;
ALTER TABLE public.orders ADD COLUMN customer_zipcode TEXT;
ALTER TABLE public.orders ADD COLUMN customer_cpf TEXT;