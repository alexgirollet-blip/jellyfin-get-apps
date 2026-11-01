// Best-effort platform detection from a User-Agent string.
// iPadOS reports itself as a Mac, so the page script corrects that case in the browser.

export const PLATFORM_IDS = ['windows', 'mac', 'linux', 'ios', 'android', 'tv', 'web'];

export function detectPlatform(ua = '') {
  if (/AFT[A-Z]|BRAVIA|GoogleTV|Google TV|Android TV|AndroidTV|SMART-TV|SmartTV|Tizen|Web0S|webOS.TV|Roku|AppleTV|CrKey/i.test(ua)) return 'tv';
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  // Chromebooks run Android apps from the Play Store.
  if (/Android|CrOS/.test(ua)) return 'android';
  if (/Windows/.test(ua)) return 'windows';
  if (/Macintosh|Mac OS X/.test(ua)) return 'mac';
  if (/Linux|X11/.test(ua)) return 'linux';
  return 'web';
}
