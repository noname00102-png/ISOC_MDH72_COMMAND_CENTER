# ISOC MDH72 COMMAND CENTER — Production Audit
Date: 2026-09-10

## Scope actually verified
- GitHub repository and main branch files
- `index.html`
- `ISOC_MDH72_COMMAND_CENTER_V2_REPORT_ADMIN-1.html`
- `mdh72-runtime-hardening.js`
- `mdh72-command-center-enhancement.js`
- `mdh72-map-menu.js`
- Supabase schema, tables, columns, foreign keys, RLS policies, functions, triggers, views, storage bucket, security/performance advisors

## Findings
1. The deployed entrypoint is a launcher/iframe architecture. `index.html` loads the V2 report/admin HTML and injects runtime/enhancement scripts.
2. The primary application uses real Supabase data from `public.threats`; no mock-data path was found in the verified core files.
3. Supabase `public.threats` has RLS and separates anonymous public reads from authenticated reads/writes. Officer/admin write policies are present; admin delete is separate.
4. `threat_images` uses a private storage bucket with a 5 MB image limit and JPEG/PNG/WebP restrictions. Image metadata has RLS and storage policies.
5. Realtime was configured in the runtime hardening layer and independently in the primary V2 page. This can cause duplicate subscriptions/refresh work.
6. Security advisor reports two WARN findings: authenticated execution of `public.is_admin()` (SECURITY DEFINER) and disabled leaked-password protection.
7. Performance advisor reports 12 unused-index INFO findings. These are not treated as defects and were not removed because workload evidence is insufficient.
8. The exact external TMD API path previously tested has a real upstream TLS certificate failure (`Unknown issuer`) in the Edge proxy path; this is an external-source issue, not a UI issue.
9. Browser-level production E2E, deployed-host Network/Console capture, and mobile physical-device testing are not accessible from the current tool environment and therefore are not claimed as completed.

## Changes applied
- Added `mdh72-production-hardening.js`.
- Added runtime health indicator for Supabase connectivity and Realtime state.
- Added debounced refresh scheduling for runtime threat/image events to reduce refresh storms.
- Added global uncaught-error/unhandled-rejection logging.
- Added mobile-safe overflow hardening.
- Added explicit map-menu event bridging from the Sidebar.
- Updated `index.html` to load the hardening layer and bumped cache-busting versions to `20260910-3`.
- No database schema changes were made because the existing schema already supports the verified dashboard functions.

## Verification performed
- New hardening JavaScript passed `node --check` locally before commit.
- GitHub files were re-fetched after the write and the new entrypoint/script references were verified.
- Supabase schema/RLS/functions/triggers/views/storage/advisors were queried directly after the code change.

## Production gate
**Not certified as fully Production-ready yet.**
The code and database layers have been materially audited and hardened, but browser E2E against the actual deployed hosting URL, login/logout with a real account, visual responsive testing, map tile/network testing, and external API live tests cannot be truthfully marked complete from this environment.
