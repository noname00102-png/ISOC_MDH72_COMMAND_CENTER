(()=>{
'use strict';
if(window.__MDH72_MAP_LEGEND__)return;
window.__MDH72_MAP_LEGEND__=true;
const LEGEND=[
 {key:'province',label:'เขตจังหวัดมุกดาหาร',color:'#0b7a3b',width:3},
 {key:'district',label:'เขตอำเภอ',color:'#2fa65a',width:2},
 {key:'subdistrict',label:'เขตตำบล',color:'#7acb8b',width:1}
];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function makeLegend(){
 let el=document.getElementById('mdh72-map-legend');
 if(el)return true;
 const maps=[...document.querySelectorAll('.leaflet-container')];
 let map=maps.find(x=>x.offsetWidth>300&&x.offsetHeight>200)||maps[0];
 if(!map)return false;
 el=document.createElement('div');
 el.id='mdh72-map-legend';
 el.setAttribute('aria-label','สัญลักษณ์เขตการปกครอง');
 el.innerHTML='<span class="mdh72-legend-title">สัญลักษณ์</span>'+LEGEND.map(x=>`<span class="mdh72-legend-item"><i class="mdh72-legend-line" style="background:${x.color};height:${x.width}px"></i><span>${esc(x.label)}</span></span>`).join('');
 map.appendChild(el);
 const old=[...document.querySelectorAll('body *')].find(x=>x!==el&&x.textContent?.includes('เขตจังหวัดมุกดาหาร')&&x.textContent?.includes('เขตอำเภอ')&&x.textContent?.includes('เขตตำบล')&&x.children.length<5);
 if(old&&old!==el)old.remove();
 return true;
}
const css=document.createElement('style');css.id='mdh72-map-legend-css';css.textContent=`#mdh72-map-legend{position:absolute;left:10px;bottom:10px;z-index:900;display:flex;align-items:center;gap:14px;padding:8px 12px;background:rgba(6,24,39,.94);border:1px solid #285978;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.28);font:12px Arial,sans-serif;color:#fff;pointer-events:none}.mdh72-legend-title{font-weight:700;color:#ffd34e;margin-right:2px}.mdh72-legend-item{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}.mdh72-legend-line{display:inline-block;width:28px;border-radius:2px;box-shadow:0 0 0 1px rgba(255,255,255,.08)}@media(max-width:800px){#mdh72-map-legend{left:6px;right:6px;bottom:6px;gap:8px;padding:6px 8px;font-size:11px;justify-content:center}.mdh72-legend-line{width:22px}}`;document.head.appendChild(css);
function boot(){if(makeLegend())return;setTimeout(boot,500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,300),{once:true});else setTimeout(boot,300);
})();