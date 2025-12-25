-- Create a function to validate admin role assignment
CREATE OR REPLACE FUNCTION public.validate_admin_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Only check for admin role assignments
  IF NEW.role = 'admin' THEN
    -- Get the email of the user being assigned the role
    SELECT email INTO user_email
    FROM public.profiles
    WHERE id = NEW.user_id;
    
    -- Only allow admin role for naved2010m@gmail.com
    IF user_email IS NULL OR user_email != 'naved2010m@gmail.com' THEN
      RAISE EXCEPTION 'Admin role can only be assigned to naved2010m@gmail.com';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to enforce admin restriction on insert
CREATE TRIGGER enforce_admin_restriction_insert
BEFORE INSERT ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.validate_admin_role();

-- Create trigger to enforce admin restriction on update
CREATE TRIGGER enforce_admin_restriction_update
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.validate_admin_role();