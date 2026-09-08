(() => {
  'use strict';
  const API='https://api-v3.thaiwater.net/api/v1/thaiwater30/provinces/waterlevel';
  const FN='get-mekong-mukdahan-water';
  const SOURCE='https://mukdahan.thaiwater.net/wl';
  const STATION_ID=11688855;
  const OLD_CODE='ridhydro_Kh.104';
  let timer=null,busy=false;
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num=v=>{if(v===null||v===undefined||v==='')return null;const n=Number(String(v).replace(/,/g,'').trim());return Number.isFinite(n)?n:null;};
  const statusText=v=>({1:'น้ำน้อยวิกฤต',2:'น้ำน้อย',3:'ปกติ',4:'น้ำมาก',5:'น้ำล้นตลิ่ง'})[Number(v)]||String(v??'ไม่ระบุ');
  const statusClass=v=>Number(v)>=5?'mdh-water-err':(Number(v)===1||Number(v)===2||Number(v)===4?'mdh-water-warn':'mdh-water-ok');
  function findStation(json){
    const rows=Array.isArray(json?.data)?json.data:[];
    return rows.find(x=>Number(x?.station?.id)===STATION_ID && String(x?.station?.tele_station_oldcode||'')===OLD_CODE && String(x?.geocode?.province_code||'')==='49')||null;
  }
  function normalize(record,source){
    if(!record)throw new Error(`ไม่พบสถานี ${STATION_ID}/${OLD_CODE} ใน Response ของ ThaiWater`);
    const level=num(record.waterlevel_msl),flow=num(record.flow_rate??record.discharge);
    if(level===null && flow===null)throw new Error('พบสถานีเป้าหมาย แต่ไม่มีค่าระดับน้ำ/อัตราการไหล');
    return {ok:true,source:SOURCE,api_source:source,station_id:STATION_ID,old_code:OLD_CODE,station_name:record.station?.tele_station_name?.th||'วัดศรีบุญเรือง',level_m_msl:level,flow_m3s:flow,situation_level:record.situation_level,measure_time:record.waterlevel_datetime,diff_wl_bank_m:num(record.diff_wl_bank),diff_wl_bank_text:record.diff_wl_bank_text,latitude:num(record.station?.tele_station_lat),longitude:num(record.station?.tele_station_long),fetched_at:new Date().toISOString()};
  }
  function renderLoading(){const el=$('waterList');if(el)el.innerHTML='<div class="mdh-water-wrap"><div class="mdh-water-card">🌊 กำลังดึงข้อมูลสถานีวัดศรีบุญเรืองจาก ThaiWater…</div></div>';}
  function renderError(msg){const el=$('waterList');if(!el)return;el.innerHTML=`<div class="mdh-water-wrap"><div class="mdh-water-card"><div class="mdh-water-title"><span>🌊 แม่น้ำโขง — มุกดาหาร</span><span class="mdh-water-err">● ข้อมูลไม่พร้อม</span></div><div class="mdh-water-meta">${esc(msg)}</div><div class="mdh-water-actions"><button class="mdh-water-btn" onclick="window.mdhFetchMekongWater(true)">↻ ลองใหม่</button><a class="mdh-water-btn" href="${SOURCE}" target="_blank" rel="noopener">เปิด ThaiWater</a></div></div></div>`;}
  function render(d){
    const level=num(d.level_m_msl),flow=num(d.flow_m3s),status=statusText(d.situation_level),cls=statusClass(d.situation_level);
    const t=d.measure_time?new Date(d.measure_time):null,ts=t&&!Number.isNaN(t.getTime())?t.toLocaleString('th-TH',{dateStyle:'medium',timeStyle:'medium'}):String(d.measure_time||'ไม่ระบุ');
    const el=$('waterList');if(!el)return;
    el.innerHTML=`<div class="mdh-water-wrap"><div class="mdh-water-card"><div class="mdh-water-title"><span>🌊 ${esc(d.station_name)} — แม่น้ำโขง</span><span class="${cls}">● ${esc(status)}</span></div><div class="mdh-water-grid"><div class="mdh-water-metric"><small>ระดับน้ำ</small><b>${level===null?'—':esc(level.toFixed(2))} <span style="font-size:11px">ม.รทก.</span></b></div><div class="mdh-water-metric"><small>อัตราการไหล</small><b>${flow===null?'—':esc(flow.toLocaleString('th-TH',{maximumFractionDigits:2}))} <span style="font-size:11px">ลบ.ม./วินาที</span></b></div><div class="mdh-water-metric"><small>ข้อมูลล่าสุด</small><b style="font-size:13px">${esc(ts)}</b></div></div><div class="mdh-water-status ${cls}">สถานการณ์: ${esc(status)}</div><div class="mdh-water-meta">แหล่งข้อมูล: ThaiWater API จริง • ${esc(API)} • สถานี ${STATION_ID} (${OLD_CODE}) • ไม่ใช้ค่าจำลอง</div><div class="mdh-water-actions"><button class="mdh-water-btn" onclick="window.mdhFetchMekongWater(true)">↻ อัปเดตทันที</button><a class="mdh-water-btn" href="${SOURCE}" target="_blank" rel="noopener">↗ แหล่งข้อมูลต้นทาง</a></div></div></div>`;
  }
  async function fetchDirect(){const r=await fetch(API,{method:'GET',headers:{Accept:'application/json'},cache:'no-store'});const text=await r.text();let json;try{json=JSON.parse(text)}catch{throw new Error(`ThaiWater API ส่งข้อมูลไม่ใช่ JSON (HTTP ${r.status})`)}if(!r.ok||json?.result!=='OK')throw new Error(`ThaiWater API HTTP ${r.status}`);return normalize(findStation(json),API);}
  async function fetchEdge(){
    const sb=window.sb;if(!sb?.auth?.getSession||!sb?.functions?.invoke)throw new Error('Supabase client ยังไม่พร้อม');
    const {data,error}=await sb.functions.invoke(FN,{method:'GET'});if(error)throw new Error(error.message||'Supabase Edge Function เรียกไม่สำเร็จ');if(!data?.ok)throw new Error(data?.error||'Edge Function ไม่มีข้อมูล');return data;
  }
  async function fetchWater(manual=false){
    if(busy)return;busy=true;if(manual)renderLoading();
    try{
      let data;let directError='';
      try{data=await fetchDirect();}
      catch(e){directError=e?.message||String(e);console.warn('[MEKONG WATER] direct API failed:',directError);data=await fetchEdge();}
      render(data);const sync=$('sync');if(sync)sync.textContent='● น้ำโขง: '+new Date(data.fetched_at||Date.now()).toLocaleTimeString('th-TH');
    }catch(e){console.error('[MEKONG WATER]',e);renderError(e?.message||String(e));}
    finally{busy=false;}
  }
  window.mdhFetchMekongWater=fetchWater;
  function start(){if(!$('waterList'))return;clearInterval(timer);fetchWater(true);timer=setInterval(()=>fetchWater(false),5*60*1000);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(start,800),{once:true});else setTimeout(start,800);
})();
