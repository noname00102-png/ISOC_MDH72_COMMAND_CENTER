(()=>{
  'use strict';
  if(window.__MDH72_PRODUCTION_FIXES__) return;
  window.__MDH72_PRODUCTION_FIXES__=true;
  const ids=['cats','tq','tl','tt','nt','ak','at','na','rt','rf','rr','rl','rp','pr','report','ht','sq','go','st','xk','xd','ok','ub'];
  function bindNamedElements(){for(const id of ids){const el=document.getElementById(id);if(el&&!Object.prototype.hasOwnProperty.call(window,id)){try{Object.defineProperty(window,id,{configurable:true,get:()=>document.getElementById(id)});}catch(_){}}}}
  function openWeatherHistory(){bindNamedElements();const sels=['[data-key="weather-history"]','[data-menu-key="weather-history"]','[data-nav-key="weather-history"]','button'];for(const sel of sels){const b=[...document.querySelectorAll(sel)].find(x=>String(x.textContent||'').includes('ประวัติสภาพอากาศจังหวัดมุกดาหาร'));if(b){b.click();return true}}return false}
  document.addEventListener('click',e=>{const b=e.target.closest?.('#mdh72Side button[data-v="w"]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();setTimeout(openWeatherHistory,0)},true);
  document.addEventListener('click',e=>{const b=e.target.closest?.('#mdh72Side button[data-v="m"]');if(!b)return;setTimeout(()=>window.dispatchEvent(new CustomEvent('mdh72:open-map')),0)},true);
  function boot(){bindNamedElements();const observer=new MutationObserver(bindNamedElements);observer.observe(document.body,{childList:true,subtree:true});window.addEventListener('beforeunload',()=>observer.disconnect(),{once:true})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
