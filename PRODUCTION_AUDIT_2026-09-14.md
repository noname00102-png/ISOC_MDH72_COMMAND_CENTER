# ISOC MDH72 — Production Audit 2026-09-14

## Verified data source
- Supabase project: `riuebseoczwwifxezcwj`
- Table: `public.threats`
- Situation-level source of truth: `threat_level`
- Urgency is separate: `urgency_level`

## Canonical situation levels
1. `ปกติ` — green `#22c55e`
2. `เฝ้าระวัง` — yellow `#eab308`
3. `แจ้งเตือน` — orange `#f97316`
4. `วิกฤต` — red `#ef4444`

Legacy labels were normalized in Supabase on 2026-09-14.

## Verified current records
- `แรงงานต่างด้าว` → `ปกติ` / active
- `จับไอช` → `เฝ้าระวัง` / active
- `น้ำท่วม` → `ปกติ` / closed
- `จับยาบ้า 300,000 เม็ด` → `แจ้งเตือน` / closed
- long methamphetamine event → `วิกฤต` / closed
- checkpoint event → `แจ้งเตือน` / closed

Therefore the executive KPI **สถานการณ์ปัจจุบัน** correctly remains `เฝ้าระวัง` while the active `จับไอช` record remains at that level. The individual `แรงงานต่างด้าว` record is `ปกติ`.

## Frontend audit
- Full final build JavaScript syntax errors: `0`
- Inline scripts audited: `103`
- Required Supabase update + post-update verification contracts: PASS
- Realtime contract: PASS
- Admin gate: PASS
- Report status and situation level are separate fields.

## Final downloadable build
SHA256: `6bd0627e62f8530b9c20d63b4284b63db4dcc070938edd0c627e41a76e664923`

## GitHub production runtime commits
- Canonical runtime patch: `a897da7fe2c2bc1170a5ea125d4a2be2be38023d`
- Cache-busting index update: `a031cbfa2c29e975493e77a1724ef4ef657f3165`

## Important
The GitHub production runtime now fetches the current `public.threats` data from Supabase, applies the canonical situation-level contract, and subscribes to Supabase Realtime updates. It does not infer situation level from `urgency_level`.
