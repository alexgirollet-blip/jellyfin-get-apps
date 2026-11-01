import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker, { readConfig } from '../src/index.js';
import { esc } from '../src/page.js';

const env = { SERVER_URL: 'media.example.com/', SERVER_NAME: 'Test <Server>', AMAZON_DOMAIN: 'amazon.co.uk' };
const get = (path, headers = {}, e = env) => worker.fetch(new Request(`https://apps.example.com${path}`, { headers }), e, {});

test('config normalises the server URL and frame-ancestors', () => {
  const cfg = readConfig(env);
  assert.equal(cfg.serverUrl, 'https://media.example.com');
  assert.equal(cfg.frameAncestors, "'self' https://media.example.com");
});

test('page renders, escapes config and can be framed by the server', async () => {
  const res = await get('/');
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.match(html, /https:\/\/media\.example\.com/);
  assert.match(html, /Test &lt;Server&gt;/);
  assert.doesNotMatch(html, /Test <Server>/);
  assert.match(res.headers.get('content-security-policy'), /frame-ancestors 'self' https:\/\/media\.example\.com/);
});

test('?platform= overrides detection', async () => {
  const html = await (await get('/?platform=ios')).text();
  assert.match(html, /var os = "ios", forced = true/);
});

test('short links redirect', async () => {
  const res = await get('/go/firetv');
  assert.equal(res.status, 302);
  assert.equal(res.headers.get('location'), 'https://www.amazon.co.uk/dp/B07TX7Z725');
  assert.equal((await get('/go/web')).headers.get('location'), 'https://media.example.com/');
  assert.equal((await get('/go/nope')).status, 404);
});

test('HIDE removes platforms and links', async () => {
  const res = await get('/api/clients', {}, { ...env, HIDE: 'roku, linux, android-fdroid' });
  const data = await res.json();
  assert.ok(!data.some((p) => p.id === 'linux' || p.id === 'roku'));
  const android = data.find((p) => p.id === 'android');
  assert.ok(!android.links.some((l) => l.id === 'android-fdroid'));
});

test('works with no config at all', async () => {
  const html = await (await get('/', {}, {})).text();
  assert.doesNotMatch(html, /id="addr"/);
  assert.doesNotMatch(html, /data-os="web"/);
});

test('every official client from jellyfin.org is listed', async () => {
  const ids = (await (await get('/api/clients')).json()).flatMap((p) => p.links.map((l) => l.id));
  for (const id of ['android', 'android-fdroid', 'android-amazon', 'ios', 'androidtv', 'androidtv-fdroid', 'firetv', 'roku', 'lg', 'samsung', 'xbox']) {
    assert.ok(ids.includes(id), id);
  }
});

test('qr code is an svg', async () => {
  const res = await get('/qr.svg');
  assert.equal(res.headers.get('content-type'), 'image/svg+xml');
  assert.match(await res.text(), /^<svg/);
});

test('esc handles quotes', () => {
  assert.equal(esc(`"'&`), '&quot;&#39;&amp;');
});
