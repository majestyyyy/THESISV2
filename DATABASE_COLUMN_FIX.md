# Database Column Fix

## Issues Fixed
1. **Error**: `column f.created_at does not exist` - files table uses `upload_date` instead of `created_at`
2. **Error**: `cannot use column reference in DEFAULT expression` - PostgreSQL doesn't allow column references in DEFAULT

## What Was Fixed

### 1. Updated Database Interface
```typescript
// OLD
export interface DatabaseFile {
  created_at: string
}

// NEW
export interface DatabaseFile {
  upload_date: string
  original_name: string
}
```

### 2. Fixed SQL View
Updated the analytics view in `scripts/06-analytics-enhancement.sql`:
```sql
-- OLD
MAX(f.created_at) as last_file_upload,

-- NEW
MAX(f.upload_date) as last_file_upload,
```

### 3. Updated Analytics Code
Fixed references to use correct column names:
```typescript
// File activity tracking
date: file.upload_date  // instead of file.created_at
title: file.original_name || file.filename  // proper filename access
```

### 4. Added Compatibility Script
Created `scripts/07-database-compatibility-fix.sql` to:
- Add `created_at` column to files table as an alias
- Update the analytics view with compatibility fallbacks
- Add proper indexes

## How to Apply Fix

1. **Use the fixed migration script:**
   ```sql
   -- In Supabase SQL Editor, run:
   -- Copy contents of scripts/06-analytics-enhancement-fixed.sql
   ```

2. **Alternative compatibility fix (if needed):**
   ```sql
   -- Run contents of scripts/07-database-compatibility-fix.sql
   ```

3. **Restart your development server:**
   ```bash
   npm run dev
   ```

## Verification

After applying the fix:
1. Visit `/analytics/setup` to run the setup
2. Check that no database errors occur
3. Verify analytics data loads correctly at `/analytics`

The analytics system will now correctly handle the database schema differences and work with your existing data structure.