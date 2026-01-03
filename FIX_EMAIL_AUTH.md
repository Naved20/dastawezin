# Fix Email Authentication - 400 Bad Request Error

## The Problem

You're getting **400 Bad Request** errors on signup/login. This means email/password authentication is not enabled in Supabase.

## Solution: Enable Email/Password Auth

### Step 1: Go to Supabase Dashboard
1. https://app.supabase.com
2. Select project: `scffevulfrkwxximfwhw`
3. Click **Authentication** in left sidebar

### Step 2: Check Email Provider Settings
1. Click **Providers**
2. Find **Email** provider
3. **IMPORTANT:** Look for these toggles:
   - ✅ **"Enable Email provider"** - Should be ON
   - ✅ **"Enable email/password signups"** - Should be ON (if this option exists)
   - ❌ **"Confirm email"** - Should be OFF
   - ✅ **"Auto confirm users"** - Should be ON (if this option exists)

### Step 3: Save Changes
- Click **Save** button
- Wait for confirmation

### Step 4: Restart Dev Server
```bash
npm run dev
```

### Step 5: Test Signup
1. Go to http://localhost:8080/auth
2. Try signing up with new email
3. Check browser console for errors

---

## If Email/Password Still Doesn't Work

Try using **Magic Links** instead:

### Option A: Use Magic Link Authentication

Magic links send a login link via email (no password needed).

1. Go to **Authentication → Providers**
2. Find **Email** provider
3. Look for **"Enable email/password signups"** toggle
4. If it's OFF and you can't turn it ON, then magic links might be your only option

### Option B: Use Google OAuth

Google OAuth is already set up in your code:

1. Go to **Authentication → Providers**
2. Find **Google**
3. Make sure it's **Enabled**
4. Users can click "Continue with Google" to sign in

---

## Troubleshooting

### Error: "Email signups are disabled"
**Fix:** Enable email/password signups in Email provider settings

### Error: "Email not confirmed"
**Fix:** Disable "Confirm email" in Email provider settings

### Error: "Invalid login credentials"
**Fix:** User doesn't exist or wrong password

### Error: "401 Unauthorized" on profile insert
**Fix:** RLS policies are blocking insert
- Run this SQL in SQL Editor:
```sql
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## Check Email Provider Settings

The Email provider page should show:

```
☑️ Enable Email provider
   This will enable Email based signup and login for your application

☐ Secure email change
☐ Secure password change
☐ Prevent use of leaked passwords

Minimum password length: 6
Password Requirements: No required characters (default)
Email OTP Expiration: 3600 seconds
Email OTP Length: 6
```

**Key:** Make sure the first toggle is ON (checked/blue).

---

## If You Still Can't Find Email/Password Option

Your Supabase project might have email/password disabled at the account level. Try:

1. **Create a new Supabase project:**
   - Go to https://app.supabase.com
   - Click "New Project"
   - Create new project
   - Update `.env` with new credentials
   - Run migrations again

2. **Or use Google OAuth only:**
   - Users can sign in with Google
   - No email/password needed

---

## Quick Test

After enabling email/password auth:

```
Email: test@example.com
Password: Test123456
Full Name: Test User

Try signing up → Should work
Try signing in → Should work
```

---

## Still Stuck?

1. Take a screenshot of your Email provider settings
2. Share what toggles you see
3. Share the exact error message from browser console
4. I can help you fix it
