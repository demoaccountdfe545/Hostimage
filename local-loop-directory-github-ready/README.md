# Local Loop Directory

A responsive React + Vite local-business directory inspired by a community radio directory homepage.

## Included

- Responsive desktop, tablet and mobile layouts
- Search and category filtering
- Sort control and pagination UI
- Featured, local-presence and general business listings
- Functional profile and listing-request modals
- Mobile navigation
- Production-ready Vite build

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Production build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

Push the project to a GitHub repository using the `main` branch. The included GitHub Actions workflow builds and publishes the site automatically. In the repository's **Settings → Pages**, set **Source** to **GitHub Actions** if GitHub does not select it automatically.

Business data and image URLs can be changed near the top of `src/main.jsx`. Brand colors, typography and responsive rules are in `src/styles.css`.
