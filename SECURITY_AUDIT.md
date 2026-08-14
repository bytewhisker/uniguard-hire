# Security Audit — Uniguard Hire

**Audit date:** 13 Aug 2026
**Scope:** Entire codebase (`src/`, `supabase/`, `public/`, config files) + live Supabase project (URL redacted to project level)
**Method:** Static code review, git history review, dependency audit (`npm audit`), and **read-only** live probes against the Supabase REST API using the anon key that ships in the website bundle. No writes, no destructive actions, no database/data/UI changes were made.

**Verdict:** The application currently has **no server-side security boundary at all**. All authentication, authorization, and data protection is client-side. A live probe confirmed that the full applicant database — including National Insurance numbers, home addresses, DOB, references, next-of-kin and criminal-history declarations — is retrievable by anyone with an internet connection. Treat this as an internal/demo build that must not be used with real applicant data until fixed.

---

## 1. CRITICAL — Full applicant database readable by any anonymous visitor

| | |
|---|---|
| **Severity** | Critical |
| **Status** | **Confirmed** (live proof) |
| **Location** | `supabase/schema.sql:31-34` (policy `public read applications`), exercised by `src/context/RecruitmentContext.tsx:214` |

**Issue:** RLS is enabled but the `SELECT` policy uses `using (true)`. The anon key is embedded in the public website bundle (standard for Supabase), so anyone can run `GET /rest/v1/applications` with no login and download every row, including `form_data` containing: full name, email, DOB, National Insurance number, SIA licence number, driving licence number, home address, phone numbers, 5-year work/education history, referee details (names/addresses/phones), next-of-kin, and criminal-history declarations.

**Evidence (live, read-only probe with only the public anon key):**
```
GET /rest/v1/applications?select=applicant_email,full_name,form_data&limit=3
→ HTTP 200
→ [{"applicant_email":"[REDACTED]@gmail.com","full_name":"John Smith",
    "form_data":{..."niNumber":"QQ 12 34 56 C","siaLicence":"SIA123456",
    "address":"12 High Street, London EC1A 1BB","dob":"1990-05-15",
    "nokName":"Emma Smith","criminalDetails":"", ...}}]
```
The very first request returned real applicant PII. Because the app's `RecruitmentContext` also loads the whole table on mount for **every visitor** (`RecruitmentContext.tsx:211-290`), anonymous visitors silently download and cache this data in `localStorage` too.

**Impact:** Total loss of confidentiality of applicant PII — UK Data Protection Act 2018 / GDPR breach. Enables identity theft (NI numbers + DOB + driving licence), stalking, credential-stuffing of referees, fraud.

**Recommended fix:** Replace the open policies with `auth.uid()`-based policies (Supabase Auth + JWT) or require a service-role/edge-function-only path. Only the inserting user should see their own rows: `using (auth.uid() = ...)` where the row carries the applicant's `auth.uid()`. Never `using (true)` or `with check (true)` for data with personal data.

---

## 2. CRITICAL — Chat messages: anonymous read, and anyone can edit/delete/forge them

| | |
|---|---|
| **Severity** | Critical |
| **Status** | **Confirmed** (read: live proof; write: proven by schema) |
| **Location** | `supabase/schema.sql:106-124` (`public read/update/delete messages`), `src/context/RecruitmentContext.tsx:354-425` |

**Issue:** `messages` has open `SELECT`, `UPDATE`, and `DELETE` policies. Any visitor can read the entire chat history, edit any message (incl. admin messages), and delete any message from every conversation.

**Evidence (live, read-only probe):**
```
GET /rest/v1/messages?select=id,application_id,sender,body&limit=2
→ HTTP 200
→ [{"sender":"admin","body":"hello",...},{"sender":"user","body":"yes",...}]
```
Write access is proven by the schema itself: `delete policy "public delete messages" ... using (true)` (`schema.sql:121-124`) and `update ... using (true)` (`schema.sql:116-119`). Combined with the open `applications` read, an attacker can enumerate `application_id`s and then forge/delete messages in any candidate's thread — including messages impersonating the admin (`sender` is just a client-supplied string, only constrained to the values `'admin'`/`'user'`, both of which any client may use).

