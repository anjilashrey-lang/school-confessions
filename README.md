# Campus Confessions — beginner starter

A mobile-friendly Next.js + Supabase confession board. New submissions are pending until an allowlisted moderator approves them.

## Important limits

This is a starter, not a guarantee of anonymity or a fully hardened production service. Supabase/hosting providers may process technical logs. This starter does not include robust distributed rate limiting or CAPTCHA; add those before sharing widely. Because this may be used by minors, get appropriate school/guardian permission and publish clear rules. Do not allow posts that identify, threaten, harass, or accuse students.

## 1. Create Supabase project

1. Open https://supabase.com and create a project.
2. Go to SQL Editor, create a new query, paste all of `supabase-setup.sql`, and run it.
3. Go to Project Settings / API (or API Keys). Copy the Project URL and the publishable/anon key. The browser key is meant to be public; RLS policies are the security boundary. Never use a `service_role` or secret key in this app.

## 2. Add a moderator account

1. In Supabase, open Authentication > Users and add/create a user with your moderator email and a strong password. Disable public sign-ups in Authentication settings if you don't need them.
2. Copy that user's UUID from the Users list.
3. In SQL Editor, run this query with the real UUID substituted:

```sql
insert into public.admin_users (user_id)
values ('PASTE-MODERATOR-USER-UUID-HERE');
```

Only add trusted adult moderators. Do not share the moderator password.

## 3. Publish using GitHub + Vercel (phone-friendly route)

1. Extract this ZIP on your phone if needed.
2. Create a private or public repository at https://github.com/new. Add the project files/folders to the repository. If GitHub mobile upload makes folders difficult, use a browser-based editor such as https://stackblitz.com or https://codesandbox.io to import/create a Next.js project and add the files there.
3. On https://vercel.com, choose Add New Project and import the GitHub repository.
4. In Vercel project settings, add these Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase publishable/anon key
5. Deploy. Your site receives a `*.vercel.app` URL.

## 4. Test before sharing

- Submit a test confession from a private/incognito browser.
- Confirm it does not appear on the public page while pending.
- Sign in at `/admin` with the allowlisted moderator account and approve it.
- Confirm it then appears on the homepage.
- Test with a normal non-admin account: it must not see pending posts or update statuses.
- Try `/admin` signed out: no submission data should appear.
- Test rejected posts remain absent from the public page.

## 5. Before launch

- Add a server-side or managed CAPTCHA and distributed rate limiting; in-memory rate limits are not reliable on serverless hosting.
- Consider moderation queue retention/deletion and a way for users to report harmful content.
- Do not log confession contents unnecessarily. Avoid analytics/tracking scripts.
- Review Supabase Auth settings, site URL and redirect URLs for your Vercel domain.
- Add a short privacy notice, posting rules, and contact method for abuse reports.
