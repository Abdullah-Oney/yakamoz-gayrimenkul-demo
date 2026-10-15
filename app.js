(() => {
  'use strict';
  const STORAGE_KEY = 'yakamoz-demo-requests-v1';
  const VIEWS = ['home', 'request', 'login', 'dashboard'];
  const els = (id) => document.getElementById(id);
  let currentView = 'home';
  let activeRequestId = null;
  let toastTimer = null;
  let filterState = { deal: '', type: '', rooms: '', price: '', search: '' };

  const demoRequests = [
    { id: 'demo-101', name: 'Örnek Talep · Ayşe K.', phone: '05XX XXX 14 28', deal: 'Satılık', propertyType: 'Daire', rooms: '2+1', minBudget: 3500000, maxBudget: 4500000, area: '90–120 m²', city: 'İstanbul', district: 'Esenler', neighborhood: 'Fevziçakmak', features: ['Asansör', 'Balkon'], notes: 'Mümkünse yeni binada, ulaşımı kolay ve ara katta bir daire arıyor. Taşınma için 2 ayı var.', createdAt: daysAgo(0), status: 'Yeni', isDemo: true },
    { id: 'demo-102', name: 'Örnek Talep · Murat D.', phone: '05XX XXX 62 10', deal: 'Kiralık', propertyType: 'Daire', rooms: '1+1', minBudget: 0, maxBudget: 18000, area: '60–90 m²', city: 'İstanbul', district: 'Esenler', neighborhood: 'Menderes', features: ['Asansör'], notes: 'Metroya yakın, uzun dönem kiralamaya uygun bir daire arıyor. Eşyalı olması tercih sebebi.', createdAt: daysAgo(1), status: 'Yeni', isDemo: true },
    { id: 'demo-103', name: 'Örnek Talep · Elif A.', phone: '05XX XXX 35 91', deal: 'Satılık', propertyType: 'Daire', rooms: '3+1', minBudget: 4500000, maxBudget: 6200000, area: '120–160 m²', city: 'İstanbul', district: 'Esenler', neighborhood: 'Tuna', features: ['Balkon', 'Otopark', 'Asansör'], notes: 'Aile için geniş, mümkünse otoparklı ve krediye uygun bir konut arayışında.', createdAt: daysAgo(3), status: 'İletişim kuruldu', isDemo: true },
    { id: 'demo-104', name: 'Örnek Talep · Can B.', phone: '05XX XXX 77 42', deal: 'Satılık', propertyType: 'Arsa', rooms: 'Fark etmez', minBudget: 2000000, maxBudget: 3500000, area: '160 m² üzeri', city: 'İstanbul', district: 'Esenler', neighborhood: 'Esenler ve çevresi', features: [], notes: 'Uzun vadeli yatırım amacıyla imar durumunun net olduğu arsa seçenekleriyle ilgileniyor.', createdAt: daysAgo(5), status: 'Yeni', isDemo: true },
    { id: 'demo-105', name: 'Örnek Talep · Zeynep T.', phone: '05XX XXX 04 68', deal: 'Kiralık', propertyType: 'İş yeri', rooms: 'Fark etmez', minBudget: 15000, maxBudget: 30000, area: '60–90 m²', city: 'İstanbul', district: 'Esenler', neighborhood: 'Atışalanı Caddesi', features: [], notes: 'Cadde üzerinde veya görünürlüğü yüksek bir konumda küçük işletmeye uygun yer arıyor.', createdAt: daysAgo(7), status: 'Yeni', isDemo: true }
  ];
  function daysAgo(days) { const d = new Date(); d.setDate(d.getDate() - days); d.setHours(10 + (days % 7), 20, 0, 0); return d.toISOString(); }
  function uid() { return 'req-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7); }
  function loadRequests() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) { const parsed = JSON.parse(stored); if (Array.isArray(parsed)) return parsed; }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoRequests));
    } catch (err) { console.warn('Local storage could not be read.', err); }
    return demoRequests.map((r) => ({ ...r, features: [...r.features] }));
  }
  let requests = loadRequests();
  function saveRequests() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(requests)); return true; }
    catch (err) { showToast('Tarayıcı kayıt alanı kullanılamıyor.'); return false; }
  }
  function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }
  function money(value) {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return '';
    return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(n) + ' TL';
  }
  function budgetText(r) {
    const min = Number(r.minBudget) || 0; const max = Number(r.maxBudget) || 0;
    if (min && max) return `${money(min)} – ${money(max)}`;
    if (max) return `En fazla ${money(max)}`;
    if (min) return `${money(min)} ve üzeri`;
    return 'Belirtilmedi';
  }
  function dateText(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return 'Tarih belirtilmedi';
    return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
  }
  function initials(name) {
    return String(name || '?').replace('Örnek Talep · ', '').trim().split(/\s+/).slice(0, 2).map((p) => p[0] || '').join('').replace(/[·.]/g, '').toLocaleUpperCase('tr-TR') || 'YT';
  }
  function showToast(message) {
    const toast = els('toast');
    els('toastMessage').textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 3200);
  }
  function setView(view) {
    if (!VIEWS.includes(view)) view = 'home';
    currentView = view;
    VIEWS.forEach((name) => {
      const el = els(name + 'View');
      if (el) { el.hidden = name !== view; el.classList.toggle('active', name === view); }
    });
    els('siteFooter').hidden = view === 'login' || view === 'dashboard';
    els('mobileNav').hidden = view !== 'home';
    els('topbar').hidden = view === 'dashboard';
    if (view === 'dashboard') renderDashboard();
    if (view === 'home') updateMobileNav('home');
    if (view === 'request') updateMobileNav('request');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function updateMobileNav(view) {
    document.querySelectorAll('.mobile-nav-item[data-view]').forEach((el) => el.classList.toggle('active', el.dataset.view === view));
  }
  function goToLogin() { els('loginError').textContent = ''; els('loginForm').reset(); setView('login'); }
  function goToDashboard() { setView('dashboard'); }
  function renderDashboard() {
    els('statTotal').textContent = requests.length;
    els('statSale').textContent = requests.filter((r) => r.deal === 'Satılık').length;
    els('statRent').textContent = requests.filter((r) => r.deal === 'Kiralık').length;
    const filtered = getFilteredRequests();
    els('statMatches').textContent = filterState.deal || filterState.type || filterState.rooms || filterState.price ? filtered.length : '—';
    renderRequestList(filtered);
    const hasFilter = Boolean(filterState.deal || filterState.type || filterState.rooms || filterState.price || filterState.search);
    els('activeFilterRow').hidden = !hasFilter;
    if (hasFilter) {
      const labels = [];
      if (filterState.deal) labels.push(filterState.deal);
      if (filterState.type) labels.push(filterState.type);
      if (filterState.rooms) labels.push(filterState.rooms);
      if (filterState.price) labels.push('Fiyat: ' + money(filterState.price));
      if (filterState.search) labels.push('Arama: ' + filterState.search);
      els('activeFilterText').textContent = labels.join(' · ');
    }
  }
  function getFilteredRequests() {
    let arr = [...requests];
    if (filterState.deal) arr = arr.filter((r) => r.deal === filterState.deal);
    if (filterState.type) arr = arr.filter((r) => r.propertyType === filterState.type);
    if (filterState.rooms) arr = arr.filter((r) => filterState.rooms === 'Fark etmez' ? (r.rooms === 'Fark etmez' || !r.rooms) : (r.rooms === filterState.rooms || r.rooms === 'Fark etmez'));
    if (filterState.price) {
      const price = Number(filterState.price);
      arr = arr.filter((r) => {
        const min = Number(r.minBudget) || 0; const max = Number(r.maxBudget) || 0;
        return (!min || price >= min) && (!max || price <= max);
      });
    }
    const q = filterState.search.trim().toLocaleLowerCase('tr-TR');
    if (q) arr = arr.filter((r) => [r.name, r.phone, r.propertyType, r.deal, r.district, r.neighborhood, r.notes].join(' ').toLocaleLowerCase('tr-TR').includes(q));
    const sort = els('sortRequests').value;
    arr.sort((a, b) => {
      if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === 'budgetHigh') return (Number(b.maxBudget) || 0) - (Number(a.maxBudget) || 0);
      if (sort === 'budgetLow') return (Number(a.maxBudget) || Number.MAX_SAFE_INTEGER) - (Number(b.maxBudget) || Number.MAX_SAFE_INTEGER);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return arr;
  }
  function renderRequestList(arr) {
    els('resultCount').textContent = arr.length;
    els('requestList').innerHTML = arr.map((r) => {
      const place = [r.neighborhood, r.district].filter(Boolean).join(', ') || 'Bölge belirtilmedi';
      const chips = [r.deal, r.propertyType, r.rooms && r.rooms !== 'Fark etmez' ? r.rooms : '', r.area && r.area !== 'Belirtmedi' ? r.area : '', place].filter(Boolean);
      return `<article class="request-row" data-id="${escapeHTML(r.id)}"><div class="request-main"><div class="request-avatar">${escapeHTML(initials(r.name))}</div><div class="request-content"><div class="request-name-line"><span class="request-name">${escapeHTML(r.name)}</span>${r.isDemo ? '<span class="demo-record-badge">ÖRNEK KAYIT</span>' : ''}<span class="status-badge">${escapeHTML(r.status || 'Yeni')}</span></div><div class="request-summary">${escapeHTML(place)} <span>·</span> ${escapeHTML(dateText(r.createdAt))} <span>·</span> ${escapeHTML(r.phone || 'Telefon belirtilmedi')}</div><div class="request-tags">${chips.map((c, i) => `<span class="request-tag ${i === 0 ? 'important' : ''}">${escapeHTML(c)}</span>`).join('')}</div></div></div><div class="request-meta"><div class="request-budget">${escapeHTML(budgetText(r))}<small>Talep bütçesi</small></div><div class="request-actions"><button class="icon-button" type="button" data-action="details" data-id="${escapeHTML(r.id)}" title="Talep detayını görüntüle" aria-label="Talep detayını görüntüle">↗</button><button class="icon-button" type="button" data-action="edit" data-id="${escapeHTML(r.id)}" title="Talebi düzenle" aria-label="Talebi düzenle">✎</button><button class="icon-button danger" type="button" data-action="delete" data-id="${escapeHTML(r.id)}" title="Talebi sil" aria-label="Talebi sil">×</button></div></div></article>`;
    }).join('');
    els('emptyState').hidden = arr.length !== 0;
    els('requestList').hidden = arr.length === 0;
  }
  function findRequest(id) { return requests.find((r) => r.id === id); }
  function openDetails(id) {
    const r = findRequest(id); if (!r) return;
    activeRequestId = id;
    els('detailModalTitle').textContent = r.name;
    const block = (label, value) => `<div class="detail-block"><div class="detail-label">${escapeHTML(label)}</div><div class="detail-value">${escapeHTML(value || 'Belirtilmedi')}</div></div>`;
    const features = (r.features || []).join(', ') || 'Özel tercih belirtilmedi';
    els('detailModalBody').innerHTML = `<div class="detail-grid">${block('İşlem / tür', `${r.deal} ${r.propertyType}`)}${block('Oda sayısı', r.rooms)}${block('Bütçe aralığı', budgetText(r))}${block('Büyüklük', r.area)}${block('Bölge', [r.city, r.district, r.neighborhood].filter(Boolean).join(' / '))}${block('Telefon', r.phone)}${block('Öncelikler', features)}${block('Kayıt tarihi', dateText(r.createdAt))}</div>${block('Özel notlar', r.notes)}${block('Kayıt durumu', r.status || 'Yeni')}`;
    els('detailModal').hidden = false; document.body.classList.add('modal-open');
  }
  function openEdit(id) {
    const r = findRequest(id); if (!r) return;
    activeRequestId = id;
    const form = els('editForm');
    ['name','phone','deal','propertyType','district','neighborhood','rooms','area','minBudget','maxBudget','notes'].forEach((key) => {
      const input = form.elements.namedItem(key);
      if (input) input.value = r[key] == null ? '' : r[key];
    });
    els('editModal').hidden = false; document.body.classList.add('modal-open');
  }
  function closeModals() {
    document.querySelectorAll('.modal-backdrop').forEach((m) => { m.hidden = true; });
    document.body.classList.remove('modal-open');
  }
  function deleteRequest(id) {
    const r = findRequest(id); if (!r) return;
    const name = r.name;
    if (!window.confirm(`“${name}” talebini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return;
    requests = requests.filter((item) => item.id !== id);
    saveRequests(); renderDashboard(); showToast('Talep silindi.');
  }

  document.addEventListener('click', (event) => {
    const viewTrigger = event.target.closest('[data-view]');
    if (viewTrigger) { event.preventDefault(); setView(viewTrigger.dataset.view); return; }
    const scrollTrigger = event.target.closest('[data-scroll]');
    if (scrollTrigger) {
      if (currentView !== 'home') setView('home');
      setTimeout(() => { const target = els(scrollTrigger.dataset.scroll); if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50);
      return;
    }
    const action = event.target.closest('[data-action]');
    if (action && action.dataset.id) {
      const { id } = action.dataset;
      if (action.dataset.action === 'details') openDetails(id);
      if (action.dataset.action === 'edit') openEdit(id);
      if (action.dataset.action === 'delete') deleteRequest(id);
      return;
    }
    if (event.target.closest('[data-close-modal]')) closeModals();
    if (event.target.classList.contains('modal-backdrop')) closeModals();
  });
  els('openLoginTop').addEventListener('click', goToLogin);
  els('openLoginFooter').addEventListener('click', goToLogin);
  els('fillDemoLogin').addEventListener('click', () => { els('loginForm').elements.username.value = 'yakamoz'; els('loginForm').elements.secret.value = 'ruhi123'; els('loginError').textContent = ''; });
  els('loginForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const username = els('loginForm').elements.username.value.trim().toLocaleLowerCase('tr-TR');
    const secret = els('loginForm').elements.secret.value;
    if (username === 'yakamoz' && secret === 'ruhi123') { filterState = { deal: '', type: '', rooms: '', price: '', search: '' }; ['filterDeal','filterType','filterRooms','filterPrice','searchRequests'].forEach((id) => { const el = els(id); if (el) el.value = ''; }); els('sortRequests').value = 'newest'; goToDashboard(); }
    else { els('loginError').textContent = 'Giriş bilgileri eşleşmedi. Demo bilgilerini kontrol edin.'; }
  });
  els('logoutButton').addEventListener('click', () => { setView('home'); showToast('Yönetim panelinden çıkış yapıldı.'); });

  els('requestForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const fd = new FormData(form);
    const minRaw = fd.get('minBudget'); const maxRaw = fd.get('maxBudget');
    if (minRaw && maxRaw && Number(minRaw) > Number(maxRaw)) { showToast('En az bütçe, en fazla bütçeden büyük olamaz.'); form.elements.minBudget.focus(); return; }
    const record = {
      id: uid(), name: String(fd.get('name')).trim(), phone: String(fd.get('phone')).trim(), deal: String(fd.get('deal')), propertyType: String(fd.get('propertyType')), rooms: String(fd.get('rooms') || 'Fark etmez'), minBudget: Number(minRaw) || 0, maxBudget: Number(maxRaw) || 0,
      area: String(fd.get('area') || 'Belirtmedi'), city: String(fd.get('city') || 'İstanbul'), district: String(fd.get('district') || '').trim(), neighborhood: String(fd.get('neighborhood') || '').trim(), features: fd.getAll('features').map(String), notes: String(fd.get('notes') || '').trim(), createdAt: new Date().toISOString(), status: 'Yeni', isDemo: false
    };
    requests.unshift(record);
    if (saveRequests()) { form.reset(); form.elements.city.value = 'İstanbul'; form.elements.district.value = 'Esenler'; showToast('Talebiniz alındı. Teşekkür ederiz!'); setView('home'); }
  });

  function applyCurrentFilterValues() {
    filterState = { deal: els('filterDeal').value, type: els('filterType').value, rooms: els('filterRooms').value, price: els('filterPrice').value, search: els('searchRequests').value.trim() };
    renderDashboard();
  }
  els('applyFilters').addEventListener('click', applyCurrentFilterValues);
  ['filterDeal','filterType','filterRooms','filterPrice'].forEach((id) => els(id).addEventListener('change', applyCurrentFilterValues));
  els('filterPrice').addEventListener('keydown', (event) => { if (event.key === 'Enter') applyCurrentFilterValues(); });
  els('searchRequests').addEventListener('input', () => { filterState.search = els('searchRequests').value.trim(); renderDashboard(); });
  els('sortRequests').addEventListener('change', renderDashboard);
  function clearFilters() {
    filterState = { deal: '', type: '', rooms: '', price: '', search: '' };
    ['filterDeal','filterType','filterRooms','filterPrice','searchRequests'].forEach((id) => { els(id).value = ''; });
    renderDashboard();
  }
  els('clearFilters').addEventListener('click', clearFilters);
  els('emptyClear').addEventListener('click', clearFilters);

  els('detailEditButton').addEventListener('click', () => { const id = activeRequestId; closeModals(); if (id) openEdit(id); });
  els('editForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const r = findRequest(activeRequestId); if (!r) return;
    const fd = new FormData(event.currentTarget);
    const minRaw = fd.get('minBudget'); const maxRaw = fd.get('maxBudget');
    if (minRaw && maxRaw && Number(minRaw) > Number(maxRaw)) { showToast('En az bütçe, en fazla bütçeden büyük olamaz.'); return; }
    ['name','phone','deal','propertyType','district','neighborhood','rooms','area','notes'].forEach((key) => { r[key] = String(fd.get(key) || '').trim(); });
    r.minBudget = Number(minRaw) || 0; r.maxBudget = Number(maxRaw) || 0;
    saveRequests(); closeModals(); renderDashboard(); showToast('Talep bilgileri güncellendi.');
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModals();
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && currentView === 'dashboard') { event.preventDefault(); els('searchRequests').focus(); }
  });
  els('year').textContent = new Date().getFullYear();
  setView('home');
})();
