# Santa Aurelia website

A static website with a built-in admin editor, backed by Supabase. The public pages
work as-is with built-in default content. Once you connect a free Supabase project,
an admin can edit hero photos, gallery, teachers, and logos in the browser — no code.

## What's in here

```
site/
  index.html          the public website
  admin.html          the editor (also at /admin once deployed)
  js/
    config.js         <- YOU EDIT THIS: your Supabase URL + anon key
    defaults.js       built-in fallback content (site is never blank)
    site-data.js      publishes defaults to the page instantly
    supabase-data.js  loads saved content from Supabase
    admin.js          the editor logic
    dc-runtime.js     the page's rendering engine (do not edit)
    supabase.umd.js   Supabase browser library (vendored)
    Sortable.min.js   drag-and-drop library (vendored)
  img/  fonts/        logos, placeholder, fonts
  vercel.json         makes /admin a clean URL
supabase/
  schema.sql          creates the table, security rules, storage bucket
SETUP-SUPABASE.md     step-by-step: Supabase + GitHub + Vercel
HOW-TO-EDIT.md        plain-language guide for the site admin
```

## How it works

- The page reads its content from one Supabase row (`site.content`, a JSON blob).
- If Supabase isn't configured, the row is empty, or the network fails, the page
  shows the built-in defaults from `defaults.js` — so it's never blank.
- The admin editor writes that one row and uploads images to Supabase Storage
  (free, no credit card).
- The anon key in `config.js` is public by design; Row Level Security protects writes.

## Quick start

1. Follow **SETUP-SUPABASE.md**: create the project, run `schema.sql`, paste your
   URL + anon key into `site/js/config.js`, create the admin user.
2. Preview locally: `cd site` then `python -m http.server 8000`, open
   `http://localhost:8000` (needs internet — the page loads React from a CDN).
3. Deploy: push to GitHub, import to Vercel with **Root Directory = `site`**.

## Editing the deeper content

Photos, captions, teachers, and logos are editable in the admin. The richer written
content (program descriptions, schedules, the 12 Living Values, etc.) lives in
`site/index.html` inside the `class Component` block — edit that text and redeploy
(push to GitHub; Vercel redeploys automatically).