**Impact:** Destruction/alteration of the candidate-conversation record (an audit trail for a security vetting firm), phishing of candidates with forged "admin" messages, impersonation of either party.

**Recommended fix:** Authenticate both sides with Supabase Auth and scope all policies to the row owner / to the authenticated admin role. Never allow anonymous/unauthenticated UPDATE or DELETE on conversation data.

---

## 3. CRITICAL — Admin "authentication" is hardcoded `admin / admin` and client-side only

| | |
|---|---|
| **Severity** | Critical |
| **Status** | **Confirmed** |
| **Location** | `src/context/RecruitmentContext.tsx:559-568` (`login`), `src/components/admin/AdminLogin.tsx:14,78` |

**Issue:** Admin login accepts the literal credentials `admin`/`admin`, hardcoded in the client bundle. The "authenticated" state is a `localStorage` boolean (`uniguard_auth_v2`, `RecruitmentContext.tsx:169-171`), trivially set by anyone (e.g. `localStorage.setItem('uniguard_auth_v2','true')` in the console). The credentials themselves are printed on the login screen (`AdminLogin.tsx:78`: `Demo credentials: admin / admin`) and repeated in the error toast (`RecruitmentContext.tsx:566`).

**Evidence (code):**
```ts
// RecruitmentContext.tsx:560
if (username === 'admin' && password === 'admin') { setIsAuthenticated(true); ... }
```
No Supabase Auth, no session, no server check — and since the database itself is wide open (findings 1-2), there is no data layer guarding anything.

**Impact:** Anyone can open the full admin interface (vetting notes, contracts, hiring, chat, candidate personal data, SIA licence numbers) with zero credentials.

**Recommended fix:** Implement real authentication (Supabase Auth with email/password, or at minimum an edge-function-token flow), keep credentials out of the client, and gate the admin UI on a server-verifiable session. Remove the hardcoded check and the "demo credentials" hint from the production login screen.

---

## 4. CRITICAL — Candidate accounts: plaintext passwords in localStorage; identity is client-asserted

| | |
|---|---|
| **Severity** | Critical |
| **Status** | **Confirmed** |
| **Location** | `src/context/RecruitmentContext.tsx:526-550` (`publicLogin` / `publicSignup`), `src/components/public/SignupPage.tsx`, `src/components/public/LoginPage.tsx` |

**Issue:** Registration writes `{ name, email, password }` — the password **in plaintext** — into `localStorage` key `uniguard_public_users_v2`, which contains every account on that browser. Login reads the same localStorage and compares plaintext strings. "Who am I" is also just `localStorage` (`uniguard_public_user_v2`, read at `RecruitmentContext.tsx:173-176`); the dashboard filters applications by email in the browser (`UserDashboard.tsx:357`: `applicants.filter(a => a.email === publicUser?.email)`).

**Impact:** Passwords stored in cleartext on disk; users reusing passwords elsewhere are exposed. Any visitor (or XSS, or shared machine) can list all stored emails/passwords, or simply edit the localStorage email to view and chat as another applicant.

**Recommended fix:** Move accounts to Supabase Auth (server-side `auth.users`, hashed by Supabase). Filter application data server-side with RLS keyed to `auth.uid()`; never trust a client-supplied email.

---

## 5. HIGH — PII mirrored into localStorage on every visitor's machine

| | |
|---|---|
| **Severity** | High |
| **Status** | **Confirmed** |
| **Location** | `src/context/RecruitmentContext.tsx:211-227` (fetch-all on mount), `:188-209` (map incl. NI/SIA), `:501-503` (sync to `uniguard_applicants_v2`) |

