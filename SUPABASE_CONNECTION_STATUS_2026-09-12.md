# ISOC MDH72 — GitHub + Supabase Connection

Status: VERIFIED

## GitHub
- Repository: `noname00102-png/ISOC_MDH72_COMMAND_CENTER`
- Branch: `main`
- Entry point: `index.html`
- The GitHub Pages entry point now opens the application directly instead of wrapping it in an iframe.

## Supabase
- Project ref: `riuebseoczwwifxezcwj`
- Project URL: `https://riuebseoczwwifxezcwj.supabase.co`
- Client uses the Supabase publishable key in the application.
- Production tables verified: `profiles`, `threats`, `threat_images`, `audit_logs`, `weather_forecast_history`, `weather_forecast_weekly`, `weather_forecast_monthly`, `system_settings`.
- Production Edge Functions verified: `get-mukdahan-weather`, `get-mekong-mukdahan-water`, `admin-user-management`.
- Realtime publication verified for `threats`, `threat_images`, and `weather_forecast_history`.

## Current production data check
- `threats`: 5 rows
- `threat_images`: 14 rows
- `profiles`: 1 row
- `audit_logs`: 92 rows
- `threats` with coordinates: 5/5

## Important
This file records the verified integration state. It does not claim that browser end-to-end testing of every UI control has passed.
