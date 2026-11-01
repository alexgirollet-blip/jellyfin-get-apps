// Best-effort platform detection from a User-Agent string.
// iPadOS reports itself as a Mac, so the page script corrects that case in the browser.

export const PLATFORM_IDS = [
  'windows', 'mac', 'linux', 'web',
  'ios', 'android',
  'androidtv', 'appletv', 'roku', 'webos', 'tizen', 'xbox',
];

export function detectPlatform(ua = '') {
  // TVs and consoles first: their user agents often also mention Android, Linux or Windows.
  if (/Xbox/i.test(ua)) return 'xbox';
  if (/Web0S|webOS/i.test(ua)) return 'webos';
  if (/Tizen/i.test(ua)) return 'tizen';
  if (/Roku/i.test(ua)) return 'roku';
  if (/AppleTV|tvOS/i.test(ua)) return 'appletv';
  if (/AFT[A-Z]|BRAVIA|GoogleTV|Google TV|Android TV|AndroidTV|SHIELD|CrKey/i.test(ua)) return 'androidtv';
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  // Chromebooks run Android apps from the Play Store.
  if (/Android|CrOS/.test(ua)) return 'android';
  if (/Windows/.test(ua)) return 'windows';
  if (/Macintosh|Mac OS X/.test(ua)) return 'mac';
  if (/Linux|X11/.test(ua)) return 'linux';
  return 'web';
}