**Issue:** On mount the provider fetches **all** applications and merges them into state, then syncs the full applicant list (NI numbers, SIA licence numbers, addresses, phones, vetting notes) to `localStorage` under `uniguard_applicants_v2`. Because the RLS is open (finding 1), this happens for every anonymous visitor, and the data persists indefinitely in the browser — visible to anyone else using that machine, and to any script running on the origin.

**Impact:** PII at rest in browser storage, independent of the network leak; expands the blast radius of any XSS or browser extension compromise.

**Recommended fix:** Never cache full PII datasets in localStorage. Fetch only what the rendered view needs, server-filtered. Remove the mirror-sync effects once RLS is fixed.

---

## 6. HIGH — Public storage bucket `evidence` with anonymous uploads and no validation

| | |
|---|---|
| **Severity** | High |
| **Status** | **Confirmed** |
| **Location** | `supabase/schema.sql:8-10` (bucket `public=true`), `:42-45` (anonymous `INSERT` on `storage.objects`), `src/components/public/MultiStepApplyForm.tsx:150-170` (uploads), `src/lib/compressFile.ts` |

**Issue:** The `evidence` bucket is public and the INSERT policy allows **any anonymous caller** to upload any object. There is no server-side restriction on file type, size, or content: the client compresses images (`compressFile.ts`) but a direct API caller can upload an arbitrary file (e.g. `.html` with script, or malware) that is then served for free from the Supabase storage domain, publicly addressable and uncacheable-listed. Evidence files uploaded by applicants (ID scans, etc.) will also be world-readable by URL. The upload path is keyed off a client-supplied email (`MultiStepApplyForm.tsx:163`: `evidence/${publicUser.email}/...`), so the "owner" is also attacker-chosen.

**Evidence (live, read-only probe):**
```
POST /storage/v1/object/list/evidence (anon)
→ HTTP 200 → []   (bucket accessible for listing; currently no files)
```
Storage anti-malware scanning and size caps are not configured (no policy/constraint in `schema.sql`).

**Impact:** Malware/abuse hosting, phishing (files served from a `.supabase.co` host), storage exhaustion, and public disclosure of applicant ID/evidence documents.

