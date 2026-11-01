// Catalogue of Jellyfin clients shown on the page.
// Store links match the official list at https://jellyfin.org/downloads/clients
// Each link `id` is also a short link: /go/<id> redirects to its URL.

const NIGHTLY = 'https://nightly.link/jellyfin/jellyfin-desktop/workflows';

export const DESKTOP_REPO = 'jellyfin/jellyfin-desktop';

export const GROUPS = [
  { id: 'computers', title: 'Computers' },
  { id: 'mobile', title: 'Phones & tablets' },
  { id: 'tv', title: 'TVs & consoles' },
];

/**
 * @param {{ amazonDomain: string, serverUrl: string }} opts
 */
export function buildCatalogue({ amazonDomain, serverUrl }) {
  const amazon = (asin) => `https://www.${amazonDomain}/dp/${asin}`;

  const platforms = [
    // Computers
    {
      id: 'windows',
      group: 'computers',
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
      group: 'computers',
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
      group: 'computers',
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

    // Phones & tablets
    {
      id: 'ios',
      group: 'mobile',
      icon: '📱',
      name: 'iPhone & iPad',
      blurb: 'The official Jellyfin app. Streamyfin is an alternative with offline downloads.',
      links: [
        { id: 'ios', label: 'App Store', url: 'https://apps.apple.com/app/id1480192618', primary: true },
        { id: 'streamyfin-ios', label: 'Streamyfin', url: 'https://apps.apple.com/app/id6593660679' },
      ],
    },
    {
      id: 'android',
      group: 'mobile',
      icon: '🤖',
      name: 'Android',
      blurb: 'The official Jellyfin app for phones and tablets, including Fire tablets. Streamyfin is an alternative with offline downloads.',
      links: [
        { id: 'android', label: 'Play Store', url: 'https://play.google.com/store/apps/details?id=org.jellyfin.mobile', primary: true },
        { id: 'android-fdroid', label: 'F-Droid', url: 'https://f-droid.org/packages/org.jellyfin.mobile/' },
        { id: 'android-amazon', label: 'Amazon Appstore', url: amazon('B081RFTTQ9') },
        { id: 'streamyfin-android', label: 'Streamyfin', url: 'https://play.google.com/store/apps/details?id=com.fredrikburmester.streamyfin' },
      ],
    },

    // TVs & consoles
    {
      id: 'androidtv',
      group: 'tv',
      icon: '📺',
      name: 'Android TV & Fire TV',
      blurb: 'The official Jellyfin app for Android TV, Google TV and Fire TV.',
      links: [
        { id: 'androidtv', label: 'Play Store', url: 'https://play.google.com/store/apps/details?id=org.jellyfin.androidtv', primary: true },
        { id: 'firetv', label: 'Amazon Appstore', url: amazon('B07TX7Z725') },
        { id: 'androidtv-fdroid', label: 'F-Droid', url: 'https://f-droid.org/packages/org.jellyfin.androidtv/' },
      ],
    },
    {
      id: 'appletv',
      group: 'tv',
      icon: '📺',
      name: 'Apple TV',
      blurb: 'Swiftfin, the Jellyfin app for Apple TV.',
      links: [{ id: 'appletv', label: 'App Store', url: 'https://apps.apple.com/app/id1604098728', primary: true }],
    },
    {
      id: 'roku',
      group: 'tv',
      icon: '📺',
      name: 'Roku',
      blurb: 'The official Jellyfin app for Roku.',
      note: 'The Roku store may say a cable or satellite subscription is required. It isn\'t.',
      links: [{ id: 'roku', label: 'Channel Store', url: 'https://channelstore.roku.com/details/592369/jellyfin', primary: true }],
    },
    {
      id: 'webos',
      group: 'tv',
      icon: '📺',
      name: 'LG TV (webOS)',
      blurb: 'The official Jellyfin app for LG TVs. Search "Jellyfin" in the LG Content Store on your TV.',
      links: [{ id: 'lg', label: 'LG Content Store', url: 'https://us.lgappstv.com/main/tvapp/detail?appId=1030579', primary: true }],
    },
    {
      id: 'tizen',
      group: 'tv',
      icon: '📺',
      name: 'Samsung TV (Tizen)',
      blurb: 'The official Jellyfin app for Samsung TVs. Search "Jellyfin" in Apps on your TV.',
      links: [{ id: 'samsung', label: 'Smart TV App Store', url: 'https://www.samsung.com/us/tvs/smart-tv/samsung-tv-apps-detail/?appId=3202007021208', primary: true }],
    },
    {
      id: 'xbox',
      group: 'tv',
      icon: '🎮',
      name: 'Xbox',
      blurb: 'The official Jellyfin app for Xbox consoles.',
      links: [{ id: 'xbox', label: 'Microsoft Store', url: 'https://apps.microsoft.com/detail/9P2DRTG62QF8', primary: true }],
    },
  ];

  if (serverUrl) {
    platforms.splice(3, 0, {
      id: 'web',
      group: 'computers',
      icon: '🌐',
      name: 'Web browser',
      blurb: 'Nothing to install. Works on any computer. Bookmark it.',
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
