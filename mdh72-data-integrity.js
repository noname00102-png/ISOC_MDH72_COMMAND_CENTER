(function(){'use strict';
const SUPABASE_URL='https://riuebseoczwwifxezcwj.supabase.co';
const SUPABASE_KEY='sb_publishable_G6QyDB6Ux0Rd9yzbuQCCoQ_mkyu7wuO';
const DUP_WINDOW_MS=5*60*1000;
function getFrame(){return document.getElementById('app')}
function install(){const frame=getFrame();if(!frame||frame.dataset.mdhIntegrityInstalled==='1')return false;const d=frame.contentDocument,w=frame.contentWindow;if(!d||!w)return false;frame.dataset.mdhIntegrityInstalled='1';
  const required=['report','summary','statTotal','statActive','statCritical','statToday','search','filterLevel','filterStatus','refreshButton','loginButton','loginForm','adminMenu','form','saveButton'];
  const missing=required.filter(id=>!d.getElementById(id));
  if(missing.length)console.error('[MDH-INTEGRITY] Missing DOM IDs:',missing);
  d.addEventListener('click',async e=>{const b=e.target.closest('#saveButton');if(!b)return;const edit=d.getElementById('editId')?.value.trim();if(edit)return;
    const title=d.getElementById('title')?.value.trim();const type=d.getElementById('threat_type')?.value.trim();const district=d.getElementById('district')?.value.trim();const sub=d.getElementById('subdistrict')?.value.trim();
    if(!title||!type)return;
    try{if(!w.supabase?.createClient){console.warn('[MDH-INTEGRITY] Supabase client library is unavailable in iframe');return}const sb=w.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});const since=new Date(Date.now()-DUP_WINDOW_MS).toISOString();const query=sb.from('threats').select('id,created_at').eq('title',title).eq('threat_type',type);const scoped=district?query.eq('district',district):query.is('district',null);const scoped2=sub?scoped.eq('subdistrict',sub):scoped.is('subdistrict',null);const {data,error}=await scoped2.gte('created_at',since).limit(5);
      if(error){console.warn('[MDH-INTEGRITY] duplicate check failed:',error.message);return}
      if((data||[]).length){e.preventDefault();e.stopImmediatePropagation();const s=d.getElementById('formStatus');if(s){s.textContent='พบเหตุการณ์ข้อมูลเดียวกันที่บันทึกภายใน 5 นาที ระบบหยุดการบันทึกซ้ำเพื่อป้องกันข้อมูลซ้ำ';s.className='status error'}alert('ตรวจพบข้อมูลซ้ำในช่วง 5 นาทีที่ผ่านมา ระบบยังไม่บันทึกข้อมูลซ้ำ');}
    }catch(err){console.error('[MDH-INTEGRITY] duplicate guard error:',err)}
  },true);
  w.addEventListener('error',e=>console.error('[MDH-RUNTIME] JavaScript error:',e.error||e.message));
  w.addEventListener('unhandledrejection',e=>console.error('[MDH-RUNTIME] Unhandled promise rejection:',e.reason));
  console.info('[MDH-INTEGRITY] runtime audit installed');return true}
function boot(){if(install())return;const frame=getFrame();if(frame)frame.addEventListener('load',install,{once:false});let n=0;const t=setInterval(()=>{if(install()||++n>=20)clearInterval(t)},500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
