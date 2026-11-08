(function () {
  'use strict';
  var DRAFT = 'seugnbi_admin_draft_v1', GH = 'seugnbi_admin_gh_v1';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var LABELS = {
    hero_tagline: "Accroche (au-dessus du titre)", hero_title: 'Titre principal', hero_quote: "Citation d'accueil", hero_sub: "Texte sous la citation",
    savoir_title: 'Titre « savoir-faire »', savoir_intro: 'Introduction « savoir-faire »', banner_quote: 'Grande citation',
    boutique_title: 'Titre de la boutique', boutique_intro: 'Introduction de la boutique', gallery_title: 'Titre « moments de plaisir »', gallery_intro: 'Introduction « moments de plaisir »',
    closing_tagline: 'Signature (bas de page)', closing_quote: 'Slogan (bas de page)', histoire_p1: 'Notre histoire — paragraphe 1', histoire_p2: 'Notre histoire — paragraphe 2',
    djar_intro: 'Introduction sur le Djar', contact_intro: 'Introduction de la page Contact', produits_intro: 'Introduction de la page Produits', footer_about: 'Texte du pied de page',
  };
  var PAGES = { Accueil: 'Page d\'accueil', histoire: 'Notre histoire', djar: 'Le Djar', contact: 'Contact', produits: 'Produits' };

  var C = null, DEFAULTS = {}, tab = 'produits', dirty = false, open = {};
  var gh = {}; try { gh = JSON.parse(localStorage.getItem(GH)) || {}; } catch (e) {}
  if (!gh.prefix && gh.prefix !== '') gh.prefix = 'public/';
  if (!gh.branch) gh.branch = 'main';

  /* ---------- chargement ---------- */
  function load() {
    return Promise.all([
      fetch('content.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch('assets/defaults.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; }),
    ]).then(function (res) {
      DEFAULTS = res[1];
      var base = res[0] || { settings: {}, texts: {}, products: JSON.parse(JSON.stringify(window.PRODUCTS)) };
      base.settings = Object.assign({ whatsapp: window.SITE.whatsapp, phoneDisplay: window.SITE.phoneDisplay }, base.settings);
      base.texts = base.texts || {};
      var draft = null; try { draft = JSON.parse(localStorage.getItem(DRAFT)); } catch (e) {}
      if (draft) { C = draft; dirty = true; notify('Un brouillon non publié a été retrouvé sur cet ordinateur.', 'info'); }
      else C = base;
      render();
    });
  }
  function touch() { dirty = true; try { localStorage.setItem(DRAFT, JSON.stringify(C)); } catch (e) { notify("Mémoire du navigateur pleine (images trop lourdes ?). Publiez ou téléchargez avant de continuer.", 'err'); } $('#dirty').classList.remove('hidden'); }

  function notify(text, kind) {
    var m = $('#msg'); m.textContent = text; m.classList.remove('hidden');
    m.className = 'mb-space-md p-space-sm rounded-xl border text-body-md ' + (kind === 'err' ? 'border-error text-error bg-error-container/20' : kind === 'ok' ? 'border-primary text-primary bg-primary/10' : 'border-outline-variant text-on-surface-variant bg-surface-container');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- onglets ---------- */
  var TABS = [['produits', 'Produits', 'local_cafe'], ['textes', 'Textes', 'edit_note'], ['contact', 'Coordonnées', 'call'], ['publication', 'Publication', 'cloud_upload']];
  function render() {
    $('#tabs').innerHTML = TABS.map(function (t) {
      return '<button type="button" data-tab="' + t[0] + '" class="flex items-center gap-1 px-4 py-3 text-label-md uppercase tracking-wider border-b-2 whitespace-nowrap ' + (tab === t[0] ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface') + '"><span class="material-symbols-outlined text-[18px]">' + t[2] + '</span>' + t[1] + '</button>';
    }).join('');
    $('#dirty').classList.toggle('hidden', !dirty);
    $('#view').innerHTML = ({ produits: viewProducts, textes: viewTexts, contact: viewContact, publication: viewPublication })[tab]();
  }

  /* ---------- produits ---------- */
  function viewProducts() {
    var h = '<div class="flex items-center justify-between mb-space-md"><div><h1 class="font-display text-headline-md text-primary">Produits</h1><p class="text-on-surface-variant">Ajoutez, modifiez ou masquez vos produits. Les prix sont en FCFA.</p></div><button type="button" data-act="add" class="btn btn-primary !py-2"><span class="material-symbols-outlined text-[18px]">add</span>Nouveau produit</button></div><div class="flex flex-col gap-space-sm">';
    C.products.forEach(function (p, i) {
      var o = open[p.id];
      h += '<section class="card ' + (p.active ? '' : 'opacity-70') + '"><div class="flex items-center gap-space-sm p-space-sm">' +
        '<img src="' + esc(p.image) + '" alt="" class="w-16 h-16 rounded-lg object-cover bg-surface-container-lowest">' +
        '<div class="flex-1 min-w-0"><div class="font-semibold truncate">' + esc(p.name || 'Sans nom') + '</div><div class="text-primary">' + (Number(p.price) || 0).toLocaleString('fr-FR') + ' FCFA' + (p.active ? '' : ' <span class="text-on-surface-variant">— masqué</span>') + '</div></div>' +
        '<div class="flex items-center gap-1">' +
        '<button type="button" data-act="up" data-i="' + i + '" class="w-9 h-9 rounded hover:bg-surface-container-high" aria-label="Monter"' + (i === 0 ? ' disabled' : '') + '><span class="material-symbols-outlined">arrow_upward</span></button>' +
        '<button type="button" data-act="down" data-i="' + i + '" class="w-9 h-9 rounded hover:bg-surface-container-high" aria-label="Descendre"' + (i === C.products.length - 1 ? ' disabled' : '') + '><span class="material-symbols-outlined">arrow_downward</span></button>' +
        '<button type="button" data-act="toggle" data-i="' + i + '" class="btn btn-secondary !py-1.5 !px-3">' + (o ? 'Fermer' : 'Modifier') + '</button></div></div>';
      if (o) {
        h += '<div class="p-space-sm pt-0 grid grid-cols-1 sm:grid-cols-2 gap-space-sm border-t border-outline-variant/30 mt-1">' +
          fld(i, 'name', 'Nom du produit', p.name, 'text', 'sm:col-span-2') +
          fld(i, 'price', 'Prix (FCFA)', p.price, 'number') +
          fld(i, 'oldPrice', 'Ancien prix barré (facultatif)', p.oldPrice || '', 'number') +
          fld(i, 'format', 'Format (ex : 1 Kilogramme)', p.format) +
          fld(i, 'tag', 'Petite accroche (ex : Format découverte)', p.tag) +
          fld(i, 'badge', 'Badge (facultatif, ex : Meilleure vente)', p.badge, 'text', 'sm:col-span-2') +
          '<div class="sm:col-span-2"><label class="label">Description</label><textarea class="input" rows="3" data-f="desc" data-i="' + i + '">' + esc(p.desc) + '</textarea></div>' +
          '<div class="sm:col-span-2"><label class="label">Photo</label><div class="flex items-center gap-space-sm"><img src="' + esc(p.image) + '" alt="" class="w-24 h-24 rounded-lg object-cover bg-surface-container-lowest"><label class="btn btn-secondary !py-2 cursor-pointer"><span class="material-symbols-outlined text-[18px]">image</span>Choisir une photo<input type="file" accept="image/*" class="hidden" data-photo="' + i + '"></label></div></div>' +
          '<label class="flex items-center gap-2"><input type="checkbox" data-f="active" data-i="' + i + '"' + (p.active ? ' checked' : '') + '> Afficher sur le site</label>' +
          '<label class="flex items-center gap-2"><input type="checkbox" data-f="featured" data-i="' + i + '"' + (p.featured ? ' checked' : '') + '> Mettre en avant</label>' +
          '<div class="sm:col-span-2 text-right"><button type="button" data-act="del" data-i="' + i + '" class="text-error hover:underline text-label-md uppercase"><span class="material-symbols-outlined text-[16px] align-middle">delete</span> Supprimer ce produit</button></div></div>';
      }
      h += '</section>';
    });
    return h + '</div>';
  }
  function fld(i, key, label, val, type, cls) {
    return '<div class="' + (cls || '') + '"><label class="label">' + label + '</label><input class="input" type="' + (type || 'text') + '"' + (type === 'number' ? ' min="0" step="50" inputmode="numeric"' : '') + ' data-f="' + key + '" data-i="' + i + '" value="' + esc(val) + '"></div>';
  }

  /* ---------- textes ---------- */
  function viewTexts() {
    var groups = {};
    Object.keys(DEFAULTS).forEach(function (k) { (groups[DEFAULTS[k].page] = groups[DEFAULTS[k].page] || []).push(k); });
    var h = '<h1 class="font-display text-headline-md text-primary">Textes du site</h1><p class="text-on-surface-variant mb-space-md">Modifiez les textes puis cliquez sur « Publier ». Laisser vide = texte d\'origine.</p>';
    Object.keys(groups).forEach(function (pg) {
      h += '<h2 class="eyebrow mt-space-lg mb-space-xs">' + esc(PAGES[pg] || pg) + '</h2><div class="flex flex-col gap-space-sm">';
      groups[pg].forEach(function (k) {
        var v = C.texts[k] != null ? C.texts[k] : DEFAULTS[k].text;
        h += '<div class="card p-space-sm"><label class="label">' + esc(LABELS[k] || k) + '</label><textarea class="input" rows="' + (v.length > 120 ? 4 : 2) + '" data-text="' + k + '">' + esc(v) + '</textarea>' +
          (C.texts[k] != null ? '<button type="button" data-act="reset-text" data-k="' + k + '" class="text-label-sm text-on-surface-variant hover:text-primary mt-1">Remettre le texte d\'origine</button>' : '') + '</div>';
      });
      h += '</div>';
    });
    return h;
  }

  /* ---------- coordonnées ---------- */
  function viewContact() {
    return '<h1 class="font-display text-headline-md text-primary mb-space-xs">Coordonnées</h1><p class="text-on-surface-variant mb-space-md">Utilisées pour les boutons « Appeler » et « WhatsApp » de tout le site.</p>' +
      '<div class="card p-space-md flex flex-col gap-space-sm">' +
      '<div><label class="label">Numéro WhatsApp / téléphone (format international, sans « + »)</label><input class="input" data-s="whatsapp" inputmode="numeric" value="' + esc(C.settings.whatsapp) + '" placeholder="221780188809"><p class="text-label-sm text-on-surface-variant mt-1">Exemple : 221 + votre numéro → 221780188809</p></div>' +
      '<div><label class="label">Numéro affiché sur le site</label><input class="input" data-s="phoneDisplay" value="' + esc(C.settings.phoneDisplay) + '" placeholder="78 018 88 09"></div></div>';
  }

  /* ---------- publication ---------- */
  function viewPublication() {
    return '<h1 class="font-display text-headline-md text-primary mb-space-xs">Publication</h1>' +
      '<p class="text-on-surface-variant mb-space-md">Le bouton « Publier » enregistre vos changements dans le dépôt GitHub du site ; Vercel met alors le site en ligne automatiquement (environ 1 minute). À configurer une seule fois.</p>' +
      '<div class="card p-space-md flex flex-col gap-space-sm"><div class="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">' +
      '<div><label class="label">Compte GitHub (propriétaire)</label><input class="input" data-g="owner" value="' + esc(gh.owner) + '" placeholder="mon-compte"></div>' +
      '<div><label class="label">Nom du dépôt</label><input class="input" data-g="repo" value="' + esc(gh.repo) + '" placeholder="cafe-touba-seugn-bi"></div>' +
      '<div><label class="label">Branche</label><input class="input" data-g="branch" value="' + esc(gh.branch) + '"></div>' +
      '<div><label class="label">Dossier du site dans le dépôt</label><input class="input" data-g="prefix" value="' + esc(gh.prefix) + '" placeholder="public/"></div></div>' +
      '<div><label class="label">Jeton d\'accès GitHub (token)</label><input class="input" type="password" autocomplete="off" data-g="token" value="' + esc(gh.token) + '" placeholder="github_pat_…"><p class="text-label-sm text-on-surface-variant mt-1">Conservé uniquement dans ce navigateur. Sans ce jeton, personne ne peut publier : gardez-le secret. Droits requis : « Contents : Read and write » sur ce dépôt.</p></div></div>' +
      '<h2 class="eyebrow mt-space-lg mb-space-xs">Sans GitHub</h2><div class="card p-space-md flex flex-col gap-space-sm sm:flex-row sm:items-center sm:justify-between"><p class="text-on-surface-variant">Téléchargez le fichier <code>content.json</code> et remplacez-le dans le dossier du site avant de redéployer.</p><button type="button" data-act="download" class="btn btn-secondary !py-2">Télécharger content.json</button></div>' +
      '<div class="mt-space-lg"><button type="button" data-act="discard" class="text-label-md text-on-surface-variant hover:text-error underline">Abandonner mes modifications non publiées</button></div>';
  }

  /* ---------- événements ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.tab) { tab = b.dataset.tab; render(); return; }
    if (b.id === 'publish') return publish();
    var a = b.dataset.act, i = parseInt(b.dataset.i, 10);
    if (a === 'toggle') { var id = C.products[i].id; open[id] = !open[id]; render(); }
    else if (a === 'up' || a === 'down') { var j = a === 'up' ? i - 1 : i + 1; var t = C.products[i]; C.products[i] = C.products[j]; C.products[j] = t; touch(); render(); }
    else if (a === 'add') {
      var np = { id: uid('nouveau-produit'), name: 'Nouveau produit', short: 'Nouveau produit', price: 0, oldPrice: '', badge: '', format: '', tag: '', desc: '', image: 'assets/img/logo-badge.webp', active: false, featured: false, icon: 'shopping_cart' };
      C.products.push(np); open[np.id] = true; touch(); render();
    }
    else if (a === 'del') { if (confirm('Supprimer définitivement ce produit ?')) { C.products.splice(i, 1); touch(); render(); } }
    else if (a === 'reset-text') { delete C.texts[b.dataset.k]; touch(); render(); }
    else if (a === 'download') download();
    else if (a === 'discard') { if (confirm('Abandonner toutes les modifications non publiées ?')) { localStorage.removeItem(DRAFT); dirty = false; load(); } }
  });
  document.addEventListener('input', function (e) {
    var t = e.target, i = parseInt(t.dataset.i, 10);
    if (t.dataset.f) {
      var p = C.products[i], k = t.dataset.f;
      if (t.type === 'checkbox') p[k] = t.checked;
      else if (k === 'price' || k === 'oldPrice') p[k] = t.value === '' ? '' : Math.max(0, parseInt(t.value, 10) || 0);
      else p[k] = t.value;
      if (k === 'name') p.short = t.value;
      touch();
    } else if (t.dataset.text) {
      var d = DEFAULTS[t.dataset.text]; if (t.value.trim() === '' || t.value === d.text) delete C.texts[t.dataset.text]; else C.texts[t.dataset.text] = t.value;
      touch();
    } else if (t.dataset.s) { C.settings[t.dataset.s] = t.dataset.s === 'whatsapp' ? t.value.replace(/\D/g, '') : t.value; touch(); }
    else if (t.dataset.g) { gh[t.dataset.g] = t.value.trim(); localStorage.setItem(GH, JSON.stringify(gh)); }
  });
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.dataset.photo != null && t.files[0]) {
      var i = parseInt(t.dataset.photo, 10);
      resize(t.files[0]).then(function (url) { C.products[i].image = url; touch(); render(); }).catch(function () { notify("Cette image n'a pas pu être lue.", 'err'); });
    } else if (t.type === 'checkbox') render();
  });
  window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  function uid(base) {
    var s = String(base).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'produit', id = s, n = 2;
    while (C.products.some(function (p) { return p.id === id; })) id = s + '-' + n++;
    return id;
  }

  function resize(file) {
    return new Promise(function (res, rej) {
      var img = new Image(), u = URL.createObjectURL(file);
      img.onload = function () {
        var max = 1000, r = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(u);
        var url = c.toDataURL('image/webp', 0.82);
        res(url.indexOf('data:image/webp') === 0 ? url : c.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = rej; img.src = u;
    });
  }

  /* ---------- sortie ---------- */
  function clean(c, imgPath) {
    var out = { settings: c.settings, texts: c.texts, products: c.products.map(function (p) {
      var q = Object.assign({}, p); q.oldPrice = q.oldPrice === '' ? undefined : q.oldPrice; q.short = q.short || q.name; q.image = imgPath ? imgPath(p) : p.image; return q;
    }) };
    return JSON.stringify(out, null, 2) + '\n';
  }
  function download() {
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([clean(C)], { type: 'application/json' })); a.download = 'content.json'; a.click();
  }

  function b64utf8(s) { var by = new TextEncoder().encode(s), bin = ''; by.forEach(function (x) { bin += String.fromCharCode(x); }); return btoa(bin); }

  function publish() {
    if (!gh.owner || !gh.repo || !gh.token) { tab = 'publication'; render(); notify('Renseignez d\'abord les informations GitHub (une seule fois).', 'err'); return; }
    var btn = $('#publish'); btn.disabled = true; btn.lastChild.textContent = 'Publication…';
    var prefix = gh.prefix || '', base = '/repos/' + encodeURIComponent(gh.owner) + '/' + encodeURIComponent(gh.repo);
    var api = function (path, method, body) {
      return fetch('https://api.github.com' + base + path, { method: method || 'GET', headers: { Authorization: 'Bearer ' + gh.token, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.message || r.status); return j; }); });
    };
    var files = [], newPaths = {};
    C.products.forEach(function (p) {
      if (String(p.image).indexOf('data:') === 0) {
        var ext = p.image.indexOf('image/webp') > 0 ? 'webp' : 'jpg', path = 'assets/img/uploads/' + p.id + '-' + Date.now().toString(36) + '.' + ext;
        newPaths[p.id] = path; files.push({ path: prefix + path, b64: p.image.split(',')[1] });
      }
    });
    files.push({ path: prefix + 'content.json', b64: b64utf8(clean(C, function (p) { return newPaths[p.id] || p.image; })) });
    var head, tree = [];
    api('/git/ref/heads/' + encodeURIComponent(gh.branch)).then(function (r) { head = r.object.sha; return api('/git/commits/' + head); })
      .then(function (cm) {
        return Promise.all(files.map(function (f) { return api('/git/blobs', 'POST', { content: f.b64, encoding: 'base64' }).then(function (b) { tree.push({ path: f.path, mode: '100644', type: 'blob', sha: b.sha }); }); }))
          .then(function () { return api('/git/trees', 'POST', { base_tree: cm.tree.sha, tree: tree }); });
      })
      .then(function (t) { return api('/git/commits', 'POST', { message: 'Mise à jour du contenu (admin)', tree: t.sha, parents: [head] }); })
      .then(function (cm) { return api('/git/refs/heads/' + encodeURIComponent(gh.branch), 'PATCH', { sha: cm.sha }); })
      .then(function () {
        C.products.forEach(function (p) { if (newPaths[p.id]) p.image = newPaths[p.id]; });
        localStorage.removeItem(DRAFT); dirty = false; render();
        notify('Publié ! Le site sera à jour dans environ 1 minute.', 'ok');
      })
      .catch(function (err) { notify('Échec de la publication : ' + err.message + (/Bad credentials|Not Found|Resource/.test(err.message) ? ' — vérifiez le jeton et le nom du dépôt.' : ''), 'err'); })
      .then(function () { btn.disabled = false; btn.lastChild.textContent = 'Publier'; });
  }

  load();
})();
