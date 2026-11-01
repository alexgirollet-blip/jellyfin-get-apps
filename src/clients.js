// Catalogue of Jellyfin clients shown on the page.
// Each link `id` is also a short link: /go/<id> redirects to its URL.

const NIGHTLY = 'https://nightly.link/jellyfin/jellyfin-desktop/workflows';

export const DESKTOP_REPO = 'jellyfin/jellyfin-desktop';

/**
 * @param {{ amazonDomain: string, serverUrl: string }} opts
 */
export function buildCatalogue({ amazonDomain, serverUrl }) {
  const platforms = [
    {
      id: 'windows',
      icon: '💻',
      name: 'Windows',
      blurb: 'Jellyfin Desktop, built from the latest code.',
      workflow: 'build-windows',
      links: [
        { id: 'windows', label: 'Installer', url: `${NIGHTLY}/build-windows/master/windows-x64-installer.zip`, primary: true },
        { id: 'windows-portable', label: 'Portable', url: `${NIGHTLY}/build-windows/master/windows-x64-portable.zip` },
      ],
      help: [
        'Unzip the download, then run the installer.',
        'If Windows SmartScreen warns you, choose <b>More info → Run anyway</b>.',
      ],
    },
    {
      id: 'mac',
      icon: '🍎',
      name: 'macOS',
      blurb: 'Jellyfin Desktop, built from the latest code, for Apple Silicon Macs. Intel Macs need the older release.',
      workflow: 'build-macos',
      links: [
        { id: 'mac', label: 'Apple Silicon', url: `${NIGHTLY}/build-macos/master/macos-arm64.zip`, primary: true },
        // Intel builds are no longer produced on master; v1.12.0 is the last release with one.
        { id: 'mac-intel', label: 'Intel (older version)', url: `https://github.com/${DESKTOP_REPO}/releases/tag/v1.12.0` },
      ],
      help: [
        'Unzip and drag Jellyfin Desktop into Applications.',
        'If macOS refuses to open it: <b>System Settings → Privacy &amp; Security → Open Anyway</b>.',
      ],
    },
    {
      id: 'linux',
      icon: '🐧',
      name: 'Linux',
      blurb: 'The AppImage is the latest build. Flathub updates itself.',
      workflow: 'build-appimage',
      links: [
        { id: 'linux', label: 'AppImage', url: `${NIGHTLY}/build-appimage/master/linux-appimage-x86_64.zip`, primary: true },
        { id: 'flathub', label: 'Flathub', url: 'https://flathub.org/apps/org.jellyfin.JellyfinDesktop' },
      ],
      help: ['Unzip, run <code>chmod +x</code> on the AppImage, then open it.'],
    },
    {
      id: 'ios',
      icon: '📱',
      name: 'iPhone & iPad',
      blurb: 'The official Jellyfin app. Streamyfin is an alternative with offline downloads.',
      links: [
        { id: 'ios', label: 'Jellyfin', url: 'https://apps.apple.com/app/id1480192618', primary: true },
        { id: 'streamyfin-ios', label: 'Streamyfin', url: 'https://apps.apple.com/app/id6593660679' },
      ],
    },
    {
      id: 'android',
      icon: '🤖',
      name: 'Android',
      blurb: 'The official Jellyfin app. Streamyfin is an alternative with offline downloads.',
      links: [
        { id: 'android', label: 'Jellyfin', url: 'https://play.google.com/store/apps/details?id=org.jellyfin.mobile', primary: true },
        { id: 'streamyfin-android', label: 'Streamyfin', url: 'https://play.google.com/store/apps/details?id=com.fredrikburmester.streamyfin' },
      ],
    },
    {
      id: 'tv',
      icon: '📺',
      name: 'TV & streaming boxes',
      blurb: 'Or search for "Jellyfin" in your TV\'s app store.',
      links: [
        { id: 'androidtv', label: 'Android / Google TV', url: 'https://play.google.com/store/apps/details?id=org.jellyfin.androidtv', primary: true },
        { id: 'firetv', label: 'Fire TV', url: `https://www.${amazonDomain}/dp/B07TX7Z725` },
        { id: 'appletv', label: 'Apple TV', url: 'https://apps.apple.com/app/id1604098728' },
        { id: 'roku', label: 'Roku', url: 'https://my.roku.com/account/add?channel=jellyfin' },
      ],
    },
  ];

  if (serverUrl) {
    platforms.push({
      id: 'web',
      icon: '🌐',
      name: 'Web browser',
      blurb: 'Nothing to install. Bookmark it.',
      links: [{ id: 'web', label: 'Open in browser', url: serverUrl, primary: true }],
    });
  }

  return platforms;
}

/**
 * Removes hidden platforms or individual links.
 * @param {ReturnType<typeof buildCatalogue>} platforms
 * @param {Set<string>} hidden ids of platforms or links
 */
export function applyHidden(platforms, hidden) {
  if (!hidden.size) return platforms;
  return platforms
    .filter((p) => !hidden.has(p.id))
    .map((p) => {
      const links = p.links.filter((l) => !hidden.has(l.id));
      if (links.length && !links.some((l) => l.primary)) links[0] = { ...links[0], primary: true };
      return { ...p, links };
    })
    .filter((p) => p.links.length);
}

/** Flat map of short-link id → URL. */
export function linkIndex(platforms) {
  const map = new Map();
  for (const p of platforms) for (const l of p.links) map.set(l.id, l.url);
  return map;
}
