# Setup — Supabase + GitHub + Vercel

Do Supabase first (the site needs its keys), then GitHub, then Vercel.

## Part 1 — Supabase

**1.1 Create the project**
1. supabase.com -> sign in -> **New project**. Name `santa-aurelia`, set a database
   password (save it), region **Southeast Asia (Singapore)**. Create, wait ~2 min.

**1.2 Create the table + storage (one step)**
1. Left sidebar -> **SQL Editor -> New query**.
2. Paste all of `supabase/schema.sql`, click **Run**. This makes the `site` table,
   the security rules, and the `site-media` storage bucket.
   (No seed step — the admin fills content on first Save from the built-in defaults.)

**1.3 Copy your keys into the site**
1. **Project Settings -> API**. Copy the **Project URL** and the **anon / public** key.
2. Open `site/js/config.js`, paste them into `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Save.
   - The anon key is safe to be public. Never paste the `service_role` key.

**1.4 Create your admin login**
1. **Authentication -> Users -> Add user -> Create new user**.
2. Email `wbudiman1995@gmail.com`, password `admin`, tick **Auto Confirm User**. Create.
   - On first sign-in the editor forces you to set a real password.

## Part 2 — GitHub

**GitHub Desktop:** install, sign in, **File -> Add local repository**, pick this
folder (create a repository if asked), commit "initial site", **Publish repository**,
set **Private**.

**Command line:**
```
cd path/to/project
git init && git add . && git commit -m "initial site"
git remote add origin https://github.com/<you>/santa-aurelia.git
git branch -M main && git push -u origin main
```
No secret file to worry about — `config.js` holds only the public anon key.

## Part 3 — Vercel

1. vercel.com -> **Log in -> Continue with GitHub** -> authorize.
2. **Add New -> Project** -> import your repo.
3. **Framework Preset: Other** (plain static site, no build step, no env vars).
4. **Root Directory:** click Edit -> set to **`site`**. (The step people miss.)
5. **Deploy.** Site at `something.vercel.app`; editor at `something.vercel.app/admin`.
6. Supabase -> **Authentication -> URL Configuration** -> set **Site URL** to your
   Vercel URL and add it under **Redirect URLs**. Save. (Makes login work live.)

## Part 4 — First login

1. `your-site.vercel.app/admin` -> sign in `wbudiman1995@gmail.com` / `admin`.
2. Set a new password when prompted.
3. Change a caption and a photo, **Save all changes**, open the site in a new tab.

## If something breaks
- **404 / file list on Vercel:** Root Directory isn't set to `site`.
- **Editing/login does nothing:** `config.js` still has PASTE_ placeholders.
- **Login works locally but not live:** Site URL / Redirect URLs not set (Part 3.6).
- **"row level security" / permission error on save:** schema.sql wasn't run, or you're not logged in.
- **Images upload but don't show:** the `site-media` bucket isn't public (re-run schema.sql).
