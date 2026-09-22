(function () {
  'use strict';

  const STYLE_ID = 'mdh72-threat-popup-compact-style';
  const ENHANCED = 'data-mdh72-popup-compact';

  function installStyle(doc) {
    if (!doc || doc.getElementById(STYLE_ID)) return;
    const style = doc.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .leaflet-popup-content-wrapper {
        max-width: min(390px, calc(100vw - 32px)) !important;
        border-radius: 10px !important;
      }
      .leaflet-popup-content {
        width: auto !important;
        max-width: min(360px, calc(100vw - 56px)) !important;
        margin: 10px 12px !important;
      }
      .mdh72-popup-body {
        position: relative;
        max-height: 210px;
        overflow: hidden;
      }
      .mdh72-popup-body.is-expanded {
        max-height: none;
        overflow: visible;
      }
      .mdh72-popup-fade {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 52px;
        pointer-events: none;
        background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,.98));
      }
      .mdh72-popup-body.is-expanded .mdh72-popup-fade { display: none; }
      .mdh72-popup-toggle {
        display: block;
        width: 100%;
        margin-top: 7px;
        padding: 7px 10px;
        border: 1px solid #2b5870;
        border-radius: 7px;
        background: #071f31;
        color: #eaf7ff;
        font-weight: 800;
        font-size: 12px;
        line-height: 1.2;
        cursor: pointer;
      }
      .mdh72-popup-toggle:hover { filter: brightness(1.12); }
      @media (max-width: 600px) {
        .leaflet-popup-content-wrapper { max-width: calc(100vw - 24px) !important; }
        .leaflet-popup-content { max-width: calc(100vw - 48px) !important; }
        .mdh72-popup-body { max-height: 180px; }
      }
    `;
    (doc.head || doc.documentElement).appendChild(style);
  }

  function enhancePopup(popup) {
    if (!popup || popup.getAttribute(ENHANCED) === '1') return;
    const content = popup.querySelector('.leaflet-popup-content');
    if (!content) return;
    const textLength = (content.textContent || '').trim().length;
    if (textLength < 260) return;

    const body = content.ownerDocument.createElement('div');
    body.className = 'mdh72-popup-body';
    while (content.firstChild) body.appendChild(content.firstChild);
    content.appendChild(body);

    const fade = content.ownerDocument.createElement('div');
    fade.className = 'mdh72-popup-fade';
    body.appendChild(fade);

    const button = content.ownerDocument.createElement('button');
    button.type = 'button';
    button.className = 'mdh72-popup-toggle';
    button.textContent = 'ดูรายละเอียดทั้งหมด ↓';
    button.addEventListener('click', function () {
      const expanded = body.classList.toggle('is-expanded');
      button.textContent = expanded ? 'ย่อรายละเอียด ↑' : 'ดูรายละเอียดทั้งหมด ↓';
    });
    content.appendChild(button);
    popup.setAttribute(ENHANCED, '1');
  }

  function scan(doc) {
    if (!doc || !doc.querySelectorAll) return;
    installStyle(doc);
    doc.querySelectorAll('.leaflet-popup').forEach(enhancePopup);
  }

  function install(doc) {
    if (!doc || !doc.body) return;
    installStyle(doc);
    scan(doc);
    const observer = new MutationObserver(function () { scan(doc); });
    observer.observe(doc.body, { childList: true, subtree: true });
  }

  function start() {
    const frame = document.getElementById('mdh72-app');
    if (!frame) return;
    frame.addEventListener('load', function () {
      try { install(frame.contentDocument); }
      catch (error) { console.error('[MDH72 POPUP]', error); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
