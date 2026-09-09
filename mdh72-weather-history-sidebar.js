'use strict';
(() => {
  const KEY='weather-history';
  const LABEL='🗂️ ประวัติสภาพอากาศจังหวัดมุกดาหาร';
  const STYLE_ID='mdh72-weather-history-sidebar-style';
  const PANEL_ID='mdh72-weather-history-sidebar-panel';
  const SIDEBAR_ID='mdh72-weather-history-sidebar-fallback';

  const qs=(s,r=document)=>r.querySelector(s);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function ensureStyle(){
    if(qs('#'+STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;
    s.textContent=`#${SIDEBAR_ID}{position:fixed;left:12px;top:110px;z-index:99990;width:248px;background:#071c2b;border:1px solid #285978;border-radius:12px;box-shadow:0 12px 32px rgba(0,0,0,.35);padding:8px}#${SIDEBAR_ID} button{display:block;width:100%;padding:11px 12px;border:0;border-radius:8px;background:transparent;color:#eaf6fb;text-align:left;font:600 13px/1.35 Arial,sans-serif;cursor:pointer}#${SIDEBAR_ID} button:hover,#${SIDEBAR_ID} button.active{background:#0b6686}#${PANEL_ID}{position:fixed;inset:0;z-index:99999;display:none;background:rgba(3,14,24,.78);padding:4vh 4vw;box-sizing:border-box}#${PANEL_ID}.open{display:block}#${PANEL_ID} .mh-card{max-width:1100px;height:92vh;margin:auto;background:#f8fafc;color:#102331;border-radius:14px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.45);display:flex;flex-direction:column}#${PANEL_ID} .mh-head{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 18px;background:linear-gradient(135deg,#0f2747,#173b68);color:#fff}#${PANEL_ID} .mh-head button{border:1px solid rgba(255,255,255,.3);background:transparent;color:#fff;border-radius:8px;padding:7px 10px;cursor:pointer}#${PANEL_ID} .mh-tools{padding:10px 14px;border-bottom:1px solid #dce5ea;display:flex;gap:8px;flex-wrap:wrap}#${PANEL_ID} .mh-tools button{border:1px solid #cbd5e1;background:#fff;color:#102331;border-radius:8px;padding:8px 12px;cursor:pointer;font-weight:700}#${PANEL_ID} .mh-tools button.active{background:#0f2747;color:#fff}#${PANEL_ID} .mh-status{padding:8px 14px;color:#526675;font-size:12px}#${PANEL_ID} .mh-table{overflow:auto;flex:1}#${PANEL_ID} table{width:100%;border-collapse:collapse;font-size:12px}#${PANEL_ID} th,#${PANEL_ID} td{padding:9px;border-bottom:1px solid #e7edf1;text-align:left;white-space:nowrap}#${PANEL_ID} th{position:sticky;top:0;background:#eef4f7;color:#334b59}#${PANEL_ID} .err{color:#b42318;padding:20px}@media(max-width:700px){#${SIDEBAR_ID}{left:6px;right:6px;top:70px;width:auto}#${PANEL_ID}{padding:1vh 1vw}#${PANEL_ID} .mh-card{height:98vh}}`;
    document.head.appendChild(s);
  }
  function findRealSidebar(){return qs('[data-sidebar]')||qs('#sidebar')||qs('.sidebar')||qs('aside')||qs('nav');}
  function ensureFallbackSidebar(){
    const real=findRealSidebar();
    if(real)return real;
    let sb=qs('#'+SIDEBAR_ID);
    if(!sb){sb=document.createElement('div');sb.id=SIDEBAR_ID;sb.setAttribute('aria-label','เมนูข้อมูล');document.body.appendChild(sb);}
    return sb;
  }
  function ensurePanel(){
    let p=qs('#'+PANEL_ID);if(p)return p;
    p=document.createElement('div');p.id=PANEL_ID; p.setAttribute('aria-hidden','true');
    p.innerHTML=`<div class="mh-card" role="dialog" aria-modal="true" aria-labelledby="mdh-weather-history-title"><div class="mh-head"><div><strong id="mdh-weather-history-title">🗂️ ประวัติสภาพอากาศจังหวัดมุกดาหาร</strong><div style="font-size:11px;opacity:.8;margin-top:3px">ข้อมูลที่บันทึกจากระบบสภาพอากาศจังหวัดมุกดาหาร</div></div><button type="button" data-close>ปิด</button></div><div class="mh-tools"><button type="button" data-mode="daily" class="active">รายวัน</button><button type="button" data-mode="weekly">รายสัปดาห์</button><button type="button" data-mode="monthly">รายเดือน</button><button type="button" data-refresh>↻ รีเฟรช</button></div><div class="mh-status" data-status>กำลังโหลด...</div><div class="mh-table"><table><thead><tr><th>วันที่</th><th>สภาพอากาศ</th><th>สูงสุด</th><th>ต่ำสุด</th><th>โอกาสฝน</th><th>เวลารับข้อมูล</th></tr></thead><tbody data-body><tr><td colspan="6">กำลังโหลดข้อมูล...</td></tr></tbody></table></div></div>`;
    document.body.appendChild(p);
    p.addEventListener('click',e=>{if(e.target===p||e.target.closest('[data-close]'))closePanel();const b=e.target.closest('[data-refresh]');if(b)load();const m=e.target.closest('[data-mode]');if(m){p.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('active',x===m));render(window.__mdhWeatherHistoryRows||[],m.dataset.mode)}});
    return p;
  }
  function openPanel(){const p=ensurePanel();p.classList.add('open');p.setAttribute('aria-hidden','false');load();}
  function closePanel(){const p=qs('#'+PANEL_ID);if(p){p.classList.remove('open');p.setAttribute('aria-hidden','true')}}
  function ensureMenu(){
    ensureStyle();
    const sidebar=findRealSidebar()||ensureFallbackSidebar();
    let item=sidebar.querySelector('[data-key="weather-history"],[data-menu-key="weather-history"],[data-nav-key="weather-history"]');
    if(!item){item=document.createElement('button');item.type='button';item.dataset.key=KEY;item.textContent=LABEL;item.addEventListener('click',openPanel);(sidebar.querySelector('[data-menu-list],.menu-list,.sidebar-menu,ul,nav')||sidebar).appendChild(item)}
    else {item.onclick=null;item.addEventListener('click',openPanel,{once:true})}
    const panel=qs('[id*="weather-history-panel"],.sx-panel[data-panel="weather-history"]');
    if(panel&&panel.id!==PANEL_ID){panel.setAttribute('aria-hidden','true');panel.style.display='none';panel.hidden=true}
    return item;
  }
  function sbClient(){
    if(window.supabase?.createClient){const url='https://riuebseoczwwifxezcwj.supabase.co';const key='sb_publishable_G6QyDB6Ux0Rd9yzbuQCCoQ_mkyu7wuO';return window.__mdhSb||(window.__mdhSb=window.supabase.createClient(url,key));}
    return null;
  }
  async function load(){
    const p=ensurePanel(),status=qs('[data-status]',p),body=qs('[data-body]',p);status.textContent='กำลังโหลดข้อมูลจริงจาก Supabase…';
    const sb=sbClient();
    if(!sb){status.textContent='ไม่พบ Supabase client';body.innerHTML='<tr><td colspan="6" class="err">ไม่สามารถเชื่อมต่อ Supabase client ได้</td></tr>';return}
    try{
      const {data,error}=await sb.from('weather_forecast_history').select('forecast_date,weather_text,temperature_max,temperature_min,precipitation_probability,captured_at').eq('province','มุกดาหาร').order('forecast_date',{ascending:false}).order('captured_at',{ascending:false}).limit(366);
      if(error)throw error;
      window.__mdhWeatherHistoryRows=data||[];status.textContent=`ข้อมูลจริง ${window.__mdhWeatherHistoryRows.length} รายการ • จังหวัดมุกดาหาร`;
      render(window.__mdhWeatherHistoryRows,'daily');
    }catch(e){console.error('[MDH72 WEATHER HISTORY]',e);status.textContent='โหลดข้อมูลไม่สำเร็จ';body.innerHTML=`<tr><td colspan="6" class="err">${esc(e?.message||e)}</td></tr>`}
  }
  function render(rows,mode){
    const p=ensurePanel(),body=qs('[data-body]',p);let r=[...rows];
    if(mode==='weekly')r=aggregate(r,'week');else if(mode==='monthly')r=aggregate(r,'month');
    if(!r.length){body.innerHTML='<tr><td colspan="6">ยังไม่มีข้อมูล</td></tr>';return}
    body.innerHTML=r.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.weather_text||'-')}</td><td>${x.max==null?'-':esc(x.max+' °C')}</td><td>${x.min==null?'-':esc(x.min+' °C')}</td><td>${x.rain==null?'-':esc(x.rain+'%')}</td><td>${esc(x.captured||'-')}</td></tr>`).join('');
  }
  function aggregate(rows,kind){
    const m=new Map();for(const x of rows){const d=String(x.forecast_date||'');if(!d)continue;const key=kind==='month'?d.slice(0,7):weekKey(d);const a=m.get(key)||{date:key,weather_text:'สรุปช่วงเวลา',max:null,min:null,rain:null,n:0,captured:x.captured_at||''};const mx=Number(x.temperature_max),mn=Number(x.temperature_min),rp=Number(x.precipitation_probability);if(Number.isFinite(mx))a.max=a.max==null?mx:Math.max(a.max,mx);if(Number.isFinite(mn))a.min=a.min==null?mn:Math.min(a.min,mn);if(Number.isFinite(rp))a.rain=a.rain==null?rp:Math.max(a.rain,rp);a.n++;m.set(key,a)}return [...m.values()].sort((a,b)=>b.date.localeCompare(a.date));
  }
  function weekKey(s){const d=new Date(s+'T00:00:00+07:00');if(Number.isNaN(d.getTime()))return s;const day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);return d.toISOString().slice(0,10)}
  function boot(){ensureMenu();ensurePanel();let last=0;const obs=new MutationObserver(()=>{const n=Date.now();if(n-last<250)return;last=n;ensureMenu()});obs.observe(document.body,{childList:true,subtree:true});window.addEventListener('beforeunload',()=>obs.disconnect(),{once:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
