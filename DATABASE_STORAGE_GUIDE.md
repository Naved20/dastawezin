# Database & Storage Guide for Dastawez

## Overview
Your application uses **Supabase** for both database and file storage. Supabase is a Firebase alternative that provides PostgreSQL database and cloud storage.

## Database Location

### Supabase Project Details
- **Project ID:** `argoceffxuvpsgumjtcw`
- **Project URL:** `https://argoceffxuvpsgumjtcw.supabase.co`
- **Database Type:** PostgreSQL
- **Region:** (Check Supabase dashboard for exact region)

### Access Your Database

1. **Go to Supabase Dashboard:**
   - URL: https://app.supabase.com
   - Sign in with your account

2. **Select Your Project:**
   - Project name: Look for `argoceffxuvpsgumjtcw`

3. **Navigate to Database:**
   - Click on "SQL Editor" or "Database" in the left sidebar
   - You'll see all your tables here

### Database Tables

Your application has the following tables:

#### 1. **profiles**
- Stores user profile information
- Columns: `id`, `user_id`, `full_name`, `avatar_url`, `created_at`, `updated_at`
- Linked to: `auth.users` table

#### 2. **services**
- Stores available services (document printing, certificates, etc.)
- Columns: `id`, `name`, `description`, `price`, `category`, `created_at`

#### 3. **orders**
- Stores customer orders
- Columns: `id`, `user_id`, `service_id`, `status`, `amount`, `created_at`, `updated_at`

#### 4. **user_roles**
- Stores user roles (admin, user, etc.)
- Columns: `user_id`, `role`, `created_at`

#### 5. **notifications**
- Stores user notifications
- Columns: `id`, `user_id`, `title`, `message`, `read`, `created_at`

#### 6. **documents**
- Stores uploaded documents
- Columns: `id`, `user_id`, `file_url`, `file_name`, `file_type`, `created_at`

## Storage Location

### Supabase Storage Buckets

Your application uses the following storage buckets:

#### 1. **avatars** (Public)
- **Purpose:** Store user profile pictures
- **Access:** Public (anyone can view)
- **Path Structure:** `avatars/{user_id}/{filename}`
- **Permissions:** 
  - Users can upload their own avatar
  - Users can update their own avatar
  - Users can delete their own avatar
  - Public can read all avatars

#### 2. **documents** (Private - if created)
- **Purpose:** Store user documents
- **Access:** Private (only authenticated users)
- **Path Structure:** `documents/{user_id}/{filename}`

#### 3. **orders** (Private - if created)
- **Purpose:** Store order-related files
- **Access:** Private (only authenticated users)
- **Path Structure:** `orders/{order_id}/{filename}`

## How to Access Storage

### Via Supabase Dashboard

1. **Go to Supabase Dashboard:**
   - URL: https://app.supabase.com

2. **Select Your Project**

3. **Navigate to Storage:**
   - Click on "Storage" in the left sidebar
   - You'll see all your buckets

4. **View Files:**
   - Click on a bucket to see all files
   - Click on a file to view or download it

### Via Code (React)

```typescript
import { supabase } from '@/integrations/supabase/client';

// Upload a file
const uploadFile = async (file: File, bucket: string, path: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file);
  
  if (error) console.error('Upload error:', error);
  return data;
};

// Get public URL
const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
};

// Download a file
const downloadFile = async (bucket: string, path: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path);
  
  if (error) console.error('Download error:', error);
  return data;
};

// Delete a file
const deleteFile = async (bucket: string, path: string) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  
  if (error) console.error('Delete error:', error);
};
```

## Environment Variables

Your database and storage credentials are stored in `.env`:

```
VITE_SUPABASE_PROJECT_ID="argoceffxuvpsgumjtcw"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_URL="https://argoceffxuvpsgumjtcw.supabase.co"
```

**Important:** Never commit these to version control. They're already in `.gitignore`.

## Database Queries

### Query Examples

```typescript
import { supabase } from '@/integrations/supabase/client';

// Get all services
const getServices = async () => {
  const { data, error } = await supabase
    .from('services')
    .select('*');
  return { data, error };
};

// Get user's orders
const getUserOrders = async (userId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId);
  return { data, error };
};

// Create a new order
const createOrder = async (order: any) => {
  const { data, error } = await supabase
    .from('orders')
    .insert([order]);
  return { data, error };
};

// Update order status
const updateOrderStatus = async (orderId: string, status: string) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);
  return { data, error };
};

// Delete a document
const deleteDocument = async (docId: string) => {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', docId);
  return { error };
};
```

## Backup & Security

### Automatic Backups
- Supabase automatically backs up your database daily
- Backups are retained for 7 days (free tier)
- Access backups from Supabase dashboard → Database → Backups

### Security Best Practices
1. **Row Level Security (RLS):** Enable RLS on all tables
2. **API Keys:** Keep your API keys secret
3. **Passwords:** Use strong passwords for Supabase account
4. **Backups:** Regularly export important data
5. **Monitoring:** Check Supabase dashboard for suspicious activity

## Monitoring & Maintenance

### Check Database Health
1. Go to Supabase Dashboard
2. Click on "Database" → "Health"
3. Monitor:
   - Database size
   - Connection count
   - Query performance

### View Logs
1. Go to Supabase Dashboard
2. Click on "Logs" in the left sidebar
3. Filter by:
   - Database logs
   - API logs
   - Auth logs

## Scaling & Limits

### Free Tier Limits
- Database: 500 MB
- Storage: 1 GB
- Bandwidth: 2 GB/month
- Concurrent connections: 10

### Upgrade to Pro
- Database: 8 GB
- Storage: 100 GB
- Bandwidth: 50 GB/month
- Concurrent connections: 100

## Useful Links

- **Supabase Dashboard:** https://app.supabase.com
- **Supabase Documentation:** https://supabase.com/docs
- **PostgreSQL Documentation:** https://www.postgresql.org/docs/
- **Supabase Storage Guide:** https://supabase.com/docs/guides/storage

## Support

For issues with your database or storage:
1. Check Supabase status: https://status.supabase.com
2. Visit Supabase docs: https://supabase.com/docs
3. Contact Supabase support through dashboard
