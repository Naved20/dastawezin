-- Enable realtime for order_documents table  
ALTER TABLE public.order_documents REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_documents;