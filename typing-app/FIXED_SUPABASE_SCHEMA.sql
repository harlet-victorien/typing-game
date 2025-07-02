-- ============================================
-- FIXED SUPABASE SCHEMA FOR GOOGLE OAUTH
-- ============================================

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table (updated)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE, -- Keep unique but handle NULL values properly
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (id)
);

-- Create scores table (unchanged)
CREATE TABLE IF NOT EXISTS public.scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    wpm INTEGER NOT NULL,
    accuracy INTEGER NOT NULL,
    words_typed INTEGER DEFAULT 0,
    errors INTEGER DEFAULT 0,
    time_duration INTEGER DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS scores_user_id_idx ON public.scores(user_id);
CREATE INDEX IF NOT EXISTS scores_wpm_idx ON public.scores(wpm DESC);
CREATE INDEX IF NOT EXISTS scores_created_at_idx ON public.scores(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create policies for scores table  
CREATE POLICY "Scores are viewable by everyone" ON public.scores
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own scores" ON public.scores
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FIXED FUNCTION TO HANDLE NEW USER SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_username TEXT;
    base_username TEXT;
    counter INTEGER := 0;
BEGIN
    -- Skip if profile already exists (prevents duplicate key errors)
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
        RETURN NEW;
    END IF;

    -- Extract username from metadata or create from email
    user_username := COALESCE(
        NEW.raw_user_meta_data->>'username',
        NEW.raw_user_meta_data->>'preferred_username',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );

    -- Clean username (remove spaces, special chars, make lowercase)
    user_username := lower(regexp_replace(user_username, '[^a-zA-Z0-9]', '', 'g'));
    
    -- Ensure username is not empty
    IF user_username = '' OR user_username IS NULL THEN
        user_username := 'user' || substr(NEW.id::text, 1, 8);
    END IF;

    base_username := user_username;

    -- Handle username uniqueness by appending numbers if needed
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = user_username) LOOP
        counter := counter + 1;
        user_username := base_username || counter::text;
        
        -- Prevent infinite loop (fallback to UUID)
        IF counter > 999 THEN
            user_username := 'user' || substr(NEW.id::text, 1, 8);
            EXIT;
        END IF;
    END LOOP;

    -- Insert the profile with error handling
    BEGIN
        INSERT INTO public.profiles (id, email, username, avatar_url)
        VALUES (
            NEW.id, 
            NEW.email, 
            user_username,
            COALESCE(
                NEW.raw_user_meta_data->>'avatar_url',
                NEW.raw_user_meta_data->>'picture'
            )
        );
    EXCEPTION WHEN OTHERS THEN
        -- Log error but don't fail the auth process
        RAISE LOG 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on profiles
DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- CLEANUP FUNCTION (run this if you have existing issues)
-- ============================================
CREATE OR REPLACE FUNCTION public.cleanup_duplicate_profiles()
RETURNS void AS $$
BEGIN
    -- Remove duplicate profiles, keeping the oldest one
    DELETE FROM public.profiles 
    WHERE id IN (
        SELECT id FROM (
            SELECT id, 
                   ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at) as rn
            FROM public.profiles
        ) t 
        WHERE rn > 1
    );
END;
$$ LANGUAGE plpgsql; 