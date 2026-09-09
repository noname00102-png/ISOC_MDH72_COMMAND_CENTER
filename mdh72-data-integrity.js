(function(){'use strict';
const SUPABASE_URL='https://riuebseoczwwifxezcwj.supabase.co';
const SUPABASE_KEY='sb_publishable_G6QyDB6Ux0Rd9yzbuQCCoQ_mkyu7wuO';
const DUP_WINDOW_MS=5*60*1000;
function getFrame(){return document.getElementById('app')}
function setFormStatus(d,msg,type){const s=d.getElementById('formStatus');if(!s)return;s.textContent=msg;s.className='status '+(type==='error'?'error':type==='success'?'success':'')}
async function checkDuplicate(d,w){
  if(!w.supabase?.createClient)throw new Error('Supabase client library is unavailable in iframe');
  const title=d.getElementById('title')?.value.trim()||'';
  const type=d.getElementById('threat_type')?.value.trim()||'';
  const district=d.getElementById('district')?.value.trim()||'';
  const sub=d.getElementById('subdistrict')?.value.trim()||'';
  if(!title||!type)return null;
  const client=w.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
  let q=client.from('threats').select('id,created_at').eq('title',title).eq('threat_type',type).eq('status','active');
  q=district?q.eq('district',district):q.is('district',null);
  q=sub?q.eq('subdistrict',sub):q.is('subdistrict',null);
  const {data,error}=await q.gte('created_at',new Date(Date.now()-DUP_WINDOW_MS).toISOString()).order('created_at',{ascending:false}).limit(1);
  if(error)throw new Error(error.message);
  return (data||[])[0]||null;
}
function install(){
  const frame=getFrame();
  if(!frame||frame.dataset.mdhIntegrityInstalled==='1')return false;
  const d=frame.contentDocument,w=frame.contentWindow;
  if(!d||!w)return false;
  frame.dataset.mdhIntegrityInstalled='1';
  const required=['report','summary','statTotal','statActive','statCritical','statToday','search','filterLevel','filterStatus','refreshButton','loginButton','loginForm','adminMenu','form','saveButton'];
  const missing=required.filter(id=>!d.getElementById(id));
  if(missing.length)console.error('[MDH-INTEGRITY] Missing DOM IDs:',missing);
  d.addEventListener('click',function(e){
    const b=e.target.closest('#saveButton');
    if(!b)return;
    if(b.dataset.mdhAllowOnce==='1'){delete b.dataset.mdhAllowOnce;return;}
    if(b.dataset.mdhDuplicateChecking==='1'){e.preventDefault();e.stopImmediatePropagation();return;}
    const edit=d.getElementById('editId')?.value.trim();
    if(edit)return;
    b.dataset.mdhDuplicateChecking='1';
    e.preventDefault();
    e.stopImmediatePropagation();
    checkDuplicate(d,w).then(duplicate=>{
      if(duplicate){
        setFormStatus(d,'พบเหตุการณ์ข้อมูลเดียวกันที่บันทึกภายใน 5 นาที ระบบหยุดการบันทึกซ้ำ','error');
        alert('ตรวจพบข้อมูลซ้ำในช่วง 5 นาทีที่ผ่านมา ระบบยังไม่บันทึกข้อมูลซ้ำ');
        return;
      }
      b.dataset.mdhAllowOnce='1';
      b.click();
    }).catch(err=>{
      console.error('[MDH-INTEGRITY] duplicate check failed:',err);
      setFormStatus(d,'ตรวจสอบข้อมูลซ้ำไม่สำเร็จ: '+(err?.message||String(err)),'error');
      alert('ไม่สามารถตรวจสอบข้อมูลซ้ำได้ จึงยังไม่บันทึกข้อมูล เพื่อความปลอดภัยของข้อมูล');
    }).finally(()=>{delete b.dataset.mdhDuplicateChecking});
  },true);
  w.addEventListener('error',e=>console.error('[MDH-RUNTIME] JavaScript error:',e.error||e.message));
  w.addEventListener('unhandledrejection',e=>console.error('[MDH-RUNTIME] Unhandled promise rejection:',e.reason));
  console.info('[MDH-INTEGRITY] runtime audit installed');
  return true;
}
function boot(){
  if(install())return;
  const frame=getFrame();
  if(frame)frame.addEventListener('load',install,{once:false});
  let n=0;
  const t=setInterval(()=>{if(install()||++n>=20)clearInterval(t)},500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
