(()=>{'use strict';
const LEVELS=[
{key:'normal',score:1,label:'ปกติ',color:'#22c55e',aliases:['ปกติ','🟢 ภัยคุกคามควบคุมได้','ควบคุมได้','normal']},
{key:'watch',score:2,label:'เฝ้าระวัง',color:'#eab308',aliases:['เฝ้าระวัง','🟡 ภัยคุกคามเฝ้าระวัง','medium','ปานกลาง']},
{key:'high',score:3,label:'แจ้งเตือน',color:'#f97316',aliases:['แจ้งเตือน','🟠 ภัยคุกคามควบคุมได้ยาก','สูง','high']},
{key:'critical',score:4,label:'วิกฤต',color:'#ef4444',aliases:['วิกฤต','🔴 ภัยคุกคามควบคุมไม่ได้','🔴 ภัยคุกคามวิกฤต','critical','crisis']}];
const clean=v=>String(v??'').replace(/[🟢🟡🟠🔴⚠️]/g,'').trim().toLowerCase();
function meta(v){const x=clean(v);return LEVELS.find(a=>a.aliases.some(z=>clean(z)===x||x.includes(clean(z))))||{key:'unknown',score:0,label:'ไม่ระบุระดับ',color:'#64748b',aliases:[]}}
function normalize(v){return meta(v).label}
window.mdh72NormalizeSituationLevel=normalize;
window.mdh72Severity=row=>meta(row?.threat_level);
window.MDH72_THREAT_LEVELS=LEVELS.map(x=>x.label);
window.getThreatColor=v=>meta(v).color;
window.norm=window.norm||((v)=>String(v??'').trim().toLowerCase());

// IMPORTANT: this production patch is a presentation/runtime hardening layer.
// It must NOT issue a second unbounded Supabase query, because the canonical
// dashboard loader already handles pagination, visibility/RLS and ordering.
function normalizeRows(){
  if(!Array.isArray(window.rows))return;
  window.rows=window.rows.map(r=>({...r,threat_level:normalize(r.threat_level)}));
}

function refreshPresentation(){
  try{if(typeof window.updateKpis==='function')window.updateKpis()}catch(e){console.warn('[MDH KPI HARDENING]',e)}
  try{if(typeof window.renderLatest==='function')window.renderLatest()}catch(e){console.warn('[MDH LATEST HARDENING]',e)}
  try{if(typeof window.renderEvents==='function')window.renderEvents()}catch(e){console.warn('[MDH EVENTS HARDENING]',e)}
  try{if(typeof window.renderThreatHistory==='function')window.renderThreatHistory()}catch(e){console.warn('[MDH HISTORY HARDENING]',e)}
  try{if(typeof window.mdhApplyMapThreatColors==='function')window.mdhApplyMapThreatColors()}catch(e){console.warn('[MDH MAP HARDENING]',e)}
}

function installFullScreenMap(){
  if(document.getElementById('mdh72-map-fullscreen-fix'))return;
  const style=document.createElement('style');
  style.id='mdh72-map-fullscreen-fix';
  style.textContent=`
/* MDH72 MAP FULL SCREEN — only changes the map container sizing. */
html,body{min-height:100%;}
.main-grid{width:100%!important;min-width:0!important;}
.main-grid>.map-card{
  width:100%!important;
  min-width:0!important;
  max-width:none!important;
  height:100dvh!important;
  min-height:100dvh!important;
  max-height:none!important;
  box-sizing:border-box!important;
  display:flex!important;
  flex-direction:column!important;
  grid-column:1 / -1!important;
}
.main-grid>.map-card #map{
  width:100%!important;
  height:auto!important;
  min-height:0!important;
  flex:1 1 auto!important;
  box-sizing:border-box!important;
}
.main-grid>.map-card .map-head{flex:0 0 auto!important;}
.main-grid>.map-card>div:last-child{flex:0 0 auto!important;}
@media(max-width:700px){
  .main-grid>.map-card{height:100dvh!important;min-height:100dvh!important;}
}
`;
  (document.head||document.documentElement).appendChild(style);
  window.MDH72_MAP_FULL_SCREEN_FIX=true;
}

function refreshMapSize(){
  try{
    if(window.map&&typeof window.map.invalidateSize==='function'){
      requestAnimationFrame(()=>window.map.invalidateSize({pan:false,animate:false}));
      setTimeout(()=>window.map.invalidateSize({pan:false,animate:false}),250);
      setTimeout(()=>window.map.invalidateSize({pan:false,animate:false}),800);
    }
  }catch(e){console.warn('[MDH MAP SIZE]',e)}
}

function boot(){
  installFullScreenMap();
  normalizeRows();
  refreshPresentation();
  refreshMapSize();
  if(window.MDH72_PRODUCTION_HARDENING_AUDIT){
    console.warn('[MDH PRODUCTION HARDENING] duplicate-loader guard active');
  }
  window.MDH72_PRODUCTION_HARDENING_AUDIT={
    active:true,
    canonicalDataLoader:'dashboard',
    duplicateSupabaseQuery:false,
    duplicateRealtimeChannel:false,
    normalizedRows:Array.isArray(window.rows)?window.rows.length:0,
    mapFullScreen:true
  };
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();