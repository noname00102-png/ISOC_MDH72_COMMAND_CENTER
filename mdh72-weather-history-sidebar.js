'use strict';
/* MDH72 Weather History placement guard
 * Keeps the existing Weather History navigation item in the Sidebar.
 * It does not create, delete, or modify Supabase data.
 */
(() => {
  const KEY = 'weather-history';
  const LABEL = '🗂️ ประวัติสภาพอากาศจังหวัดมุกดาหาร';
  const sidebarSelectors = [
    '[data-sidebar]',
    '#sidebar',
    '.sidebar',
    'aside',
    'nav'
  ];

  const findSidebar = (doc) => {
    for (const selector of sidebarSelectors) {
      const el = doc.querySelector(selector);
      if (el) return el;
    }
    return null;
  };

  const findWeatherHistoryItem = (doc) => {
    return doc.querySelector('[data-key="weather-history"], [data-menu-key="weather-history"], [data-nav-key="weather-history"]');
  };

  const isInSidebar = (item, sidebar) => Boolean(item && sidebar && sidebar.contains(item));

  const moveToSidebar = () => {
    const doc = document;
    const sidebar = findSidebar(doc);
    const item = findWeatherHistoryItem(doc);
    if (!sidebar || !item) return false;
    if (isInSidebar(item, sidebar)) {
      const text = item.querySelector('[data-label], .label, .menu-label, span');
      if (text && !text.textContent.trim()) text.textContent = LABEL;
      return true;
    }

    const menuContainer = sidebar.querySelector('[data-menu-list], .menu-list, .sidebar-menu, ul, nav') || sidebar;
    menuContainer.appendChild(item);
    return true;
  };

  const boot = () => {
    moveToSidebar();
    const observer = new MutationObserver(() => moveToSidebar());
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('beforeunload', () => observer.disconnect(), { once: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
