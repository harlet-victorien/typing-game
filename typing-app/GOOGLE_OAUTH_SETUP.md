# Google OAuth Setup Guide

## 1. Google Cloud Console Setup

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (now part of Google Identity Services)

### Step 2: Create OAuth 2.0 Credentials
1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Select **Web application** as the application type
4. Add these URLs to **Authorized redirect URIs**:
   - `https://[YOUR_SUPABASE_PROJECT_ID].supabase.co/auth/v1/callback`
   - For local development: `http://localhost:3000/auth/callback` (if needed)

### Step 3: Get Your Credentials
- Copy the **Client ID** and **Client Secret** from the credentials page

## 2. Supabase Dashboard Setup

### Step 1: Navigate to Authentication
1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Authentication** → **Providers**

### Step 2: Configure Google Provider
1. Find **Google** in the providers list
2. Toggle it **ON**
3. Enter your **Client ID** and **Client Secret** from Google Cloud Console
4. Click **Save**

### Step 3: Update Site URL (if needed)
1. Go to **Authentication** → **URL Configuration**
2. Make sure your **Site URL** is set correctly:
   - For production: `https://yourdomain.com`
   - For development: `http://localhost:3000`

## 3. Environment Variables

Make sure you have these environment variables in your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 4. Testing

1. Run your development server: `npm run dev`
2. Open the auth modal
3. Click "Continue with Google"
4. Complete the OAuth flow

## 5. Profile Creation

The Google OAuth will automatically create a user in your `auth.users` table. If you want to also create a profile in your `profiles` table, you can set up a database trigger:

```sql
-- Create a trigger to automatically create profiles for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (NEW.id, NEW.email, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Troubleshooting

- **"redirect_uri_mismatch"**: Check that your redirect URI in Google Cloud Console matches exactly
- **"invalid_client"**: Verify your Client ID and Client Secret are correct
- **Profile not created**: Make sure you have the database trigger set up or handle profile creation in your app

## Security Notes

- Never expose your Client Secret in client-side code
- Use environment variables for sensitive data
- Regularly rotate your OAuth credentials
- Set up proper CORS policies 