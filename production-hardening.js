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
function normalizeRows(){if(!Array.isArray(window.rows))return;window.rows=window.rows.map(r=>({...r,threat_level:normalize(r.threat_level)}))}
async function syncFromSupabase(){if(!window.sb?.from)return false;try{const{data,error}=await window.sb.from('threats').select('*').order('created_at',{ascending:false});if(error)throw error;window.rows=(data||[]).map(r=>({...r,threat_level:normalize(r.threat_level)}));try{if(typeof window.updateKpis==='function')await window.updateKpis()}catch(_){}try{if(typeof window.renderLatest==='function')window.renderLatest()}catch(_){}try{if(typeof window.renderEvents==='function')window.renderEvents()}catch(_){}try{if(typeof window.renderThreatHistory==='function')window.renderThreatHistory()}catch(_){}try{if(typeof window.mdhApplyMapThreatColors==='function')window.mdhApplyMapThreatColors()}catch(_){}return true}catch(e){console.warn('[MDH CANONICAL SUPABASE SYNC]',e);return false}}
function textCanonicalize(root=document){const replacements=[['🟢 ภัยคุกคามควบคุมได้','ปกติ'],['🟡 ภัยคุกคามเฝ้าระวัง','เฝ้าระวัง'],['🟠 ภัยคุกคามควบคุมได้ยาก','แจ้งเตือน'],['🔴 ภัยคุกคามควบคุมไม่ได้','วิกฤต'],['🔴 ภัยคุกคามวิกฤต','วิกฤต']];const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];while(w.nextNode())nodes.push(w.currentNode);nodes.forEach(n=>{let s=n.nodeValue;replacements.forEach(([a,b])=>{if(s.includes(a))s=s.split(a).join(b)});if(s!==n.nodeValue)n.nodeValue=s})}
function boot(){normalizeRows();textCanonicalize();syncFromSupabase();setTimeout(syncFromSupabase,1500);setTimeout(syncFromSupabase,4000);if(window.sb?.channel){try{window.mdh72CanonicalChannel?.unsubscribe?.();window.mdh72CanonicalChannel=window.sb.channel('mdh72-canonical-level-sync').on('postgres_changes',{event:'*',schema:'public',table:'threats'},()=>syncFromSupabase()).subscribe()}catch(e){console.warn('[MDH CANONICAL REALTIME]',e)}}if(window.MutationObserver){const ob=new MutationObserver(m=>{if(m.some(x=>x.addedNodes?.length))textCanonicalize()});ob.observe(document.body,{childList:true,subtree:true})}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();