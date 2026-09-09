# ISOC MDH72 COMMAND CENTER — Supabase Data Audit

Audit date: 2026-09-09
Project: `riuebseoczwwifxezcwj`

## Verified findings

- `public.threats`: 5 records.
- `public.threat_images`: 1 record.
- `public.profiles`: 1 record.
- `public.audit_logs`: 21 records.
- No orphan `threat_images` records were found.
- All 5 `threats` rows currently have `event_datetime IS NULL`. This was not auto-filled because the actual incident time cannot be inferred safely from `created_at`.
- Two `threats` records are exact duplicate candidates: same title, threat type, district, subdistrict and coordinates, created about 1 second apart. Both have audit records. They were intentionally NOT deleted because the database evidence alone cannot prove whether they represent an accidental double submission or two reports of the same real incident.
- Both duplicate candidates currently have a blank `threat_level`. This was not assigned automatically because the correct operational level cannot be inferred safely.

## Database hardening applied

Migration `harden_threat_data_integrity_and_query_indexes` was applied to production.

Added indexes:
- `threats_district_idx`
- `threats_subdistrict_idx`
- `threats_event_datetime_idx`
- `threats_created_by_idx`

Added trigger `trg_prevent_recent_duplicate_threat` using `prevent_recent_duplicate_threat()`.

The trigger:
- rejects blank `title`, `threat_type`, or `threat_level`;
- trims text fields;
- normalizes empty nullable location/status fields to NULL;
- blocks a new active threat when the same title + threat type + district + subdistrict was already created within 5 minutes.

The duplicate guard was tested against the known duplicate pair and correctly rejected the test insert. The test transaction left no new row.

## Security / RLS verification

RLS policies were inspected for `threats`, `threat_images`, `profiles`, `audit_logs`, and `system_settings`. Existing role policies were not replaced because they are active and changing them without a demonstrated authorization defect would be unsafe.

## GitHub application-layer fix

`mdh72-data-integrity.js` was updated so the duplicate check now synchronously intercepts the Save click, performs the asynchronous check, and only replays the click after the check passes. This fixes the previous race where an asynchronous capture handler could finish after the original save handler had already executed.

The database trigger remains the authoritative protection against concurrent or multi-device duplicate inserts.
