export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderCard(p) {
  const buttons = p.links
    .map(
      (l) =>
        `<a class="btn ${l.primary ? 'p' : 's'}" href="${esc(l.url)}" target="_blank" rel="noopener" data-link="${esc(l.id)}">${esc(l.label)}</a>`,
    )
    .join('\n        ');
  const help = p.help?.length
    ? `\n      <details><summary>Install help</summary><ul>${p.help.map((h) => `<li>${h}</li>`).join('')}</ul></details>`
    : '';
  const build = p.workflow ? `\n      <p class="build" data-workflow="${esc(p.workflow)}" hidden></p>` : '';
  const note = p.note ? `\n      <p class="note">${esc(p.note)}</p>` : '';
  return `
    <div class="card" data-os="${esc(p.id)}">
      <h2><span aria-hidden="true">${p.icon}</span> ${esc(p.name)}</h2>
      <p>${esc(p.blurb)}</p>${note}
      <div class="btns">
        ${buttons}
      </div>${build}${help}
    </div>`;
}

/**
 * @param {object} o
 * @param {string} o.serverName
 * @param {string} o.serverUrl
 * @param {string} o.announcement
 * @param {string} o.platform detected or forced platform id
 * @param {boolean} o.forced true when ?platform= was used
 * @param {Array} o.platforms
 * @param {Array} o.groups
 */
function renderGroups(platforms, groups) {
  return groups
    .map((g) => {
      const cards = platforms.filter((p) => p.group === g.id);
      if (!cards.length) return '';
      return `
  <section class="group" data-group="${esc(g.id)}">
    <h3>${esc(g.title)}</h3>
    <div class="grid">${cards.map(renderCard).join('')}
    </div>
  </section>`;
    })
    .join('');
}

