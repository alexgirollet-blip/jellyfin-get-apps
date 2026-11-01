import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectPlatform } from '../src/detect.js';

const cases = {
  windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
  mac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
  linux: 'Mozilla/5.0 (X11; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0',
  ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  android: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36',
  androidtv: 'Mozilla/5.0 (Linux; Android 9; AFTKA Build/PS7633) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36',
  webos: 'Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0 Safari/537.36 WebAppManager',
  tizen: 'Mozilla/5.0 (SMART-TV; LINUX; Tizen 7.0) AppleWebKit/537.36 (KHTML, like Gecko) 94.0/7.0 TV Safari/537.36',
  xbox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; Xbox; Xbox Series X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 Edge/20.02',
  roku: 'Roku/DVP-14.0 (14.0.4.5104)',
};

for (const [expected, ua] of Object.entries(cases)) {
  test(`detects ${expected}`, () => assert.equal(detectPlatform(ua), expected));
}

test('Chromebook gets Android apps', () => {
  assert.equal(detectPlatform('Mozilla/5.0 (X11; CrOS x86_64 15359.58.0) AppleWebKit/537.36 Chrome/130.0 Safari/537.36'), 'android');
});

test('unknown falls back to web', () => {
  assert.equal(detectPlatform(''), 'web');
  assert.equal(detectPlatform('curl/8.0'), 'web');
});
