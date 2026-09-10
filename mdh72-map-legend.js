(()=>{
'use strict';
if(window.__MDH72_MAP_LEGEND__)return;
window.__MDH72_MAP_LEGEND__=true;
const LEGEND=[
 {label:'เขตจังหวัดมุกดาหาร',color:'#0b7a3b',width:3},
 {label:'เขตอำเภอ',color:'#2fa65a',width:2},
 {label:'เขตตำบล',color:'#7acb8b',width:1}
];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function makeLegend(){
 let el=document.getElementById('mdh72-map-legend');
 if(el)return true;
 const maps=[...document.querySelectorAll('.leaflet-container')];
 const map=maps.find(x=>x.offsetWidth>300&&x.offsetHeight>200)||maps[0];
 if(!map||!map.parentElement)return false;
 const old=[...document.querySelectorAll('body *')].find(x=>x!==el&&x.textContent?.includes('เขตจังหวัดมุกดาหาร')&&x.textContent?.includes('เขตอำเภอ')&&x.textContent?.includes('เขตตำบล')&&x.children.length<5);
 if(old)old.remove();
 el=document.createElement('div');
 el.id='mdh72-map-legend';
 el.setAttribute('aria-label','สัญลักษณ์เขตการปกครอง');
 el.innerHTML='<span class="mdh72-legend-title">สัญลักษณ์</span>'+LEGEND.map(x=>`<span class="mdh72-legend-item"><i class="mdh72-legend-line" style="background:${x.color};height:${x.width}px"></i><span>${esc(x.label)}</span></span>`).join('');
 map.parentElement.insertBefore(el,map.nextSibling);
 return true;
}
const css=document.createElement('style');css.id='mdh72-map-legend-css';css.textContent=`#mdh72-map-legend{width:100%;min-height:28px;display:flex;align-items:center;justify-content:center;gap:18px;padding:6px 10px;background:#061827;color:#fff;border:1px solid #285978;border-radius:0 0 8px 8px;box-sizing:border-box;font:12px Arial,sans-serif}.mdh72-legend-title{font-weight:700;color:#ffd34e}.mdh72-legend-item{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}.mdh72-legend-line{display:inline-block;width:28px;border-radius:2px;flex:none}@media(max-width:800px){#mdh72-map-legend{gap:9px;padding:5px 6px;font-size:10px}.mdh72-legend-line{width:20px}}`;document.head.appendChild(css);
function boot(){if(makeLegend())return;setTimeout(boot,500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,300),{once:true});else setTimeout(boot,300);
})();