**Recommended fix:** Make the bucket private; serve evidence through an authenticated, RLS-gated API. Enforce file type/size limits and virus scanning (storage scan settings); restrict INSERT to authenticated users only (or better, to a signed-URL / edge-function flow); disallow arbitrary paths (paths must be bound to the uploader's own account).

---

## 7. HIGH — Any visitor can write: insert/update/delete on all tables with the anon key

| | |
|---|---|
| **Severity** | High |
| **Status** | **Confirmed** |
| **Location** | `supabase/schema.sql:26-29` (insert applications `with check (true)`), `:36-39` (update), `:70-83` (interviews), `:106-124` (messages) |

**Issue:** Beyond reading, the schema grants anonymous `INSERT` on `applications`, `interviews`, and `messages`, plus `UPDATE` on `applications`/`interviews`/`messages` and `DELETE` on `messages`. The admin UI itself syncs stage changes with `.update()` using the anon key (`RecruitmentContext.tsx:487-494`), so "admin-only" writes are equally available to the public. There is no rate limiting or anti-spam; anyone can flood the tables or mutate any row (e.g. set their own status to `hired`, change another applicant's status, complete interviews).

**Impact:** Data integrity destruction, spam/DoS via unbounded inserts, fraud (self-hiring, showing forged vetting results to referees), poisoned data in the admin pipeline.

**Recommended fix:** Tighten all four surfaces: anonymous INSERT only where truly needed (and then rate-limited), authenticated owner-scoped UPDATE/DELETE, "admin" writes gated behind a server-verified role.

---

## 8. HIGH — Realtime broadcast of all applications, messages, interviews to every visitor

| | |
|---|---|
| **Severity** | High |
| **Status** | **Confirmed** |
| **Location** | `supabase/schema.sql:47-53, 85-90, 126-131` (tables added to `supabase_realtime` publication), `src/context/RecruitmentContext.tsx:229-289` (subscriptions with anon key) |

**Issue:** The three tables are in the `supabase_realtime` publication and the client subscribes to `INSERT`/`UPDATE`/`DELETE` events using the anon key on every page load. Combined with the open policies this means a live, anonymous stream of every new application (incl. full `form_data`) and every chat message — without even polling.

**Impact:** Real-time exfiltration of PII; attacker gets every new application the instant it is submitted, including evidence URLs.

**Recommended fix:** Remove the tables from the `supabase_realtime` publication, or restrict publications to authenticated users / enable RLS-driven authorization for realtime (Supabase supports `realtime.messages` RLS via the `realtime_authorization` role).

---

## 9. MEDIUM — Error messages leak internals to end users

| | |
|---|---|
| **Severity** | Medium |
| **Status** | **Confirmed** |
| **Location** | `src/components/public/MultiStepApplyForm.tsx:179-183` (raw Supabase error text shown to applicant), `src/context/RecruitmentContext.tsx:380` (toast: "run supabase/schema.sql in Supabase SQL editor (sections 6-7), then resend"), `:379,399,408,422` (`console.error(error.message)` with DB messages) |

**Issue:** Supabase error strings (`Could not save application: <raw message>`, `Evidence upload failed: <raw message>`) are rendered to the public page; the chat widget instructs end users to run `supabase/schema.sql` sections in the SQL editor. These disclose backend details (table names, failure modes, schema expectations) that help an attacker craft better abuse.

**Impact:** Low-severity info disclosure / reconnaissance aid; user-facing noise.

**Recommended fix:** Map errors to generic UI messages; log details server-side only; remove schema instructions from client toasts.

---

## 10. MEDIUM — No security headers / CSP configured

| | |
|---|---|
| **Severity** | Medium |
| **Status** | **Confirmed** (absent — Potential for impact) |
| **Location** | `index.html`, `vercel.json` (no headers section) |

**Issue:** The SPA sets no Content-Security-Policy, `X-Frame-Options`/`frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy`, or HSTS (Vercel only defaults some of these). External Google Fonts are loaded without a CSP. The site is framable (clickjacking of the login forms) and there is no script-src restriction if a script injection ever occurs.

**Impact:** Clickjacking of login/admin screens; weaker defense-in-depth against XSS; referrer leakage of the admin host/URL.

**Recommended fix:** Add a `headers` block in `vercel.json` (CSP with `default-src 'self'` + fonts.googleapis.com/fonts.gstatic.com, `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, HSTS on prod domain).

---

## 11. MEDIUM — Spoofable "read receipts" and message state

| | |
|---|---|
| **Severity** | Medium |
| **Status** | **Confirmed** |
| **Location** | `src/context/RecruitmentContext.tsx:413-425` (`markConversationRead` → `.update({ read_by_admin / read_by_user })`), `src/components/common/LiveChatWidget.tsx:46-48` |

**Issue:** Because messages are updatable by anyone (finding 2), read flags can be forged in either direction; a candidate can mark admin messages as read (or unread) and an attacker can mark anything read to hide from the admin's unread badge.

**Impact:** Integrity of the "unread" workflow and admin awareness destroyed; part of the same root cause as finding 2.

**Recommended fix:** Same as finding 2 — owner-scoped policies; read-receipt updates only permitted for the receiving party.

---

## 12. LOW — Raw DB error strings in `console.error` and dev-style conveniences shipped to prod

| | |
|---|---|
| **Severity** | Low |
| **Status** | **Confirmed** |
| **Location** | `src/context/RecruitmentContext.tsx:379,399,408,422`; `MultiStepApplyForm.tsx:107-127` ("Auto Fill" demo-data button on the live public form); `LoginPage.tsx:96-103` (hardcoded demo login button) |

**Issue:** (a) Browser console shows DB error details (minor recon aid, though console is client-only). (b) The public application form has an "Auto Fill" button that injects a complete fake applicant (fake NI number, licence, references) — anyone can mass-submit fabricated applications to the live DB (only partially mitigated by the ≥5-year coverage check). (c) A "Demo Login" button pre-fills `demo@uniguard.co.uk` / `demo123` on the candidate login page.

**Impact:** Fake/spam data in the real database, confusing the recruitment pipeline; negligible risk for the demo login itself since real auth doesn't exist yet.

**Recommended fix:** Remove/flag demo conveniences in the production build; validate and rate-limit submissions (then fix RLS anyway, which eliminates the flood).

---

## 13. INFO / OK — items checked and found clean

| | |
|---|---|
| **Status** | Checked — no issue |
| **Evidence** | below |

- **`.env` leaking:** `.env` contains only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. It is **gitignored** (`.gitignore:14-16`) and was **never committed** (`git log --all` clean; `git ls-files` shows no `.env`). The anon key is public-by-design (Supabase) — its presence in the bundle is not itself a secret, but it becomes dangerous only because of the open RLS (findings 1-8). No `service_role`, Stripe, or other secrets exist anywhere in the repo.
- **Dependency vulnerabilities:** `npm audit` → `0 vulnerabilities` across all dependencies (`@supabase/supabase-js` 2.x, React 19, Vite 8, lucide-react, canvas-confetti, tailwind 4 — none known-vulnerable).
- **Stored/reflected XSS:** React escapes all interpolated values; no `dangerouslySetInnerHTML`, `eval`, `innerHTML`, or `document.write` anywhere in `src/`. Chat bodies and form fields are rendered as text. The main XSS risk is therefore *not present today*, but the open write access (findings 2, 7) means malicious content *could* be planted in admin views — it just cannot execute as HTML with the current rendering.
- **Git hygiene:** only 2 commits; no secrets, no `dist/`, no build artifacts, no generated env files in history.
- **`vercel.json`:** catch-all SPA rewrite only; no misconfigured route exposing files.
- **Transport:** all Supabase/Google calls use HTTPS; form fields travel over TLS.
- **Sensitive data in the repository besides the DB:** none — `mockData.ts` is empty (all demo data is UI-level constants).
- **Admin/debug/test routes:** no test/debug endpoints exist server-side; the only "exposed" route is the admin UI itself, which is protected by nothing (finding 3).

---

## Top Priority Fixes

1. **Fix RLS now (blocks findings 1, 2, 5, 6, 7, 8).** Replace every `using (true)` / `with check (true)` policy on `applications`, `interviews`, `messages` and `storage.objects` with authenticated, owner-scoped policies (`auth.uid()`), remove the tables from the realtime publication (or enable realtime RLS), and make the `evidence` bucket private with scan + size/type limits. This is the single change that closes the live PII leak confirmed today.
2. **Replace the hardcoded `admin/admin` login** with Supabase Auth + a server-side role check (finding 3).
3. **Replace localStorage accounts/passwords with Supabase Auth** and stop asserting identity from localStorage email (findings 4 and 5); stop mirroring full PII datasets to localStorage.
4. **Gate all writes by real identity** — no anonymous INSERT/UPDATE/DELETE anywhere; add rate limiting on public submissions (findings 6, 7, 11).
5. **Harden the edges:** map Supabase errors to generic messages (finding 9), add CSP/security headers via `vercel.json` (finding 10), remove Auto Fill/demo buttons from the production form (finding 12).

**Bottom line:** Do not deploy this with real applicant data, and if existing live data includes real candidates (`supabase/` DB already contains at least one real applicant record), treat it as publicly disclosed and notify / rotate accordingly (UK DPA 2018 breach reporting obligations apply).