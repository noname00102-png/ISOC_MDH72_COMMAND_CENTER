/* ISOC MDH72 — 5D Security Threat Framework data bridge
 * Reads ONLY the 5D framework tables from Supabase.
 * Does not modify the existing threat taxonomy or existing dashboard data.
 */
(function () {
  'use strict';

  const SUPABASE_URL = 'https://riuebseoczwwifxezcwj.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_G6QyDB6Ux0Rd9yzbuQCCoQ_mkyu7wuO';
  const iframe = document.getElementById('mdh72-app');

  async function readTable(table) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Accept: 'application/json'
      },
      cache: 'no-store'
    });
    if (!res.ok) throw new Error(`${table}: HTTP ${res.status}`);
    return res.json();
  }

  function injectStyles(doc) {
    if (doc.getElementById('sx-5d-style')) return;
    const style = doc.createElement('style');
    style.id = 'sx-5d-style';
    style.textContent = `
      #sx-5d-menu{margin:10px 12px;border:1px solid rgba(120,180,220,.22);border-radius:12px;background:rgba(7,23,38,.72);overflow:hidden}
      #sx-5d-menu .sx-5d-main{width:100%;border:0;background:transparent;color:#eaf7ff;text-align:left;padding:12px 14px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:8px}
      #sx-5d-menu .sx-5d-main:hover{background:rgba(70,150,210,.12)}
      #sx-5d-list{display:none;padding:0 8px 8px}
      #sx-5d-list.open{display:block}
      .sx-5d-domain{border-top:1px solid rgba(120,180,220,.12)}
      .sx-5d-domain>button{width:100%;border:0;background:transparent;color:#dceeff;text-align:left;padding:10px 8px;font-weight:700;cursor:pointer}
      .sx-5d-items{display:none;padding:0 8px 7px}
      .sx-5d-items.open{display:block}
      .sx-5d-item{display:block;width:100%;border:0;background:transparent;color:#a9c7dc;text-align:left;padding:7px 8px;font-size:12px;cursor:pointer}
      .sx-5d-item:hover{background:rgba(70,150,210,.10);color:#fff}
      #sx-5d-status{padding:7px 12px;font-size:11px;color:#82a7bc}
    `;
    doc.head.appendChild(style);
  }

  function findMount(doc) {
    return doc.querySelector('aside') || doc.querySelector('[class*="sidebar" i]') || doc.querySelector('nav') || doc.body;
  }

  function render(doc, domains, items) {
    const old = doc.getElementById('sx-5d-menu');
    if (old) old.remove();
    injectStyles(doc);

    const menu = doc.createElement('section');
    menu.id = 'sx-5d-menu';
    menu.innerHTML = '<button class="sx-5d-main" type="button" aria-expanded="false">🛡️ ภัยคุกคามความมั่นคง 5 ด้าน</button><div id="sx-5d-list"></div><div id="sx-5d-status">เชื่อมต่อ Supabase สำเร็จ • 5 ด้าน / 38 เมนูย่อย</div>';
    const list = menu.querySelector('#sx-5d-list');
    const byDomain = new Map(domains.map(d => [d.framework_code, []]));
    items.forEach(i => { if (byDomain.has(i.framework_code)) byDomain.get(i.framework_code).push(i); });

    domains.sort((a,b)=>a.sort_order-b.sort_order).forEach(domain => {
      const wrap = doc.createElement('div'); wrap.className='sx-5d-domain';
      const btn = doc.createElement('button'); btn.type='button';
      btn.textContent = `${String(domain.sort_order).padStart(2,'0')} · ${domain.framework_name}`;
      const sub = doc.createElement('div'); sub.className='sx-5d-items';
      (byDomain.get(domain.framework_code)||[]).sort((a,b)=>a.sort_order-b.sort_order).forEach(item=>{
        const ib = doc.createElement('button'); ib.type='button'; ib.className='sx-5d-item'; ib.textContent=`${String(item.sort_order).padStart(2,'0')} · ${item.item_name}`;
        ib.addEventListener('click',()=>{
          doc.dispatchEvent(new CustomEvent('isoc:5d-select',{detail:{domain,item}}));
        });
        sub.appendChild(ib);
      });
      btn.addEventListener('click',()=>{ sub.classList.toggle('open'); });
      wrap.append(btn,sub); list.appendChild(wrap);
    });

    menu.querySelector('.sx-5d-main').addEventListener('click', e=>{
      const open=list.classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded',String(open));
    });
    findMount(doc).prepend(menu);
  }

  async function start() {
    if (!iframe) return;
    iframe.addEventListener('load', async function once() {
      try {
        const doc = iframe.contentDocument;
        if (!doc) throw new Error('iframe document unavailable');
        const [domains, items] = await Promise.all([readTable('security_threat_5d_framework'), readTable('security_threat_5d_items')]);
        if (domains.length !== 5 || items.length !== 38) throw new Error(`Unexpected 5D data count: ${domains.length}/${items.length}`);
        render(doc, domains, items);
      } catch (err) {
        console.error('[ISOC MDH72 5D]', err);
      }
    }, { once:true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
