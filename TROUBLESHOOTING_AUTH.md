# Auth & Database Troubleshooting Guide

## Quick Diagnosis

### Step 1: Check Supabase Connection

Open browser console (F12) and run:

```javascript
// Check if Supabase is connected
import { supabase } from '@/integrations/supabase/client';

// Test connection
const { data, error } = await supabase.auth.getSession();
console.log('Session:', data);
console.log('Error:', error);
```

### Step 2: Verify Environment Variables

Check that `.env` has correct values:

```
VITE_SUPABASE_PROJECT_ID="scffevulfrkwxximfwhw"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_ywuGRJg0gxJui6aY-yHh5w_0DPzOAlN"
VITE_SUPABASE_URL="https://scffevulfrkwxximfwhw.supabase.co"
```

If any are wrong, update and restart dev server.

### Step 3: Check Supabase Dashboard

1. Go to https://app.supabase.com
2. Select project `scffevulfrkwxximfwhw`
3. Check **Authentication** → **Providers**
   - Email should be **ENABLED**
   - If not, enable it and save

## Common Issues & Fixes

### Issue 1: "Invalid login credentials" on signup

**Cause:** Email authentication not enabled

**Fix:**
1. Go to Authentication → Providers
2. Enable Email provider
3. Click Save
4. Try signup again

### Issue 2: "User already exists" error

**Cause:** User already registered with that email

**Fix:**
1. Use different email
2. Or go to Authentication → Users
3. Find the user and delete it
4. Try signup again

### Issue 3: Signup works but can't login

**Cause:** Profile not created or RLS policies blocking

**Fix:**
1. Go to SQL Editor
2. Run: `SELECT * FROM public.profiles;`
3. If empty, run the trigger creation SQL
4. Check RLS policies exist

### Issue 4: "Permission denied" error

**Cause:** Row Level Security (RLS) policies missing or wrong

**Fix:**
1. Go to Authentication → Policies
2. Check profiles table has these policies:
   - "Users can view their own profile"
   - "Users can update their own profile"
   - "Users can insert their own profile"
3. If missing, run the RLS policy SQL

### Issue 5: Database connection timeout

**Cause:** Wrong Supabase URL or project not initialized

**Fix:**
1. Check `.env` file has correct URL
2. Verify project exists at https://app.supabase.com
3. Restart dev server: `npm run dev`

## Step-by-Step Fix

### If Nothing Works, Follow This:

**Step 1: Verify Email Auth is Enabled**
```
1. Go to https://app.supabase.com
2. Select project scffevulfrkwxximfwhw
3. Click Authentication → Providers
4. Find Email and toggle ON
5. Click Save
```

**Step 2: Run Minimal Setup SQL**
```
1. Go to SQL Editor
2. Copy entire content from supabase/migrations/20250101_minimal_setup.sql
3. Paste into SQL Editor
4. Click Run
5. Wait for success message
```

**Step 3: Restart Dev Server**
```bash
# Stop current server (Ctrl+C)
# Then run:
npm run dev
```

**Step 4: Test Signup**
```
1. Go to http://localhost:8080/auth
2. Click "Sign up"
3. Fill in:
   - Full Name: Test User
   - Email: test@example.com
   - Password: Test123456
4. Click "Create account"
5. Check browser console for errors
```

**Step 5: Check Supabase Logs**
```
1. Go to Supabase Dashboard
2. Click Logs in left sidebar
3. Filter by API or Auth
4. Look for error messages
5. Screenshot and share if stuck
```

## Debug Checklist

- [ ] Email authentication enabled in Supabase
- [ ] `.env` file has correct credentials
- [ ] Profiles table exists
- [ ] RLS policies exist on profiles table
- [ ] Trigger `on_auth_user_created` exists
- [ ] Dev server restarted after changes
- [ ] Browser cache cleared (Ctrl+Shift+Delete)
- [ ] No errors in browser console (F12)
- [ ] No errors in Supabase logs

## If Still Stuck

1. **Check Supabase Status:**
   - https://status.supabase.com

2. **Verify Project Initialization:**
   - Go to Supabase Dashboard
   - Check if project shows "Active"
   - If not, wait 5-10 minutes

3. **Try Different Email:**
   - Some emails might be blocked
   - Use a different email to test

4. **Clear Browser Cache:**
   - Press Ctrl+Shift+Delete
   - Clear all cache
   - Reload page

5. **Check Network Tab:**
   - F12 → Network tab
   - Try signup
   - Look for failed requests
   - Check response for error details

## Useful SQL Queries

Run these in SQL Editor to debug:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check all users
SELECT id, email, created_at FROM auth.users;

-- Check profiles
SELECT * FROM public.profiles;

-- Check if trigger exists
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check RLS policies
SELECT * FROM pg_policies 
WHERE tablename = 'profiles';

-- Check storage buckets
SELECT * FROM storage.buckets;
```

## Contact Support

If you're still having issues:

1. Go to Supabase Dashboard
2. Click Help → Support
3. Describe the issue
4. Include:
   - Error message
   - Steps to reproduce
   - Browser console errors
   - Supabase logs
