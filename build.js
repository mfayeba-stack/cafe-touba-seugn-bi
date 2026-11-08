// Assemble src/pages/*.html + src/partials/*.html -> public/*.html
// Usage : npm run build   (SITE_URL=https://votre-domaine.com pour sitemap/canonical)
const fs = require('fs');
const path = require('path');

const SITE_URL = (process.env.SITE_URL || 'https://www.cafetouba-seugnbi.com').replace(/\/$/, '');
const src = path.join(__dirname, 'src');
const out = path.join(__dirname, 'public');
const partial = (n) => fs.readFileSync(path.join(src, 'partials', n + '.html'), 'utf8');
const meta = (html, key) => (html.match(new RegExp('<!--\\s*' + key + ':\\s*(.*?)\\s*-->')) || [, ''])[1];

const pages = fs.readdirSync(path.join(src, 'pages')).filter((f) => f.endsWith('.html'));
const urls = [];

for (const file of pages) {
  const raw = fs.readFileSync(path.join(src, 'pages', file), 'utf8');
  const title = meta(raw, 'title');
  const desc = meta(raw, 'desc');
  const nav = meta(raw, 'nav');
  const image = meta(raw, 'image') || 'assets/img/affiche-seugn-bi.jpg';
  const slug = file === 'index.html' ? '' : file;
  const body = raw.replace(/<!--\s*(title|desc|nav|image):.*?-->\s*/g, '');

  let header = partial('header');
  header = header.replace(new RegExp('data-nav="' + nav + '"'), '$& aria-current="page"');

  let html = partial('layout')
    .replace('{{head}}', partial('head'))
    .replace('{{header}}', header)
    .replace('{{content}}', body)
    .replace('{{footer}}', partial('footer'))
    .replace(/{{title}}/g, title)
    .replace(/{{desc}}/g, desc)
    .replace(/{{url}}/g, SITE_URL + '/' + slug)
    .replace(/{{image}}/g, SITE_URL + '/' + image)
    .replace(/{{year}}/g, new Date().getFullYear());

  fs.writeFileSync(path.join(out, file), html);
  urls.push(SITE_URL + '/' + slug);
}

// Textes modifiables depuis l'admin : valeurs par défaut lues dans les pages (data-text="clé")
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
const defaults = {};
const scan = (name, html) => {
  const re = /<(\w+)[^>]*data-text="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g;
  let m;
  while ((m = re.exec(html))) defaults[m[2]] = { text: decode(m[3].replace(/<[^>]+>/g, '').trim()), page: name };
};
for (const file of pages) scan(file === 'index.html' ? 'Accueil' : file.replace('.html', ''), fs.readFileSync(path.join(out, file), 'utf8'));
fs.writeFileSync(path.join(out, 'assets', 'defaults.json'), JSON.stringify(defaults, null, 1));

fs.writeFileSync(
  path.join(out, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.filter((u) => !u.includes('mentions')).map((u) => `  <url><loc>${u}</loc></url>`).join('\n') +
    '\n</urlset>\n'
);
fs.writeFileSync(path.join(out, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin.html\nSitemap: ${SITE_URL}/sitemap.xml\n`);
console.log('Built', pages.length, 'pages ->', out);
