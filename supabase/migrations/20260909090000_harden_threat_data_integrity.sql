create index if not exists threats_district_idx on public.threats (district);
create index if not exists threats_subdistrict_idx on public.threats (subdistrict);
create index if not exists threats_event_datetime_idx on public.threats (event_datetime desc);
create index if not exists threats_created_by_idx on public.threats (created_by);

create or replace function public.prevent_recent_duplicate_threat()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  duplicate_id uuid;
begin
  if btrim(coalesce(new.title,'')) = '' then raise exception 'THREAT_TITLE_REQUIRED'; end if;
  if btrim(coalesce(new.threat_type,'')) = '' then raise exception 'THREAT_TYPE_REQUIRED'; end if;
  if btrim(coalesce(new.threat_level,'')) = '' then raise exception 'THREAT_LEVEL_REQUIRED'; end if;

  new.title := btrim(new.title);
  new.threat_type := btrim(new.threat_type);
  new.threat_level := btrim(new.threat_level);
  new.district := nullif(btrim(coalesce(new.district,'')),'');
  new.subdistrict := nullif(btrim(coalesce(new.subdistrict,'')),'');
  new.status := nullif(btrim(coalesce(new.status,'')),'');
  new.visibility := nullif(btrim(coalesce(new.visibility,'')),'');

  if tg_op = 'INSERT' then
    select t.id into duplicate_id
    from public.threats t
    where t.id <> coalesce(new.id,'00000000-0000-0000-0000-000000000000'::uuid)
      and t.status = 'active'
      and lower(btrim(t.title)) = lower(new.title)
      and lower(btrim(t.threat_type)) = lower(new.threat_type)
      and t.district is not distinct from new.district
      and t.subdistrict is not distinct from new.subdistrict
      and t.created_at >= coalesce(new.created_at, now()) - interval '5 minutes'
      and t.created_at <= coalesce(new.created_at, now()) + interval '5 minutes'
    order by t.created_at desc
    limit 1;
    if duplicate_id is not null then raise exception 'DUPLICATE_THREAT_WITHIN_5_MINUTES: %', duplicate_id; end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_recent_duplicate_threat on public.threats;
create trigger trg_prevent_recent_duplicate_threat
before insert or update of title, threat_type, threat_level, district, subdistrict, latitude, longitude, status on public.threats
for each row execute function public.prevent_recent_duplicate_threat();
