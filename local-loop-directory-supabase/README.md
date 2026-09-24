# Local Loop Directory

A responsive React + Vite local-business directory inspired by a community radio directory homepage.

## Included

- Responsive desktop, tablet and mobile layouts
- Search and category filtering
- Sort control and pagination UI
- Featured, local-presence and general business listings
- Live Supabase business data and listing requests
- Private admin login, business editor and request inbox
- Supabase Storage image uploads
- Mobile navigation
- Production-ready Vite build

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Replace the placeholders in `.env.local` with your Supabase Project URL and Publishable key. Open the local URL shown by Vite.

The private admin is at `#/admin`, for example `http://localhost:5173/#/admin`.

## Production build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

Push the project to a GitHub repository using the `main` branch. Add these repository secrets in **Settings → Secrets and variables → Actions**:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

The included GitHub Actions workflow builds and publishes the site automatically. In **Settings → Pages**, set **Source** to **GitHub Actions** if GitHub does not select it automatically.

After deployment, open the website and add `#/admin` to the URL. Sign in using your Supabase admin account. Businesses appear publicly only when their status is **Approved**. Brand colors, typography and responsive rules are in `src/styles.css`.
