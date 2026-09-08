(()=>{'use strict';
const ROLE={admin:'admin',administrator:'admin','ผู้ดูแลระบบ':'admin',officer:'officer','เจ้าหน้าที่':'officer','เจ้าหน้าที่ปฏิบัติการ':'officer',commander:'commander',viewer:'viewer'};
function role(r){return ROLE[String(r??'').trim().toLowerCase()]||'viewer'}
async function run(){
 const sb=window.supabase&&window.supabase.createClient?window.supabase.createClient('https://riuebseoczwwifxezcwj.supabase.co','sb_publishable_G6QyDB6Ux0Rd9yzbuQCCoQ_mkyu7wuO'):null;
 if(!sb){console.error('[MDH72] Supabase client unavailable');return}
 window.MDH72_RUNTIME=window.MDH72_RUNTIME||{};window.MDH72_RUNTIME.supabase=sb;
 const {data,error}=await sb.auth.getUser();
 if(error){console.error('[MDH72 AUTH]',error);return}
 window.MDH72_RUNTIME.user=data.user||null;
 if(data.user){const p=await sb.from('profiles').select('id,name,role,department,position').eq('id',data.user.id).maybeSingle();window.MDH72_RUNTIME.profile=p.data||null;window.MDH72_RUNTIME.role=role(p.data?.role)}else window.MDH72_RUNTIME.role='viewer';
 const channel=sb.channel('mdh72-runtime-realtime').on('postgres_changes',{event:'*',schema:'public',table:'threats'},payload=>window.dispatchEvent(new CustomEvent('mdh72:threat-change',{detail:payload}))).on('postgres_changes',{event:'*',schema:'public',table:'threat_images'},payload=>window.dispatchEvent(new CustomEvent('mdh72:image-change',{detail:payload}))).subscribe(status=>{window.MDH72_RUNTIME.realtime=status;window.dispatchEvent(new CustomEvent('mdh72:realtime',{detail:status}))});
 window.MDH72_RUNTIME.channel=channel;
 sb.auth.onAuthStateChange((_event,session)=>{window.MDH72_RUNTIME.user=session?.user||null;window.dispatchEvent(new CustomEvent('mdh72:auth',{detail:{event:_event,session}}))});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();