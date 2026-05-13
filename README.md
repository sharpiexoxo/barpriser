# BarPriser 🍺
**Community drink price research for Aarhus, Denmark**

A Next.js 14 app where anyone can log and browse drink prices across Aarhus bars.

---

## Tech stack

| Layer     | Choice |
|-----------|--------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling   | Tailwind CSS |
| Database  | Turso (cloud SQLite) via `@libsql/client` |
| Photos    | Cloudinary (free tier, optional) |
| Hosting   | Vercel |

---

## Run locally (no account needed)

```bash
npm install
npm run dev
# → http://localhost:3000
```

Without any env vars set, the app uses a local `barpriser.db` file automatically.

Optionally seed with sample data:
```bash
node scripts/seed.js
```

---

## Deploy to Vercel + Turso (step by step)

### Step 1 — Set up Turso (free)

1. Go to [turso.tech](https://turso.tech) and sign up
2. Install the Turso CLI:
   ```bash
   brew install tursodatabase/tap/turso   # macOS
   # or: curl -sSfL https://get.tur.so/install.sh | bash
   ```
3. Log in and create your database:
   ```bash
   turso auth login
   turso db create barpriser
   ```
4. Get your credentials:
   ```bash
   turso db show barpriser --url     # → copy this URL
   turso db tokens create barpriser  # → copy this token
   ```
5. (Optional) Seed the remote database:
   ```bash
   cp .env.local.example .env.local
   # Fill in TURSO_DATABASE_URL and TURSO_AUTH_TOKEN
   node scripts/seed.js
   ```

### Step 2 — Set up Cloudinary for photos (free, optional)

If you skip this, the app works fine — photos just won't be saved.

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. From the Dashboard, copy your **Cloud name**
3. Go to **Settings → Upload → Upload presets → Add upload preset**
   - Set signing mode to **Unsigned**
   - Copy the preset name

### Step 3 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/barpriser.git
git push -u origin main
```

### Step 4 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Under **Environment Variables**, add:

   | Name | Value |
   |------|-------|
   | `TURSO_DATABASE_URL` | `libsql://your-db.turso.io` |
   | `TURSO_AUTH_TOKEN` | your token |
   | `CLOUDINARY_CLOUD_NAME` | your cloud name *(optional)* |
   | `CLOUDINARY_UPLOAD_PRESET` | your preset name *(optional)* |

4. Click **Deploy** — done ✓

Every `git push` to `main` auto-deploys to Vercel.

---

## Project structure

```
barpriser-next/
├── app/
│   ├── layout.tsx              ← Root layout (fonts, sidebar, mobile nav)
│   ├── globals.css             ← Tailwind base + shared component classes
│   ├── page.tsx                ← Redirects / → /add
│   ├── add/page.tsx            ← Step-by-step entry form
│   ├── entries/page.tsx        ← Filterable feed with photo lightbox
│   ├── overview/page.tsx       ← Stats, bar chart, venue breakdown
│   └── api/
│       ├── venues/route.ts     ← GET, POST
│       ├── entries/route.ts    ← GET, POST
│       ├── entries/[id]/route.ts ← DELETE
│       └── stats/route.ts      ← GET (aggregated stats)
├── components/
│   ├── Sidebar.tsx             ← Desktop sidebar
│   ├── MobileNav.tsx           ← Mobile bottom tab bar
│   └── Toast.tsx               ← Notification toasts
├── lib/
│   └── db.ts                   ← Turso client + TypeScript types
├── scripts/
│   └── seed.js                 ← Seed with sample Aarhus data
├── .env.local.example          ← Copy to .env.local and fill in
└── public/uploads/             ← (unused on Vercel — photos go to Cloudinary)
```
