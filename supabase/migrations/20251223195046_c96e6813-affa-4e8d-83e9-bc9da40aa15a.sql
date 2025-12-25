-- Add delete policy for orders (admin only)
CREATE POLICY "Admins can delete orders" 
ON public.orders 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- Add delete policy for profiles (admin only)
CREATE POLICY "Admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));