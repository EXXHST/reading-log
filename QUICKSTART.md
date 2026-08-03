# Quick Start (5 minutes)

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Create Supabase Account & Project
- Go to [supabase.com](https://supabase.com) → Sign up (free)
- Create new project (pick a region)
- Wait ~2 minutes for it to initialize

## Step 3: Set Up Database
1. In Supabase, go to **SQL Editor**
2. Click **New Query** and paste the contents of `database.sql`
3. Click **Run**

## Step 4: Get API Keys
In Supabase → **Settings → API**:
- Copy **Project URL**
- Copy **anon public** key

## Step 5: Create .env.local
Create file `.env.local` in project root:
```
NEXT_PUBLIC_SUPABASE_URL=YOUR_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_KEY
```

## Step 6: Run Locally
```bash
npm run dev
```
Open http://localhost:3000

## Step 7: Import Your Books
1. Go to `/settings`
2. Upload your Notion CSV
3. Done!

## Deploy to Vercel
1. Push to GitHub
2. Connect repo on [vercel.com](https://vercel.com)
3. Add same environment variables
4. Deploy

Your app is now live, synced across all devices, and completely free! 🎉
