# ISOC MDH72 COMMAND CENTER — Supabase Integration

วันที่ตรวจสอบ: 10 ก.ย. 2569

## Source
ใช้ไฟล์ที่ผู้ใช้อัปโหลด `ISOC_MDH72_COMMAND_CENTER_REPORT_PRINT_REPORT(1).html` เป็นฐานสำหรับตรวจสอบสัญญา frontend/backend ก่อนนำเข้าระบบ GitHub

## GitHub
Repository: `noname00102-png/ISOC_MDH72_COMMAND_CENTER`
Branch: `main`
Dashboard entry: `index.html`
Application currently launched by `index.html`: `ISOC_MDH72_COMMAND_CENTER_V2_REPORT_ADMIN-1.html`

## Supabase
Project ref: `riuebseoczwwifxezcwj`
Project URL: `https://riuebseoczwwifxezcwj.supabase.co`

Verified public schema:
- `profiles`
- `threats`
- `threat_images`
- `audit_logs`
- `system_settings`
- `weather_forecast_history`

Verified Storage bucket:
- `threat-images` (private)
- maximum image size: 5 MB
- allowed MIME types: JPEG, PNG, WebP

## Frontend contract confirmed from uploaded source
- Supabase JS v2 is loaded.
- Supabase client uses project ref `riuebseoczwwifxezcwj`.
- Authentication uses `signInWithPassword`.
- User role is resolved from `profiles`.
- Threat data uses `public.threats`.
- Threat images use Supabase Storage and `public.threat_images`.
- Audit logging is wired to `public.audit_logs` when an authenticated session exists.
- Realtime diagnostic code subscribes to `public.threats`.

## Important schema alignment
The verified database uses `subdistrict` rather than a `tambon` column on `public.threats`. New write paths must send the selected tambon value to `subdistrict` and must not insert an unknown `tambon` column.

## Security status
RLS is enabled on the verified application tables. Authenticated users have role-gated write access to threats/images, while public read access is restricted by the `visibility` value where applicable.

Supabase security advisor currently reports two WARN findings:
1. `public.is_admin()` is SECURITY DEFINER and executable by the authenticated role.
2. Leaked-password protection is disabled in Auth settings.

These are recorded for the next hardening pass and were not changed blindly because they affect authorization behavior.

## Deployment note
The repository is GitHub-connected and the application already references the verified Supabase project. Live browser authentication, Storage upload, and Realtime behavior still require an actual browser session for end-to-end verification; static/source and database-contract checks were performed before integration.
