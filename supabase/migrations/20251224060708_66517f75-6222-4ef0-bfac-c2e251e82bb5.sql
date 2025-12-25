-- Fix profiles table RLS - Drop RESTRICTIVE and create PERMISSIVE with TO authenticated
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Recreate as PERMISSIVE policies with TO authenticated (blocks anonymous access)
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix user_roles table RLS - Drop RESTRICTIVE and create PERMISSIVE with TO authenticated
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Recreate as PERMISSIVE policies with TO authenticated
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix order_documents table RLS
DROP POLICY IF EXISTS "Admins can manage all order documents" ON public.order_documents;
DROP POLICY IF EXISTS "Users can upload documents to their orders" ON public.order_documents;
DROP POLICY IF EXISTS "Users can view their order documents" ON public.order_documents;

CREATE POLICY "Users can view their order documents"
ON public.order_documents
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM orders
  WHERE orders.id = order_documents.order_id AND orders.user_id = auth.uid()
));

CREATE POLICY "Users can upload documents to their orders"
ON public.order_documents
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM orders
  WHERE orders.id = order_documents.order_id AND orders.user_id = auth.uid()
));

CREATE POLICY "Admins can view all order documents"
ON public.order_documents
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage order documents"
ON public.order_documents
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix user_documents table RLS
DROP POLICY IF EXISTS "Users can manage their own documents" ON public.user_documents;
DROP POLICY IF EXISTS "Users can view their own documents" ON public.user_documents;

CREATE POLICY "Users can view their own documents"
ON public.user_documents
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
ON public.user_documents
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
ON public.user_documents
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
ON public.user_documents
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user documents"
ON public.user_documents
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));