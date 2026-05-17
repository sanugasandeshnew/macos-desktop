const BASE = import.meta.env.BASE_URL;

export const APPS = [
  {
    id: 'finder',
    name: 'Finder',
    defaultWidth: 800,
    defaultHeight: 500,
    defaultApp: true,
    iconSrc: BASE + 'icons/files.png',
  },
  {
    id: 'terminal',
    name: 'Terminal',
    defaultWidth: 640,
    defaultHeight: 400,
    iconSrc: BASE + 'icons/terminal.png',
  },
  {
    id: 'vscode',
    name: 'VS Code',
    defaultWidth: 960,
    defaultHeight: 600,
    iconSrc: BASE + 'icons/vscode.png',
  },
  {
    id: 'safari',
    name: 'Safari',
    defaultWidth: 1024,
    defaultHeight: 640,
    iconSrc: BASE + 'icons/safari.png',
  },
  {
    id: 'notes',
    name: 'Notes',
    defaultWidth: 500,
    defaultHeight: 400,
    iconSrc: BASE + 'icons/notes.png',
  },
  {
    id: 'music',
    name: 'Music',
    defaultWidth: 600,
    defaultHeight: 450,
    iconSrc: BASE + 'icons/music.png',
  },
  {
    id: 'photos',
    name: 'Photos',
    defaultWidth: 800,
    defaultHeight: 500,
    iconSrc: BASE + 'icons/photos.png',
  },
  {
    id: 'settings',
    name: 'System Settings',
    defaultWidth: 700,
    defaultHeight: 500,
    iconSrc: BASE + 'icons/settings.png',
  },
  {
    id: 'airdrop',
    name: 'AirDrop',
    defaultWidth: 500,
    defaultHeight: 400,
    iconSrc: BASE + 'icons/airdrop.png',
  },
  {
    id: 'textedit',
    name: 'TextEdit',
    defaultWidth: 600,
    defaultHeight: 450,
    iconSrc: BASE + 'icons/textedit.png',
  },
  {
    id: 'trash',
    name: 'Trash',
    defaultWidth: 400,
    defaultHeight: 300,
    dockOnly: true,
    iconSrc: BASE + 'icons/bin.png',
  },
  {
    id: 'wallpaper',
    name: 'Wallpaper',
    defaultWidth: 600,
    defaultHeight: 450,
    iconSrc: BASE + 'icons/files.png',
  },
];

export const DESKTOP_ICONS = [
  { id: 'macintosh-hd', name: 'Macintosh HD', icon: '💾', x: 22, y: 30 },
  { id: 'applications', name: 'Applications', icon: '📁', x: 22, y: 120 },
  { id: 'documents', name: 'Documents', icon: '📄', x: 22, y: 210 },
  { id: 'downloads', name: 'Downloads', icon: '⬇️', x: 22, y: 300 },
];

export const DOCK_APPS = ['finder', 'terminal', 'vscode', 'safari', 'notes', 'music', 'photos', 'settings', 'airdrop', 'textedit', 'trash'];

export const DOCK_ICONS_SVG = {
  finder: { viewBox: '0 0 24 24', color: '#4a9eff', paths: [
    'M3 4h7l2 3h9v13H3V4z',
  ]},
  terminal: { viewBox: '0 0 24 24', color: '#555', paths: [
    'M3 3h18v18H3V3zm2 4l4 5-4 5h3l4-5-4-5H5zm10 8h-4v2h4v-2z',
  ]},
  vscode: { viewBox: '0 0 24 24', color: '#007acc', paths: [
    'M16.5 2L6 8.5 2 6l-2 6 2 6 4-2.5L16.5 22 24 18V6l-7.5-4z',
  ]},
  safari: { viewBox: '0 0 24 24', color: '#4a9eff', paths: [
    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-7l-5-4 5 4-5 4 5-4zm2-4l5 4-5 4 5-4-5-4zm0 4h-2v2h2v-2z',
  ]},
  notes: { viewBox: '0 0 24 24', color: '#ffdb4d', paths: [
    'M3 3h12l6 6v12H3V3zm5 4v2h8V7H8zm0 4v2h8v-2H8zm0 4v2h5v-2H8z',
  ]},
  music: { viewBox: '0 0 24 24', color: '#ff4d4d', paths: [
    'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z',
  ]},
  photos: { viewBox: '0 0 24 24', color: '#4cd964', paths: [
    'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z',
  ]},
  settings: { viewBox: '0 0 24 24', color: '#8e8e93', paths: [
    'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
  ]},
  airdrop: { viewBox: '0 0 24 24', color: '#4a9eff', paths: [
    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm2-3.32V13h-2v-1.18c0-.28.22-.5.5-.5h1c.28 0 .5.22.5.5z',
  ]},
  textedit: { viewBox: '0 0 24 24', color: '#ffdb4d', paths: [
    'M3 3h18v18H3V3zm4 4v2h10V7H7zm0 4v2h10v-2H7zm0 4v2h6v-2H7z',
  ]},
  trash: { viewBox: '0 0 24 24', color: '#8e8e93', paths: [
    'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
  ]},
  wallpaper: { viewBox: '0 0 24 24', color: '#4a9eff', paths: [
    'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z',
  ]},
};
