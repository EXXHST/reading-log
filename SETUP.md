# Reading Log Setup Guide

A beautiful, personal reading tracker with sync across devices. Built with Next.js, Supabase, and Recharts.

## Quick Start

### 1. Clone/Setup Locally

```bash
cd reading-log
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (choose a region close to you)
3. Wait for the project to initialize (~2 minutes)

### 3. Set Up Database

1. In your Supabase project, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `database.sql` from this project
4. Paste it into the query editor and click **Run**

### 4. Get Your API Keys

1. In Supabase, go to **Settings → API**
2. Copy these values:
   - `Project URL` → Copy this
   - `anon public` key → Copy this

### 5. Add Environment Variables

1. Create a `.env.local` file in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Replace the values with what you copied from Supabase.

### 6. Run Locally

```bash
npm run dev
```

Visit http://localhost:3000 in your browser. You should see the Reading Log homepage!

### 7. Import Your Data

1. Visit http://localhost:3000/settings
2. Click "Choose CSV File" and select your Notion CSV export
3. The app will import all your books

### 8. Deploy to Vercel (Free!)

1. Push your code to GitHub (create a new repo and push)
2. Go to [vercel.com](https://vercel.com)
3. Click **New Project** and select your GitHub repo
4. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
5. Click **Deploy**

Your app will be live at a Vercel URL! Share it or access from phone and computer.

## Features

### Dashboard
- Rotating quotation from your library
- Books read this year (with chart)
- Currently reading (editable box)

### Catalogue
- Browse all your books with cards
- Filter by type and status
- Click to view full book details
- Edit titles, authors, ratings, notes, quotations

### Statistics
- Books this year vs last year
- Category breakdown (pie chart)
- Monthly reading pace (line chart)
- Average rating and summary stats

### Import
- CSV import from Notion or other sources
- Expected columns: Name, Author, Completed, Type, Status, Rating

## CSV Format

When exporting from Notion, make sure your CSV has these columns (in any order):

| Name | Author | Completed | Type | Status | Rating | Notes | Quotations |
|------|--------|-----------|------|--------|--------|-------|-----------|
| Book Title | Author Name | MM/DD/YYYY | Genre | Done | 5 | Your notes | Your quotes |

- **Status**: "Not started", "In progress", or "Done"
- **Rating**: 1-5 (optional)
- **Completed**: Date format like "February 1, 2024" or "2/1/2024"

## Customization

### Colors

All colors are in `styles/globals.css` as CSS variables:

```css
--cream: #f9f7f3
--warm-brown: #6b4423
--sage-green: #8b9d83
--warm-white: #fff9f6
--secondary-text: #7a6b60
```

Change these to match your preferred aesthetic.

### Add New Features

The app structure makes it easy to add features:
- New pages go in `app/` folders
- New components in `app/components/`
- Supabase queries in page files

## Troubleshooting

**"Module not found" errors?**
- Run `npm install` again
- Delete `node_modules` and `.next`, then `npm install` and `npm run dev`

**CSV import not working?**
- Make sure your CSV has a "Name" column (the book title)
- Try opening the CSV in a text editor to check for encoding issues
- Check the browser console (F12) for error messages

**Can't connect to Supabase?**
- Make sure `.env.local` has the correct URLs (no trailing slashes)
- Check that Supabase project is still active (not paused)
- Verify the database tables were created (check Supabase → Table Editor)

**Quotations not rotating?**
- You need to add quotations to your books first
- Edit a book and fill in the "Quotations" field
- The dashboard will pick a random quotation each time you refresh

## Database Schema

The app uses three tables:

**books** - Your book collection
- id, title, author, book_type, status, completed_date, rating, notes, quotations

**currently_reading** - Single row tracking what you're reading now
- id, title, author, notes

**featured_quotations** - Optional for quotations to feature on dashboard
- id, quote, book_id

## Privacy

All your data stays in your Supabase project. You own it. No analytics, no tracking, no third-party access.

## Support

Issues? Check that:
1. Supabase database is set up (run database.sql)
2. Environment variables are correct in `.env.local`
3. Node modules are installed (`npm install`)

## Next Steps

1. **Personalize**: Change colors in `styles/globals.css`
2. **Invite**: Share your Supabase anon key and let friends run their own copy
3. **Extend**: Add more statistics, export features, or sharing

Enjoy tracking your reading journey! 📚