export function renderPage(o) {
  const server = o.serverUrl
    ? `
  <div class="server">
    <span>Server address:</span>
    <code id="addr">${esc(o.serverUrl)}</code>
    <button class="btn s" id="copy" type="button">Copy</button>
  </div>`
    : '';

  const notice = o.announcement ? `\n  <div class="notice" role="status">${esc(o.announcement)}</div>` : '';

  const steps = `
  <ol class="steps">
    <li><b>Install</b> the app for your device below.</li>
    <li><b>Add the server</b>${o.serverUrl ? ': paste the address above' : ''}.</li>
    <li><b>Sign in</b> with your ${esc(o.serverName)} username and password.</li>
  </ol>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<meta name="color-scheme" content="dark">
<title>Get the Apps · ${esc(o.serverName)}</title>
<style>
  :root{--bg:#101010;--card:#1c1c1e;--text:#eee;--muted:#a0a0a8;--line:#2e2e33;--a1:#aa5cc3;--a2:#00a4dc}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--text);font:15px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
  .wrap{max-width:860px;margin:0 auto;padding:28px 16px 48px}
  h1{margin:0 0 4px;font-size:28px;background:linear-gradient(90deg,var(--a1),var(--a2));-webkit-background-clip:text;background-clip:text;color:transparent}
  .sub{color:var(--muted);margin:0 0 20px}
  .notice{background:#2a2112;border:1px solid #6b5420;color:#f3d48a;border-radius:12px;padding:10px 14px;margin-bottom:16px}
  .server{display:flex;flex-wrap:wrap;align-items:center;gap:10px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin-bottom:16px}
  .server span{color:var(--muted)}
  .server code{font-size:16px;font-weight:600;word-break:break-all}
  .steps{margin:0 0 8px;padding-left:20px;color:var(--muted)}
  .steps b{color:var(--text)}
  h3{font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:24px 0 10px}
  .grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(250px,1fr))}
  .card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px}
  .card.rec{border-color:var(--a1);box-shadow:0 0 0 1px var(--a1)}
  .card h2{margin:0 0 4px;font-size:17px}
  .card p{margin:0 0 12px;color:var(--muted);font-size:13.5px}
  .card p.build{margin:10px 0 0;font-size:12.5px}
  .card p.note{font-size:12.5px;border-left:2px solid var(--line);padding-left:8px}
  .card.more{margin-top:24px}
  .btns{display:flex;flex-wrap:wrap;gap:8px}
  a.btn,button.btn{display:inline-block;padding:8px 14px;border-radius:8px;font:inherit;font-size:14px;font-weight:600;text-decoration:none;cursor:pointer;border:0}
  .btn.p{background:linear-gradient(90deg,var(--a1),var(--a2));color:#fff}
  .btn.s{background:transparent;color:var(--text);border:1px solid var(--line)}
  .btn.s:hover{border-color:var(--muted)}
  .btn:focus-visible{outline:2px solid var(--a2);outline-offset:2px}
  details{margin-top:10px;font-size:13px;color:var(--muted)}
  summary{cursor:pointer}
  details ul{margin:6px 0 0;padding-left:18px}
  .qr{display:flex;gap:14px;align-items:center}
  .qr img{width:112px;height:112px;background:#fff;border-radius:8px;padding:6px;flex:none}
  [hidden]{display:none!important}
  footer{margin-top:28px;font-size:13px;color:var(--muted)}
  footer a{color:var(--a2)}
</style>
</head>
<body>
<div class="wrap">
  <h1>Get the Apps</h1>
  <p class="sub">Watch ${esc(o.serverName)} on any device.</p>${notice}${server}${steps}

  <div id="rec-slot" hidden>
    <h3>Recommended for this device</h3>
    <div class="grid" id="rec-grid"></div>
  </div>

  <div id="all">${renderGroups(o.platforms, o.groups)}
  </div>

  <div class="card more">
    <h2>Can't find your device?</h2>
    <p>See every Jellyfin client, including Kodi and community apps, on the official site.</p>
    <div class="btns"><a class="btn s" href="https://jellyfin.org/downloads/clients" target="_blank" rel="noopener">All clients on jellyfin.org</a></div>
  </div>

  <div class="card qr" id="qr" hidden style="margin-top:12px">
    <img src="qr.svg" alt="QR code linking to this page" width="112" height="112" loading="lazy">
    <div>
      <h2>Setting up a phone or tablet?</h2>
      <p>Scan this with its camera to open this page there.</p>
    </div>
  </div>

  <footer>Desktop builds don't update themselves. Come back here for a newer version.</footer>
</div>

<script>
(function () {
  var os = ${JSON.stringify(o.platform)}, forced = ${o.forced ? 'true' : 'false'};
  // iPadOS pretends to be a Mac; a touch screen gives it away.
  if (!forced && os === 'mac' && navigator.maxTouchPoints > 1) os = 'ios';

  var card = document.querySelector('#all [data-os="' + os + '"]');
  if (card && os !== 'web') {
    card.classList.add('rec');
    document.getElementById('rec-grid').appendChild(card);
    document.getElementById('rec-slot').hidden = false;
    document.querySelectorAll('#all .group').forEach(function (g) {
      if (!g.querySelector('.card')) g.hidden = true;
    });
  }
  if (os === 'windows' || os === 'mac' || os === 'linux') document.getElementById('qr').hidden = false;

  var copy = document.getElementById('copy');
  if (copy) copy.addEventListener('click', function () {
    var t = document.getElementById('addr').textContent;
    function done() { copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = 'Copy'; }, 1500); }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) {}
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(done, fallback);
    else fallback();
  });

  function ago(iso) {
    var d = (Date.now() - Date.parse(iso)) / 86400000;
    if (!(d >= 0)) return '';
    if (d < 1) return 'today';
    if (d < 2) return 'yesterday';
    if (d < 60) return Math.floor(d) + ' days ago';
    return new Date(iso).toLocaleDateString();
  }
  var slots = document.querySelectorAll('[data-workflow]');
  if (slots.length && window.fetch) fetch('api/builds').then(function (r) { return r.ok ? r.json() : {}; }).then(function (b) {
    slots.forEach(function (el) {
      var info = b[el.getAttribute('data-workflow')];
      var when = info && ago(info.date);
      if (!when) return;
      el.textContent = 'Latest build: ' + when + (info.sha ? ' (' + info.sha + ')' : '');
      el.hidden = false;
    });
  }).catch(function () {});
})();
</script>
</body>
</html>`;
}
