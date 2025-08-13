lovable-uploads folder

- Public static assets are served from /lovable-uploads/*
- index.html lists common files and is configured with Cache-Control: no-store via vercel.json to avoid stale caches during verification
- Add or replace files here; then Publish to deploy
- Verify by opening /lovable-uploads/index.html or visiting the direct file URL
- If you see cached content, append a query param like ?v=2 to force a fresh fetch
