(function(){
  'use strict';
  const EXPECTED='riuebseoczwwifxezcwj';
  function projectRef(url){const m=String(url||'').match(/^https?:\/\/([^.]+)\.supabase\.co/i);return m?m[1]:'';}
  window.mdh72SupabaseConnection={status:'checking',project:EXPECTED,auth:false,threats:false,realtime:false,checkedAt:null,error:null};
  async function check(){
    const out=window.mdh72SupabaseConnection;
    try{
      const client=window.sb || (window.supabase&&window.supabase.createClient ? window.supabase.createClient('https://'+EXPECTED+'.supabase.co', 'sb_publishable_G6QyDB6Ux0Rd9yzbuQCCoQ_mkyu7wuO') : null);
      if(!client) throw new Error('Supabase client ไม่พร้อม');
      window.sb=client;
      const session=await client.auth.getSession();
      out.auth=!!session?.data?.session?.user?.id;
      const t=await client.from('threats').select('id').limit(1);
      if(t.error) throw t.error;
      out.threats=true;
      out.project=projectRef('https://'+EXPECTED+'.supabase.co')||EXPECTED;
      out.status='connected';out.error=null;out.checkedAt=new Date().toISOString();
      if(!out._realtimeBound && client.channel){
        out._realtimeBound=true;
        const ch=client.channel('mdh72-connection-health');
        ch.on('postgres_changes',{event:'*',schema:'public',table:'threats'},()=>{}).subscribe(status=>{out.realtime=status==='SUBSCRIBED';});
      }
    }catch(e){out.status='error';out.error=e?.message||String(e);out.checkedAt=new Date().toISOString();console.warn('[MDH72 SUPABASE]',out.error)}
    window.dispatchEvent(new CustomEvent('mdh72:supabase-status',{detail:{...out}}));
    return {...out};
  }
  window.mdh72CheckSupabase=check;
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(check,0)); else setTimeout(check,0);
})();
