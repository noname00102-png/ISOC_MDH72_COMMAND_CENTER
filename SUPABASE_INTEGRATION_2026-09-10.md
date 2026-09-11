# ISOC MDH72 COMMAND CENTER — Supabase Integration

วันที่ตรวจสอบ/ปรับปรุง: 11 ก.ย. 2569

## Source
ใช้ไฟล์ `ISOC_MDH72_COMMAND_CENTER_FINAL_CLEANED_REVIEWED_2026-09-11_REALTIME_TESTED.html` เป็นฐานตรวจสอบ frontend/backend contract ก่อนเชื่อมต่อ production

## GitHub
Repository: `noname00102-png/ISOC_MDH72_COMMAND_CENTER`
Branch: `main`
Dashboard entry: `index.html`

## Supabase
Project ref: `riuebseoczwwifxezcwj`
Project URL: `https://riuebseoczwwifxezcwj.supabase.co`
Region: `ap-northeast-1`
Status: `ACTIVE_HEALTHY`

Verified application tables:
- `profiles`
- `threats`
- `threat_images`
- `audit_logs`
- `weather_forecast_history`

Verified Storage bucket contract from the repository integration audit:
- `threat-images` (private)
- maximum image size: 5 MB
- allowed MIME types: JPEG, PNG, WebP

## Frontend contract
- Supabase JS v2 is loaded.
- Supabase client points to the verified project.
- Client uses a publishable key, not a service-role/secret key.
- Authentication uses `signInWithPassword`.
- User role is resolved from `profiles`.
- Threat data uses `public.threats`.
- Threat images use Supabase Storage and `public.threat_images`.
- Audit logging writes to `public.audit_logs` when an authenticated session exists.
- Realtime diagnostics subscribe to `public.threats`.

## Schema alignment
`public.threats` uses `subdistrict`; there is no verified `tambon` column. New write paths must send the selected tambon value to `subdistrict`.

## Production RLS hardening — 11 Sep 2026
Applied migration:
- `SUPABASE_RLS_HARDENING_2026-09-11.sql`

The migration:
- limits anonymous threat reads to `visibility='public'`;
- permits authenticated operational reads;
- restricts threat creation to admin/officer roles and binds `created_by` to `auth.uid()`;
- restricts officer updates to their own threats while allowing admins to edit all threats;
- restricts threat deletion to admins;
- protects threat image metadata by creator/admin ownership;
- limits audit-log reads to admins and audit inserts to the acting user;
- keeps weather history browser-readable;
- removes legacy broader policies so the new role model is authoritative;
- uses a private `current_profile_role()` helper to avoid recursive profile RLS checks.

Verification after migration:
- production migration completed successfully;
- verified application tables remain populated;
- production database contains 30 RLS policies across the five verified application tables;
- current `profiles` data includes the configured admin profile.

## Remaining end-to-end verification
A real browser session is still required to validate the complete client path: login, profile resolution, threat insert/update/delete, private Storage upload + signed URL, and Realtime event delivery. Static/source checks and direct production database checks are not a substitute for that browser test.

## Security note
Do not place a Supabase secret/service-role key in this repository or any browser-delivered HTML. Client code should use the publishable key and rely on RLS for authorization.
