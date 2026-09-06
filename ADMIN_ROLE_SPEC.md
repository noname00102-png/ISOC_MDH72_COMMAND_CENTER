# ISOC MDH72 — Admin Role Specification

## Roles
- admin: full management of events, users, roles, reports, and system settings
- commander: view operational data and reports
- officer: create and update operational events
- viewer: read-only access

## Admin capabilities
- Login with Supabase Auth
- Verify role from `profiles`
- Create, edit, delete `threats`
- View latitude/longitude
- Realtime updates from `threats`
- Print reports
- Refresh dashboard data

## Security rule
The UI role check is not a security boundary. Supabase Row Level Security (RLS) policies must enforce the same permissions server-side.