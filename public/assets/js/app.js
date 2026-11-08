(function () {
  'use strict';
  /* Le contenu modifiable (produits, prix, textes, coordonnées) vient de content.json,
     écrit par la page /admin.html. S'il est absent, on utilise les valeurs de products.js. */
  fetch('content.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .catch(function () { return null; })
    .then(function (c) { start(c || {}); });

  function start(content) {
  var S = Object.assign({}, window.SITE, content.settings || {});
  var P = (content.products || window.PRODUCTS).filter(function (p) { return p.active; }).map(function (p) { p.short = p.short || p.name; p.icon = p.icon || 'shopping_cart'; return p; });
  var KEY = 'seugnbi_cart_v1';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fmt = function (n) { return n.toLocaleString('fr-FR').replace(/ | /g, ' ') + ' ' + S.currency; };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var wa = function (text) { return 'https://wa.me/' + S.whatsapp + '?text=' + encodeURIComponent(text); };

  /* ---------- Panier ---------- */
  var cart = {};
  try { cart = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { cart = {}; }
  Object.keys(cart).forEach(function (id) { if (!P.some(function (p) { return p.id === id; })) delete cart[id]; });
  var save = function () { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} render(); };
  var lines = function () { return P.filter(function (p) { return cart[p.id] > 0; }).map(function (p) { return { p: p, q: cart[p.id] }; }); };
  var total = function () { return lines().reduce(function (t, l) { return t + l.p.price * l.q; }, 0); };
  var count = function () { return lines().reduce(function (t, l) { return t + l.q; }, 0); };

  function add(id, q) { cart[id] = Math.min(99, (cart[id] || 0) + q); save(); }
  function setQty(id, q) { if (q <= 0) delete cart[id]; else cart[id] = Math.min(99, q); save(); }

  function toast(msg) {
    var t = $('[data-toast]'); if (!t) return;
    t.textContent = msg; t.classList.remove('hidden');
    clearTimeout(toast.h); toast.h = setTimeout(function () { t.classList.add('hidden'); }, 3000);
  }

  function summaryText() {
    return lines().map(function (l) { return '• ' + l.q + ' x ' + l.p.short + ' = ' + fmt(l.p.price * l.q); }).join('\n');
  }

  function lineHTML(l, compact) {
    return '<div class="flex gap-3 items-center bg-surface-container-low rounded-xl p-2">' +
      '<img src="' + l.p.image + '" alt="" class="w-16 h-16 object-cover rounded-lg">' +
      '<div class="flex-1 min-w-0"><p class="font-semibold truncate">' + esc(l.p.short) + '</p>' +
      '<p class="text-primary text-label-md">' + fmt(l.p.price * l.q) + '</p></div>' +
      '<div class="flex items-center bg-surface-container-high rounded-lg">' +
      '<button type="button" class="w-8 h-8 hover:text-primary" data-dec="' + l.p.id + '" aria-label="Diminuer">−</button>' +
      '<span class="w-6 text-center font-bold text-primary">' + l.q + '</span>' +
      '<button type="button" class="w-8 h-8 hover:text-primary" data-inc="' + l.p.id + '" aria-label="Augmenter">+</button></div>' +
      '</div>';
  }

  function render() {
    var n = count();
    $$('[data-cart-count]').forEach(function (e) { e.textContent = n; });
    var empty = '<p class="text-on-surface-variant text-center py-space-lg">Votre panier est vide.<br><a class="text-primary underline" href="produits.html">Voir nos produits</a></p>';
    var html = lines().map(function (l) { return lineHTML(l); }).join('') || empty;
    $$('[data-cart-items], [data-checkout-items]').forEach(function (e) { e.innerHTML = html; });
    $$('[data-cart-total], [data-checkout-total]').forEach(function (e) { e.textContent = fmt(total()); });
    var btn = $('[data-checkout-submit]'); if (btn) btn.disabled = n === 0;
    var floatBtn = $('[data-whatsapp-float]');
    if (floatBtn) floatBtn.href = n ? wa('Bonjour Café Touba SEUGN BI,\nJe souhaite commander :\n' + summaryText() + '\nTotal : ' + fmt(total())) : wa('Bonjour Café Touba SEUGN BI, je souhaite commander du Café Touba.');
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('button, a'); if (!t) return;
    if (t.dataset.inc) setQty(t.dataset.inc, (cart[t.dataset.inc] || 0) + 1);
    else if (t.dataset.dec) setQty(t.dataset.dec, (cart[t.dataset.dec] || 0) - 1);
    else if (t.dataset.add) {
      var card = t.closest('[data-product]'), q = card ? parseInt($('[data-qty]', card).textContent, 10) || 1 : 1;
      add(t.dataset.add, q);
      var p = P.filter(function (x) { return x.id === t.dataset.add; })[0];
      toast(q + ' x ' + p.short + ' ajouté au panier');
    }
    else if (t.dataset.pq) {
      var el = $('[data-qty]', t.closest('[data-product]')), v = Math.max(1, Math.min(99, (parseInt(el.textContent, 10) || 1) + parseInt(t.dataset.pq, 10)));
      el.textContent = v;
    }
    else if (t.hasAttribute('data-cart-open')) openCart(true);
    else if (t.hasAttribute('data-cart-close')) openCart(false);
    else if (t.hasAttribute('data-menu-toggle')) {
      var m = $('[data-mobile-menu]'); var open = m.classList.toggle('hidden') === false;
      t.setAttribute('aria-expanded', open);
      $('.material-symbols-outlined', t).textContent = open ? 'close' : 'menu';
    }
  });
  var overlay = $('[data-cart-overlay]'), drawer = $('[data-cart-drawer]');
  function openCart(o) {
    if (!drawer) return;
    drawer.classList.toggle('translate-x-full', !o);
    overlay.classList.toggle('hidden', !o);
    document.body.style.overflow = o ? 'hidden' : '';
  }
  if (overlay) overlay.addEventListener('click', function () { openCart(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') openCart(false); });

  /* ---------- Cartes produit ---------- */
  function productCard(p) {
    var disc = p.oldPrice ? '<span class="text-label-sm text-outline line-through block">' + fmt(p.oldPrice) + '</span>' : '';
    return '<article data-product class="relative flex flex-col rounded-2xl bg-surface-container border border-primary-container/20 p-space-md ' + (p.featured ? 'shadow-xl' : 'shadow-md') + ' hover:bg-surface-container-high transition-colors">' +
      (p.badge ? '<span class="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-label-sm uppercase px-3 py-0.5 rounded-full font-bold shadow-md whitespace-nowrap">' + esc(p.badge) + '</span>' : '') +
      '<div class="relative w-full h-56 rounded-lg bg-surface-container-lowest overflow-hidden mb-space-sm">' +
      '<img loading="lazy" src="' + p.image + '" alt="' + esc(p.name) + '" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">' +
      '<span class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-surface-container-high/95 text-primary text-label-sm font-bold">' + esc(p.format) + '</span></div>' +
      '<span class="text-label-sm text-on-surface-variant uppercase tracking-wider">' + esc(p.tag) + '</span>' +
      '<h3 class="text-title-md font-bold mt-1 font-sans">' + esc(p.name) + '</h3>' +
      '<p class="text-on-surface-variant mt-1 flex-grow">' + esc(p.desc) + '</p>' +
      '<div class="my-space-sm flex items-end justify-between"><div><span class="text-headline-sm font-display text-primary font-bold">' + fmt(p.price) + '</span>' + disc + '</div>' +
      '<div class="flex items-center bg-surface-container-high rounded px-2 py-1 gap-2">' +
      '<button type="button" class="px-1 font-bold hover:text-primary" data-pq="-1" aria-label="Diminuer la quantité">−</button>' +
      '<span data-qty class="font-bold text-primary min-w-[1ch] text-center">1</span>' +
      '<button type="button" class="px-1 font-bold hover:text-primary" data-pq="1" aria-label="Augmenter la quantité">+</button></div></div>' +
      '<button type="button" data-add="' + p.id + '" class="btn ' + (p.featured ? 'btn-primary' : 'bg-surface-container-highest hover:bg-primary hover:text-on-primary') + ' w-full !py-2.5"><span class="material-symbols-outlined text-[18px]">' + p.icon + '</span>Ajouter au panier</button>' +
      '</article>';
  }
  $$('[data-products]').forEach(function (c) {
    var limit = parseInt(c.dataset.products, 10) || P.length;
    c.innerHTML = P.slice(0, limit).map(productCard).join('');
  });

  /* ---------- Formulaire de commande ---------- */
  var form = $('[data-order-form]');
  if (form) {
    var sel = $('[name=quartier]', form);
    sel.innerHTML = S.quartiers.map(function (q) { return '<option>' + esc(q) + '</option>'; }).join('');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!count()) { toast('Ajoutez au moins un produit à votre panier.'); return; }
      var f = new FormData(form);
      var msg = 'Bonjour Café Touba SEUGN BI,\nNouvelle commande depuis le site :\n' + summaryText() +
        '\nTotal : ' + fmt(total()) + ' (hors frais de livraison éventuels)' +
        '\n\n• Nom : ' + f.get('nom').trim() + '\n• Téléphone : ' + f.get('tel').trim() +
        '\n• Quartier : ' + f.get('quartier') + '\n• Adresse / repère : ' + (f.get('adresse') || '').trim() +
        (f.get('note') ? '\n• Remarque : ' + f.get('note').trim() : '') +
        '\n• Paiement : à la livraison (Wave, Orange Money ou espèces)\nMerci de confirmer.';
      var fb = $('[data-form-feedback]');
      if (fb) { fb.textContent = 'Ouverture de WhatsApp pour envoyer votre commande…'; fb.classList.remove('hidden'); }
      window.open(wa(msg), '_blank', 'noopener');
    });
  }

  /* ---------- Formulaire contact ---------- */
  var cf = $('[data-contact-form]');
  if (cf) cf.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = new FormData(cf);
    window.open(wa('Bonjour SEUGN BI,\n' + f.get('message').trim() + '\n\n— ' + f.get('nom').trim() + ' (' + f.get('tel').trim() + ')'), '_blank', 'noopener');
  });

  /* ---------- Liens WhatsApp statiques ---------- */
  $$('[data-wa]').forEach(function (a) { a.href = wa(a.dataset.wa); a.target = '_blank'; a.rel = 'noopener'; });

  /* ---------- Contenu éditable ---------- */
  var T = content.texts || {};
  $$('[data-text]').forEach(function (el) { var v = T[el.dataset.text]; if (typeof v === 'string' && v.trim()) el.textContent = v; });
  $$('[data-price]').forEach(function (el) { var p = P.filter(function (x) { return x.id === el.dataset.price; })[0]; if (p) el.textContent = fmt(p.price); });
  $$('[data-oldprice]').forEach(function (el) { var p = P.filter(function (x) { return x.id === el.dataset.oldprice; })[0]; if (p && p.oldPrice) el.textContent = fmt(p.oldPrice); else if (p) el.remove(); });
  if (content.settings && (content.settings.whatsapp || content.settings.phoneDisplay)) {
    var DEF = window.SITE;
    $$('a[href^="tel:"]').forEach(function (a) { a.href = 'tel:+' + S.whatsapp; });
    $$('a[href^="https://wa.me/"]').forEach(function (a) { a.href = a.href.replace(/wa\.me\/\d+/, 'wa.me/' + S.whatsapp); });
    if (S.phoneDisplay !== DEF.phoneDisplay) {
      var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), n, list = [];
      while ((n = w.nextNode())) if (n.nodeValue.indexOf(DEF.phoneDisplay) > -1) list.push(n);
      list.forEach(function (n) { n.nodeValue = n.nodeValue.split(DEF.phoneDisplay).join(S.phoneDisplay); });
    }
  }

  render();
  }
})();
