(()=>{
  'use strict';
  if(window.__MDH72_PROD_HARDENING__) return;
  window.__MDH72_PROD_HARDENING__=true;
  const log=(...a)=>console.debug('[MDH72 PROD]',...a);
  const safe=(fn)=>{try{return fn()}catch(e){console.error('[MDH72 PROD]',e);return null}};
  function installBaseCSS(){
    if(document.getElementById('mdh72-prod-css')) return;
    const s=document.createElement('style'); s.id='mdh72-prod-css';
    s.textContent=`html,body{max-width:100%;overflow-x:hidden}#mdh72ProdHealth{position:fixed;right:12px;bottom:12px;z-index:1000000;background:#092235;color:#eaf6fb;border:1px solid #285978;border-radius:999px;padding:7px 11px;font:12px Arial,sans-serif;box-shadow:0 4px 18px rgba(0,0,0,.25)}#mdh72ProdHealth.ok{border-color:#2e8b57}#mdh72ProdHealth.warn{border-color:#a97922}#mdh72ProdHealth.err{border-color:#a33}@media(max-width:700px){#mdh72ProdHealth{right:7px;bottom:7px;font-size:11px;padding:6px 9px}}`;
    document.head.appendChild(s);
  }
  function health(){let el=document.getElementById('mdh72ProdHealth');if(!el){el=document.createElement('div');el.id='mdh72ProdHealth';document.body.appendChild(el)}return el}
  function setHealth(text,cls){const el=health();el.textContent=text;el.className=cls||''}
  async function checkSupabase(){
    const sb=window.MDH72_RUNTIME?.supabase;
    if(!sb){setHealth('● Supabase: รอการเชื่อมต่อ','warn');return}
    try{const {error}=await sb.from('threats').select('id',{count:'exact',head:true});if(error)throw error;setHealth('● ระบบข้อมูล: เชื่อมต่อแล้ว','ok')}
    catch(e){setHealth('● ระบบข้อมูล: มีปัญหา','err');console.error('[MDH72 PROD] Supabase health check failed',e)}
  }
  let refreshTimer=0;
  function scheduleRefresh(){clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>safe(()=>document.getElementById('refreshButton')?.click()),450)}
  function bindRuntimeEvents(){
    window.addEventListener('mdh72:threat-change',scheduleRefresh,{passive:true});
    window.addEventListener('mdh72:image-change',scheduleRefresh,{passive:true});
    window.addEventListener('mdh72:auth',()=>{scheduleRefresh();checkSupabase()},{passive:true});
    window.addEventListener('mdh72:realtime',e=>{const status=e?.detail;if(status==='SUBSCRIBED')setHealth('● Realtime: เชื่อมต่อแล้ว','ok');else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT')setHealth('● Realtime: ขัดข้อง','err')},{passive:true});
  }
  function bindNavigation(){document.addEventListener('click',e=>{const b=e.target.closest?.('#mdh72Side button[data-v]');if(!b)return;if(b.dataset.v==='m')window.dispatchEvent(new CustomEvent('mdh72:open-map'))},true)}
  function globalErrors(){window.addEventListener('error',e=>console.error('[MDH72 PROD] uncaught error',e.error||e.message),true);window.addEventListener('unhandledrejection',e=>console.error('[MDH72 PROD] unhandled rejection',e.reason),true)}
  function start(){installBaseCSS();bindRuntimeEvents();bindNavigation();globalErrors();checkSupabase();setInterval(checkSupabase,60000);log('production hardening active')}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();