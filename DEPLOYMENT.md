# AgroMart Deployment Guide

## Vercel Deployment

### Prerequisites
1. GitHub account with the code pushed (✅ Already done)
2. Vercel account (free at https://vercel.com)
3. Supabase project running
4. Lovable API key for chatbot

### Step 1: Connect to Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"**
4. Search for and select: `agro-connectv2` (Sindhuja-Raja/agro-connectv2)
5. Click **"Import"**

### Step 2: Configure Environment Variables

In Vercel Project Settings → **Environment Variables**, add:

```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY = your-publishable-key
VITE_SUPABASE_PROJECT_ID = your-project-id
LOVABLE_API_KEY = your-lovable-api-key
```

**To find Supabase credentials:**
1. Go to https://app.supabase.com
2. Select your project
3. Settings → API → Copy Project URL & Anon Key

**To get Lovable API key:**
1. Go to https://lovable.dev
2. Navigate to API settings
3. Copy your API key

### Step 3: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-3 minutes)
3. View deployed site at `https://your-project-name.vercel.app`

### Step 4: Update Supabase CORS

In Supabase Dashboard → Project Settings → API:
1. Add your Vercel domain to **Allowed URLs**:
   - `https://your-project-name.vercel.app`
   - `https://your-project-name-*.vercel.app` (for preview deployments)

### Step 5: Configure Supabase Edge Functions (Optional)

If using the chat function:
1. Deploy Supabase functions: `supabase functions deploy chat`
2. Or deploy via Supabase Dashboard → Edge Functions

### Automatic Deployments

After initial setup:
- Push to `master` branch → Vercel auto-deploys
- Create PR → Vercel creates preview deployment
- View preview before merging

### Troubleshooting

**Build fails with "supabaseUrl is required"**
- Verify environment variables are set in Vercel
- Check variable names match exactly (case-sensitive)

**Chat feature not working**
- Ensure `LOVABLE_API_KEY` is set
- Check Supabase functions are deployed
- Verify CORS settings in Supabase

**CORS errors**
- Add Vercel domain to Supabase allowed URLs
- Clear browser cache

### Performance Monitoring

Monitor your deployment:
1. Vercel Dashboard → Analytics
2. Check Core Web Vitals
3. View server response times

### Rollback

If deployment breaks:
1. Vercel Dashboard → Deployments
2. Click deployment timestamp
3. Click three dots → **"Promote to Production"**

---

## Local Testing Before Deploy

```bash
npm run build
npm run preview
```

Visit `http://localhost:4173` to test production build locally.
