# Fix Email Signup Issue

## The Problem
Email signups are disabled or email confirmation is required.

## Solution: Disable Email Confirmation via SQL

Go to Supabase SQL Editor and run this:

```sql
-- Disable email confirmation requirement
UPDATE auth.config 
SET email_autoconfirm = true 
WHERE id = 1;

-- Or try this if above doesn't work
UPDATE auth.config 
SET mailer_autoconfirm = true 
WHERE id = 1;
```

## If SQL Doesn't Work: Check Email Templates

1. Go to Authentication → Email Templates
2. Look for "Confirm signup" template
3. If it exists and is enabled, disable it
4. Save changes

## Quick Fix: Update Auth Settings via Dashboard

1. Go to Authentication → Providers → Email
2. Scroll to find these settings:
   - **"Confirm email"** - Toggle OFF
   - **"Auto confirm users"** - Toggle ON (if available)
3. Click Save

## Test After Fix

1. Restart dev server: `npm run dev`
2. Go to http://localhost:8080/auth
3. Try signing up with new email
4. Should work immediately without email confirmation

## If Still Not Working

Try this SQL to force auto-confirm:

```sql
-- Force auto-confirm for all new signups
UPDATE auth.config 
SET 
  email_autoconfirm = true,
  mailer_autoconfirm = true
WHERE id = 1;
```

Then restart dev server and try again.
