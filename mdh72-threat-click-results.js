(()=>{
'use strict';
if(window.__MDH72_THREAT_CLICK_RESULTS__)return;
window.__MDH72_THREAT_CLICK_RESULTS__=true;
const LABELS={
 transnational_crime:'อาชญากรรมข้ามชาติ',drug:'ยาเสพติด',human_trafficking:'การค้ามนุษย์',cyber_attack:'การโจมตีทางไซเบอร์',
 unrest:'สถานการณ์ความไม่สงบ',public_understanding:'การสร้างความเข้าใจในพื้นที่',natural_resources:'ทรัพยากรธรรมชาติ',environment:'สิ่งแวดล้อม',disaster:'สาธารณภัย',land_rights:'ที่ดินทำกิน',social_order:'ปัญหาที่กระทบต่อความสงบเรียบร้อยของสังคม'
};
const ALIAS={
 transnational_crime:['อาชญากรรมข้ามชาติ','อาชญากรรมข้ามประเทศ'],drug:['ยาเสพติด','ยาเสพติดให้โทษ'],human_trafficking:['การค้ามนุษย์','ค้ามนุษย์'],cyber_attack:['การโจมตีทางไซเบอร์','ไซเบอร์'],
 unrest:['สถานการณ์ความไม่สงบ','ความไม่สงบ'],public_understanding:['การสร้างความเข้าใจในพื้นที่','สร้างความเข้าใจ'],natural_resources:['ทรัพยากรธรรมชาติ'],environment:['สิ่งแวดล้อม'],disaster:['สาธารณภัย','ภัยพิบัติ'],land_rights:['ที่ดินทำกิน'],social_order:['ความสงบเรียบร้อยของสังคม']
};
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function matches(row,key){const vals=[row?.threat_type,row?.threat_category,row?.title].map(v=>String(v??'').trim().toLowerCase());return (ALIAS[key]||[key]).some(a=>vals.some(v=>v.includes(String(a).toLowerCase())))}
function close(){document.getElementById('mdh72-threat-click-result')?.classList.remove('open')}
function show(key){
 const list=Array.isArray(window.rows)?window.rows.filter(r=>matches(r,key)):[];
 let panel=document.getElementById('mdh72-threat-click-result');
 if(!panel){panel=document.createElement('section');panel.id='mdh72-threat-click-result';panel.className='mdh72-threat-click-result';document.body.appendChild(panel)}
 panel.innerHTML=`<div class="mdh72-tcr-head"><strong>🔎 ${esc(LABELS[key]||key)}</strong><button type="button" data-tcr-close>กลับ</button></div><div class="mdh72-tcr-total"><b>${list.length}</b><span>เหตุการณ์ที่พบจากข้อมูลปัจจุบัน</span></div><div class="mdh72-tcr-list">${list.length?list.map(r=>`<article><strong>${esc(r.title||'ไม่ระบุหัวข้อ')}</strong><div>${esc(r.district||'-')}${r.subdistrict?' / '+esc(r.subdistrict):''}</div><small>${esc(r.event_datetime||r.created_at||'-')} • ${esc(r.threat_level||'ปกติ')} • ${esc(r.status||'-')}</small></article>`).join(''):'<div class="mdh72-tcr-empty">ยังไม่มีเหตุการณ์ในประเภทนี้</div>'}</div><div class="mdh72-tcr-workflow"><b>อำนาจหน้าที่ กอ.รมน.</b><br>ติดตาม → ตรวจสอบ → ประสานงาน → ประเมินแนวโน้ม → รายงาน → อำนวยการ → เสริมการปฏิบัติ → สร้างการมีส่วนร่วม</div>`;
 panel.classList.add('open');panel.querySelector('[data-tcr-close]').onclick=close;
}
function install(){
 if(document.getElementById('mdh72-tcr-css'))return;
 const s=document.createElement('style');s.id='mdh72-tcr-css';s.textContent=`.mdh72-threat-click-result{display:none;position:fixed;inset:0;z-index:2147483001;background:#061827;color:#fff;padding:18px;overflow:auto}.mdh72-threat-click-result.open{display:block}.mdh72-tcr-head,.mdh72-tcr-total,.mdh72-tcr-list,.mdh72-tcr-workflow{max-width:900px;margin-left:auto;margin-right:auto}.mdh72-tcr-head{display:flex;justify-content:space-between;align-items:center;gap:10px}.mdh72-tcr-head button{padding:8px 14px}.mdh72-tcr-total{display:flex;align-items:baseline;gap:8px;margin:18px 0 12px;padding:14px;border:1px solid #28556b;border-radius:10px;background:#082235}.mdh72-tcr-total b{font-size:30px}.mdh72-tcr-total span,.mdh72-tcr-list small{color:#8fa9b7;font-size:12px}.mdh72-tcr-list article{padding:14px;margin:7px 0;border:1px solid #28556b;border-radius:10px;background:#071d2c}.mdh72-tcr-workflow{margin-top:18px;padding:14px;border:1px solid #28556b;border-radius:10px;background:#082235;line-height:1.8;font-size:12px}.mdh72-tcr-empty{text-align:center;padding:24px;color:#8fa9b7}@media(max-width:700px){.mdh72-threat-click-result{padding:12px}}`;document.head.appendChild(s);
 document.addEventListener('click',e=>{const b=e.target.closest?.('.mdh72-threat-type');if(!b)return;const key=b.dataset.type;if(!key||!LABELS[key])return;e.preventDefault();e.stopPropagation();show(key)},true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();