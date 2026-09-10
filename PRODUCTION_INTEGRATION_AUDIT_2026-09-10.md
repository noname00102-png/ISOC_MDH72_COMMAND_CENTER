# ISOC MDH72 COMMAND CENTER — Production Integration Audit

Date: 2026-09-10

## Integration result

The uploaded `ISOC_MDH72_COMMAND_CENTER_REPORT_PRINT_REPORT(1).html` was inspected as the source baseline and reconciled against the V2 application currently launched by `index.html`.

Because the repository V2 is the deployed application entry, the production integration was implemented as a dedicated application-layer integration module rather than replacing the live V2 file with an unverified monolithic source copy.

Added:
- `mdh72-production-integration.js`
- loaded by `index.html`
- cache version bumped to `20260910-7`

## HTML / JavaScript

- Production integration module passes Node syntax validation.
- Verified database field mapping uses `subdistrict` rather than the non-existent `tambon` column.
- Verified threat description maps to `description`.
- Writer validates required title, threat type, threat level, district and subdistrict.
- Coordinates are range-validated before insert.
- Error and unhandled-rejection logging is installed.

## Supabase

Verified project ref: `riuebseoczwwifxezcwj`.

Verified application tables:
- `profiles`
- `threats`
- `threat_images`
- `audit_logs`
- `system_settings`
- `weather_forecast_history`

## RLS

RLS remains enabled on the verified application tables. Existing role policies were inspected and retained; no authorization policy was replaced blindly.

Current policy model includes:
- public read of public threats
- authenticated read of threats
- officer/admin insert/update
- admin delete
- role-restricted profiles and audit access
- role-restricted image metadata and Storage object operations

## Storage

Bucket `threat-images` is private.
- Maximum file size: 5 MB
- Allowed MIME: JPEG, PNG, WebP
- Image path convention: `threats/<threat-id>/<order>_<uuid>.<ext>`
- Failed image writes attempt cleanup of uploaded objects.

## Realtime

The integration layer does not create a second Realtime channel. It observes the existing V2 Realtime status to avoid duplicate subscriptions and refresh storms.

## Data integrity

The existing database duplicate guard remains authoritative. Existing production audit records and data were not deleted or rewritten.

## Security advisor

Two existing warnings remain documented:
1. `public.is_admin()` is SECURITY DEFINER and executable by authenticated users.
2. Leaked-password protection is disabled.

These were not changed automatically because changing authorization/security settings without an end-to-end account test can break access control.

## Current production gate

Source, schema, RLS, Storage and application-layer checks are verified. A fully certified browser E2E result still requires an actual deployed-host browser session with a real test account, including login/logout, image upload, Realtime event propagation and mobile interaction testing. This report does not claim those browser-only tests were completed.
