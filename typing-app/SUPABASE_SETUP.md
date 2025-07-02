# Supabase Setup Guide

This guide will help you set up Supabase authentication and database for your typing app.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Click "New Project"
3. Choose your organization and enter project details
4. Wait for the project to be created

## 2. Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - Project URL
   - Public anon key
   - Service role key (keep this secret!)

## 3. Set Up Environment Variables

1. Create a `.env.local` file in your `typing-app` directory:

```bash
# Copy this into your .env.local file
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Replace the placeholder values with your actual Supabase credentials.

## 4. Set Up Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-schema.sql` and run it
3. This will create:
   - `profiles` table for user information
   - `scores` table for storing typing game scores
   - Row Level Security policies
   - Triggers for automatic profile creation

## 5. Configure Authentication

1. In your Supabase dashboard, go to **Authentication** > **Settings**
2. Under **Site URL**, add your local development URL: `http://localhost:3000`
3. For production, add your deployed URL

### Email Settings (Optional)
1. Go to **Authentication** > **Settings** > **SMTP Settings**
2. Configure your email provider for user confirmation emails
3. Or use Supabase's built-in email service

## 6. Test Your Setup

1. Start your development server: `npm run dev`
2. Try signing up with a new account
3. Check if the user appears in **Authentication** > **Users**
4. Complete a typing game and check if scores appear in **Database** > **scores**

## 7. Database Structure

### Profiles Table
- `id`: UUID (references auth.users.id)
- `email`: User's email address
- `username`: Optional username
- `avatar_url`: Optional avatar URL
- `created_at`, `updated_at`: Timestamps

### Scores Table
- `id`: UUID (primary key)
- `user_id`: UUID (references auth.users.id)
- `wpm`: Words per minute
- `accuracy`: Accuracy percentage
- `words_typed`: Number of correct words typed
- `errors`: Number of errors made
- `time_duration`: Duration of the test (default 60 seconds)
- `created_at`: Timestamp

## 8. Security Features

- **Row Level Security (RLS)** is enabled on all tables
- Users can only insert their own scores
- All users can view the leaderboard (scores are public)
- Profiles are public but users can only edit their own

## Troubleshooting

### Common Issues:

1. **Environment variables not loading**: Make sure `.env.local` is in the correct directory and restart your dev server

2. **Database connection issues**: Verify your Project URL and keys are correct

3. **Authentication not working**: Check that your Site URL is configured correctly in Supabase settings

4. **Scores not saving**: Ensure the user is logged in and the scores table exists with proper RLS policies

### Need Help?

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the browser console for error messages
- Verify your database tables were created correctly in the Supabase dashboard

## Next Steps

Once set up, users can:
- Sign up and log in to the typing app
- Have their scores automatically saved
- View their position on the leaderboard
- Track their typing progress over time 