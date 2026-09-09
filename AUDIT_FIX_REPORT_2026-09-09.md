# ISOC MDH72 COMMAND CENTER — Verified Audit 2026-09-09

## Verified Supabase state
- Project: `riuebseoczwwifxezcwj`
- Public tables present: `threats`, `threat_images`, `profiles`, `audit_logs`, `system_settings`
- Row counts at audit time: threats=4 after duplicate cleanup; threat_images=1; profiles=1; audit_logs=21; system_settings=2.
- RLS is enabled on all five public tables.
- `public.threats` and `public.threat_images` are both present in `supabase_realtime` publication.
- Duplicate `threats` row was verified and removed: the later duplicate had id `30ca0646-3cda-417b-8d95-faa99f10092a` and matched the retained incident on title, type, district, subdistrict and description, with creation times about 1 second apart.
- One remaining threat has an empty `threat_level`; this was not silently changed because the correct operational level cannot be established from database evidence alone.

## Verified frontend findings
- Uploaded dashboard file passed Node syntax checks for all inline JavaScript blocks.
- The uploaded dashboard contains multiple historical save/fetch implementations; the final authoritative save function is the active implementation. A duplicate-save guard was added to the final save path.
- The new guard checks title, threat type, district, subdistrict and coordinates against active records created within the previous 5 minutes before INSERT.
- GitHub `index.html` currently launches `ISOC_MDH72_COMMAND_CENTER_V2_REPORT_ADMIN-1.html`, not the uploaded 20260909 audited dashboard. This is a real deployment-alignment issue and should be resolved when the large audited file is committed to the repository.
- `mdh72-data-integrity.js` was updated to reuse the iframe Supabase client when available and to support both V2 and V24 form IDs, avoiding the previous form-ID mismatch.

## Supabase integration notes
- The frontend uses the project publishable key, not a service-role key.
- Image URLs in the legacy `threats.image_*` columns coexist with the newer `threat_images` table; this is a confirmed dual image-storage model. There were 13 storage objects in the bucket at audit time, while only 1 `threat_images` metadata row exists. Orphaned legacy storage objects were not deleted blindly because their intended retention could not be established from database evidence alone.
