# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for the AI-GIR application.

## Prerequisites

1. A Supabase account (free at https://supabase.com)
2. Your Supabase project credentials (already provided in `.env.local`)

## Database Setup

1. **Go to your Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Navigate to your project: https://djojjfpftbsfbltyweny.supabase.co

2. **Run the Database Schema**
   - Go to the SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `scripts/03-supabase-auth-setup.sql`
   - Run the script to create all tables, policies, and triggers

3. **Configure Authentication Settings**
   - Go to Authentication > Settings in your Supabase dashboard
   - Set the following:
     - **Site URL**: `http://localhost:3000` (for development)
     - **Redirect URLs**: Add `http://localhost:3000/reset-password`
   - Enable email confirmations if desired
   - Configure email templates if needed

## Features Implemented

### ✅ Authentication
- **Sign Up**: Users can create accounts with email/password
- **Sign In**: Users can log in with email/password
- **Sign Out**: Users can securely log out
- **Password Reset**: Users can reset their passwords via email
- **Email Confirmation**: Support for email verification (optional)

### ✅ Security
- **Row Level Security (RLS)**: All tables have proper RLS policies
- **User Isolation**: Users can only access their own data
- **Secure Sessions**: Supabase handles session management

### ✅ Database Integration
- **User Profiles**: Automatic profile creation on sign-up
- **Data Relationships**: All tables properly reference user data
- **Triggers**: Automatic profile updates when auth data changes

## Environment Variables

Your `.env.local` file should contain:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://djojjfpftbsfbltyweny.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqb2pqZnBmdGJzZmJsdHl3ZW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MTk2MzEsImV4cCI6MjA3MDk5NTYzMX0.PqzZcHfQ6lTNCpY2mkM-LJeheg_IMh3CAJQKwWIThzk
```

## Testing Authentication

1. **Start the development server**: `npm run dev`
2. **Visit**: http://localhost:3000
3. **Test Sign Up**:
   - Go to /signup
   - Create a new account
   - Check your email for confirmation (if enabled)
4. **Test Sign In**:
   - Go to /signin
   - Log in with your credentials
   - Should redirect to /dashboard
5. **Test Password Reset**:
   - Go to /forgot-password
   - Enter your email
   - Check your email for reset link

## File Changes Made

### Updated Files:
- `lib/supabase.ts` - Updated with your Supabase credentials
- `lib/auth.ts` - Complete rewrite to use Supabase Auth
- `components/auth/auth-provider.tsx` - Updated to use Supabase session management
- `components/layout/dashboard-layout.tsx` - Updated sign-out functionality
- `app/signin/page.tsx` - Removed demo credentials

### New Files:
- `app/reset-password/page.tsx` - Password reset page
- `scripts/03-supabase-auth-setup.sql` - Database schema and policies

## Next Steps

1. Run the SQL script in your Supabase dashboard
2. Test the authentication flow
3. Configure email templates in Supabase (optional)
4. Set up production environment variables when deploying

## Troubleshooting

### Common Issues:

1. **"Invalid credentials" error**: Make sure the email/password are correct
2. **Database errors**: Ensure you've run the SQL setup script
3. **Email not sending**: Check your Supabase email settings
4. **Redirect issues**: Verify your Site URL and Redirect URLs in Supabase settings

### Getting Help:

- Check Supabase documentation: https://supabase.com/docs
- View Supabase dashboard logs for detailed error messages
- Ensure all environment variables are correctly set
