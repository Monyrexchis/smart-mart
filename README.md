diff --git a/README.md b/README.md
index ea462d85a43c1d9492609198bb33f7acec6c05b1..a4752262350b96db5db4fe75c027bf48d54b25ad 100644
--- a/README.md
+++ b/README.md
@@ -1 +1,99 @@
-# personal-front-end
\ No newline at end of file
+# personal-front-end
+
+Single-file **Smart Shop** app (`index.html`) with local storage safety and optional cloud sync.
+
+## New flow (3 pages)
+
+- **Page 1: Billing & Calculate**
+  - Add/check by photo
+  - Add/check by name
+  - Live name suggestions while typing (shows similar items + photo)
+  - Bill calculator (discount, tax, paid, change)
+
+- **Page 2: Upload & Manage Products**
+  - Save/upload product (name + price + photo)
+  - Search catalog + pagination
+  - Export/import backup
+  - Protected single-item delete (type `DELETE`)
+  - Protected delete all (must type `DELETE ALL`)
+
+- **Page 3: Cloud Sync (PC + Phone)**
+  - Supabase URL + key + account login
+  - Pull/Push for sharing data between phone and PC
+
+## Data safety improvements
+
+- Uses IndexedDB as main database.
+- Uses fallback local storage mode if IndexedDB is blocked.
+- Keeps local mirror backup for restore support.
+- Delete all is protected by confirmation phrase.
+
+## Run
+
+Open `index.html` directly in browser, or:
+
+```bash
+python3 -m http.server 4173
+```
+
+Then open `http://localhost:4173`.
+
+## Cloud sync setup (Supabase)
+
+This allows same data on PC + phone with one account.
+
+1. Create Supabase project.
+2. In SQL editor, run:
+
+```sql
+create table if not exists public.shop_products (
+  user_id uuid not null,
+  product_id text not null,
+  data jsonb not null,
+  updated_at bigint not null default 0,
+  primary key (user_id, product_id)
+);
+
+alter table public.shop_products enable row level security;
+
+create policy "read own" on public.shop_products
+for select using (auth.uid() = user_id);
+
+create policy "insert own" on public.shop_products
+for insert with check (auth.uid() = user_id);
+
+create policy "update own" on public.shop_products
+for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
+
+create policy "delete own" on public.shop_products
+for delete using (auth.uid() = user_id);
+```
+
+3. In app (Page 3 → Cloud Sync):
+   - paste Supabase URL (**must be your real project URL** like `https://abcxyz.supabase.co`, not `https://xxxx.supabase.co`)
+   - paste anon key
+   - input email + password
+   - click **Sign Up** (first time), then **Login**
+4. Click **Push to Cloud** from PC.
+5. On phone, login with same account and click **Pull from Cloud**.
+
+Note: **Cloud config saved** only means settings were stored locally. You must still login (status should become **Cloud connected**).
+
+After this, edits and deletes are auto-updated to cloud while logged in.
+
+The app now remembers cloud login on this browser/device (auto-login with saved session) until you click Logout.
+
+Cloud page also has a **Remember password on this device** option so password can stay filled after refresh.
+
+### Common setup mistakes (important)
+
+- **Supabase URL field** must be like `https://xxxx.supabase.co` (not a key).
+- **Anon/Publishable Key field** can be legacy JWT style (`eyJ...`) or new publishable style (`sb_publishable_...`).
+- **Email field** must be your real email address (for example `shop@email.com`).
+- Do **not** use `service_role` key in this app.
+
+## Important
+
+- Use same browser + same URL each time.
+- Do not use private/incognito mode.
+- Export backup regularly.
