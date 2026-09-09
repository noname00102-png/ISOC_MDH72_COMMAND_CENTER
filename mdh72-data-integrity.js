(function(){
'use strict';
const SUPABASE_URL='https://riuebseoczwwifxezcwj.supabase.co';
const SUPABASE_KEY='sb_publishable_G6QyDB6Ux0Rd9yzbuQCCoQ_mkyu7wuO';
const DUP_WINDOW_MS=5*60*1000;
function getFrame(){return document.getElementById('app')}
function val(d,ids){for(const id of ids){const el=d.getElementById(id);if(el)return String(el.value??'').trim()}return ''}
function num(d,ids){const v=val(d,ids);const n=Number(v);return Number.isFinite(n)?n:null}
function setFormStatus(d,msg,type){const s=d.getElementById('formStatus');if(!s)return;s.textContent=msg;s.className='status '+(type==='error'?'error':type==='success'?'success':'')}
function clientFor(w){
  if(w.sb?.from)return w.sb;
  if(w.supabase?.createClient)return w.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
  throw new Error('Supabase client library is unavailable in iframe');
}
async function checkDuplicate(d,w){
  const title=val(d,['title','v24Title']);
  const type=val(d,['threat_type','v24Type']);
  const district=val(d,['district','v24District']);
  const sub=val(d,['subdistrict','v24Tambon']);
  const lat=num(d,['lat','v24Latitude']);
  const lng=num(d,['lng','v24Longitude']);
  if(!title||!type)return null;
  const client=clientFor(w);
  let q=client.from('threats').select('id,title,created_at').eq('title',title).eq('threat_type',type).eq('status','active').gte('created_at',new Date(Date.now()-DUP_WINDOW_MS).toISOString()).order('created_at',{ascending:false}).limit(5);
  q=district?q.eq('district',district):q.is('district',null);
  q=sub?q.eq('subdistrict',sub):q.is('subdistrict',null);
  if(lat!==null&&lng!==null)q=q.eq('latitude',lat).eq('longitude',lng);
  const {data,error}=await q;
  if(error)throw error;
  return (data||[])[0]||null;
}
function findSaveButton(d){return d.getElementById('saveButton')||d.querySelector('#threatDrawer .v24-save')}
function isEdit(d){return !!d.getElementById('editId')?.value.trim()}
function install(){
  const frame=getFrame();
  if(!frame||frame.dataset.mdhIntegrityInstalled==='1')return false;
  const d=frame.contentDocument,w=frame.contentWindow;
  if(!d||!w)return false;
  const b=findSaveButton(d);
  if(!b)return false;
  frame.dataset.mdhIntegrityInstalled='1';
  d.addEventListener('click',function(e){
    const target=e.target.closest('#saveButton,#threatDrawer .v24-save');
    if(!target)return;
    if(target.dataset.mdhAllowOnce==='1'){delete target.dataset.mdhAllowOnce;return}
    if(target.dataset.mdhDuplicateChecking==='1'){e.preventDefault();e.stopImmediatePropagation();return}
    if(isEdit(d))return;
    target.dataset.mdhDuplicateChecking='1';
    e.preventDefault();
    e.stopImmediatePropagation();
    checkDuplicate(d,w).then(duplicate=>{
      if(duplicate){
        setFormStatus(d,'พบเหตุการณ์ข้อมูลเดียวกันที่บันทึกภายใน 5 นาที ระบบหยุดการบันทึกซ้ำ','error');
        alert('ตรวจพบข้อมูลซ้ำในช่วง 5 นาทีที่ผ่านมา ระบบยังไม่บันทึกข้อมูลซ้ำ');
        return;
      }
      target.dataset.mdhAllowOnce='1';
      target.click();
    }).catch(err=>{
      console.error('[MDH-INTEGRITY] duplicate check failed:',err);
      setFormStatus(d,'ตรวจสอบข้อมูลซ้ำไม่สำเร็จ: '+(err?.message||String(err)),'error');
      alert('ไม่สามารถตรวจสอบข้อมูลซ้ำได้ จึงยังไม่บันทึกข้อมูล เพื่อความปลอดภัยของข้อมูล');
    }).finally(()=>{delete target.dataset.mdhDuplicateChecking});
  },true);
  w.addEventListener('error',e=>console.error('[MDH-RUNTIME] JavaScript error:',e.error||e.message));
  w.addEventListener('unhandledrejection',e=>console.error('[MDH-RUNTIME] Unhandled promise rejection:',e.reason));
  console.info('[MDH-INTEGRITY] duplicate guard installed for V2/V24');
  return true;
}
function boot(){
  if(install())return;
  const frame=getFrame();
  if(frame)frame.addEventListener('load',install,{once:false});
  let n=0;
  const t=setInterval(()=>{if(install()||++n>=30)clearInterval(t)},500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
