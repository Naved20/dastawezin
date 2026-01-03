# Supabase Setup Checklist

## Critical Steps to Fix Auth Issues

### Step 1: Enable Email Authentication ⚠️ IMPORTANT

1. Go to https://app.supabase.com
2. Select project: `scffevulfrkwxximfwhw`
3. Click **Authentication** in left sidebar
4. Click **Providers**
5. Find **Email** provider
6. Toggle it **ON** (Enable)
7. Click **Save**

### Step 2: Verify Database Tables Exist

1. Go to **SQL Editor**
2. Run this query to check tables:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see:
- profiles
- services
- orders
- documents
- user_roles
- notifications

If tables are missing, run the full migration SQL.

### Step 3: Check Row Level Security (RLS) Policies

1. Go to **Authentication** → **Policies**
2. For each table, verify policies exist:

**profiles table should have:**
- "Users can view their own profile"
- "Users can update their own profile"
- "Users can insert their own profile"

**If policies are missing, run this SQL:**

```sql
-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Step 4: Create Profile Trigger

Run this SQL in SQL Editor:

```sql
-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Step 5: Test Connection

1. Open browser console (F12)
2. Go to http://localhost:8080/auth
3. Try to sign up with test email
4. Check browser console for errors
5. Check Supabase logs: **Logs** → **API** for any errors

### Step 6: Verify Storage Buckets

1. Go to **Storage** in Supabase
2. You should see 3 buckets:
   - avatars (public)
   - documents (private)
   - orders (private)

If missing, run:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('documents', 'documents', false),
  ('orders', 'orders', false)
ON CONFLICT (id) DO NOTHING;
```

## Troubleshooting

### Error: "Invalid login credentials"
- Email authentication not enabled
- User doesn't exist
- Wrong password

### Error: "User already exists"
- User already registered
- Try signing in instead

### Error: "Profile insert failed"
- RLS policies blocking insert
- Trigger not working
- Check Supabase logs

### Error: "Connection refused"
- Wrong Supabase URL
- Project not initialized
- Check .env file

## Quick Debug Commands

Run these in Supabase SQL Editor:

```sql
-- Check if email auth is enabled
SELECT * FROM auth.config;

-- Check all users
SELECT id, email, created_at FROM auth.users;

-- Check profiles
SELECT * FROM public.profiles;

-- Check user roles
SELECT * FROM public.user_roles;

-- Check if trigger exists
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

## If Still Not Working

1. **Delete and recreate project:**
   - Go to Project Settings
   - Click "Delete Project"
   - Create new project
   - Run all SQL migrations again

2. **Check Supabase Status:**
   - https://status.supabase.com

3. **Check Browser Console:**
   - F12 → Console tab
   - Look for error messages

4. **Check Supabase Logs:**
   - Supabase Dashboard → Logs
   - Filter by API or Auth
