(function(){
'use strict';
const VERSION='v7-live-data';
const URL=typeof SUPABASE_URL!=='undefined'?SUPABASE_URL:'https://riuebseoczwwifxezcwj.supabase.co';
const KEY=typeof SUPABASE_KEY!=='undefined'?SUPABASE_KEY:'sb_publishable_G6QyDB6Ux0Rd9yzbuQCCoQ_mkyu7wuO';
const TABLE='threats';
const PAGE=1000;
let busy=false;
function headers(token){const h={'apikey':KEY,'Accept':'application/json','Cache-Control':'no-cache, no-store, max-age=0','Pragma':'no-cache'};if(token)h.Authorization='Bearer '+token;return h;}
async function fetchFresh(){
  if(busy)return Array.isArray(state.rows)?state.rows:[];
  busy=true;
  try{
    let token=null;
    try{const s=await sb.auth.getSession();token=s?.data?.session?.access_token||null;}catch(_){ }
    const out=[];
    for(let from=0;;from+=PAGE){
      const p=new URLSearchParams({select:'*',order:'created_at.desc.nullslast',limit:String(PAGE),offset:String(from)});
      if(!token)p.set('visibility','eq.public');
      const r=await fetch(URL+'/rest/v1/'+TABLE+'?'+p.toString(),{method:'GET',headers:headers(token),cache:'no-store'});
      if(!r.ok)throw new Error('Supabase REST HTTP '+r.status+' '+(await r.text()).slice(0,300));
      const page=await r.json();
      if(!Array.isArray(page))throw new Error('Supabase REST ไม่คืน Array');
      out.push(...page);
      if(page.length<PAGE)break;
    }
    state.rows=out.map(r=>({...r,situation_level:r.threat_level||r.situation_level||r.severity||'ปกติ',detail:r.description||r.detail||''})).sort((a,b)=>new Date(eventDate(b)||0)-new Date(eventDate(a)||0));
    renderAll();
    const latest=state.rows[0];
    const stamp=latest?fmt(eventDate(latest)):'ไม่มีข้อมูล';
    const el=$('mapStatus');if(el)el.textContent='● LIVE '+VERSION+' • '+state.rows.length+' เหตุการณ์ • ล่าสุด '+stamp;
    window.__mdhLiveData={ok:true,version:VERSION,count:state.rows.length,checked_at:new Date().toISOString(),latest_id:latest?.id||null,latest_event_datetime:latest?.event_datetime||null};
    return state.rows;
  }finally{busy=false;}
}
const originalLoadRows=window.loadRows;
window.loadRows=async function(){return fetchFresh();};
window.mdhForceFresh=fetchFresh;
function start(){
  if(window.__mdhLiveDataTimer)clearInterval(window.__mdhLiveDataTimer);
  window.__mdhLiveDataTimer=setInterval(()=>{if(document.visibilityState!=='hidden')fetchFresh().catch(e=>console.error('[MDH LIVE DATA]',e));},30000);
  window.addEventListener('focus',()=>fetchFresh().catch(e=>console.error('[MDH LIVE DATA]',e)),{passive:true});
  window.addEventListener('online',()=>fetchFresh().catch(e=>console.error('[MDH LIVE DATA]',e)),{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')fetchFresh().catch(e=>console.error('[MDH LIVE DATA]',e));});
  setTimeout(()=>fetchFresh().catch(e=>console.error('[MDH LIVE DATA]',e)),100);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
