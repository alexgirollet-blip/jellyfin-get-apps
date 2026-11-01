import qrcode from 'qrcode-generator';
import { buildCatalogue, applyHidden, linkIndex, DESKTOP_REPO } from './clients.js';
import { detectPlatform, PLATFORM_IDS } from './detect.js';
import { renderPage } from './page.js';

const BUILD_CACHE_SECONDS = 3600;

/** Reads settings from Worker variables / secrets. Nothing private lives in the repo. */
export function readConfig(env = {}) {
  const serverUrl = normaliseUrl(env.SERVER_URL);
  let serverOrigin = '';
  try {
    serverOrigin = serverUrl ? new URL(serverUrl).origin : '';
  } catch {}
  return {
    serverUrl,
    serverName: (env.SERVER_NAME || 'Jellyfin').trim(),
    announcement: (env.ANNOUNCEMENT || '').trim(),
    amazonDomain: (env.AMAZON_DOMAIN || 'amazon.com').trim().replace(/^www\./, ''),
    hidden: new Set(
      (env.HIDE || '')
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    ),
    frameAncestors: (env.FRAME_ANCESTORS || ["'self'", serverOrigin].filter(Boolean).join(' ')).trim(),
    githubToken: env.GITHUB_TOKEN || '',
  };
}

function normaliseUrl(value) {
  const v = (value || '').trim().replace(/\/+$/, '');
  if (!v) return '';
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

function securityHeaders(cfg, type) {
  return {
    'content-type': type,
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer',
    'x-robots-tag': 'noindex, nofollow',
    'content-security-policy': [
      "default-src 'none'",
      "style-src 'unsafe-inline'",
      "script-src 'unsafe-inline'",
      "img-src 'self'",
      "connect-src 'self'",
      "base-uri 'none'",
      "form-action 'none'",
      `frame-ancestors ${cfg.frameAncestors}`,
    ].join('; '),
  };
}

function json(data, cfg, maxAge = 300) {
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      ...securityHeaders(cfg, 'application/json; charset=utf-8'),
      'cache-control': `public, max-age=${maxAge}`,
      'access-control-allow-origin': '*',
    },
  });
}

/** Latest successful master build for each desktop workflow, cached for an hour. */
async function getBuilds(cfg, ctx, workflows) {
  const cache = typeof caches !== 'undefined' ? caches.default : null;
  const key = new Request('https://cache.internal/builds-v1');
  if (cache) {
    const hit = await cache.match(key);
    if (hit) return hit.json();
  }

  const headers = {
    accept: 'application/vnd.github+json',
    'user-agent': 'jellyfin-get-apps',
  };
  if (cfg.githubToken) headers.authorization = `Bearer ${cfg.githubToken}`;

  const out = {};
  await Promise.all(
    workflows.map(async (wf) => {
      try {
        const url = `https://api.github.com/repos/${DESKTOP_REPO}/actions/workflows/${wf}.yml/runs?branch=master&status=success&per_page=1`;
        const res = await fetch(url, { headers });
        if (!res.ok) return;
        const run = (await res.json()).workflow_runs?.[0];
        if (run) out[wf] = { date: run.updated_at, sha: String(run.head_sha || '').slice(0, 7) };
      } catch {}
    }),
  );

  if (cache && Object.keys(out).length) {
    const res = new Response(JSON.stringify(out), {
      headers: { 'content-type': 'application/json', 'cache-control': `max-age=${BUILD_CACHE_SECONDS}` },
    });
    const put = cache.put(key, res);
    if (ctx?.waitUntil) ctx.waitUntil(put);
    else await put;
  }
  return out;
}

function qrSvg(text) {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  return qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
}

export default {
  async fetch(request, env, ctx) {
    const cfg = readConfig(env);
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405, headers: { allow: 'GET, HEAD' } });
    }

    const platforms = applyHidden(
      buildCatalogue({ amazonDomain: cfg.amazonDomain, serverUrl: cfg.serverUrl }),
      cfg.hidden,
    );

    if (path === '/') {
      const forcedParam = (url.searchParams.get('platform') || '').toLowerCase();
      const forced = PLATFORM_IDS.includes(forcedParam);
      const platform = forced ? forcedParam : detectPlatform(request.headers.get('user-agent') || '');
      const html = renderPage({ ...cfg, platform, forced, platforms });
      return new Response(html, {
        headers: {
          ...securityHeaders(cfg, 'text/html; charset=utf-8'),
          'cache-control': 'public, max-age=300',
          vary: 'user-agent',
        },
      });
    }

    // Short links: /go/windows, /go/ios, /go/roku ...
    const go = path.match(/^\/go\/([a-z0-9-]+)$/i);
    if (go) {
      const target = linkIndex(platforms).get(go[1].toLowerCase());
      if (target) return Response.redirect(target, 302);
      return new Response('Unknown app. See / for the full list.', { status: 404 });
    }

    if (path === '/api/clients') {
      return json(
        platforms.map((p) => ({
          id: p.id,
          name: p.name,
          links: p.links.map((l) => ({ id: l.id, label: l.label, url: l.url, primary: !!l.primary, short: `/go/${l.id}` })),
        })),
        cfg,
      );
    }

    if (path === '/api/builds') {
      const workflows = platforms.map((p) => p.workflow).filter(Boolean);
      return json(await getBuilds(cfg, ctx, workflows), cfg, 900);
    }

    if (path === '/qr.svg') {
      return new Response(qrSvg(`${url.origin}/`), {
        headers: { ...securityHeaders(cfg, 'image/svg+xml'), 'cache-control': 'public, max-age=86400' },
      });
    }

    if (path === '/health') return json({ ok: true, configured: !!cfg.serverUrl }, cfg, 0);

    if (path === '/robots.txt') {
      return new Response('User-agent: *\nDisallow: /\n', { headers: { 'content-type': 'text/plain' } });
    }

    return new Response('Not found', { status: 404 });
  },
};
