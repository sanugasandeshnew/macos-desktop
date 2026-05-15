import { useState, useCallback, useEffect, useRef } from 'react';
import { DesktopProvider, useDesktop } from './context/DesktopContext';
import MenuBar from './components/MenuBar';
import Dock from './components/Dock';
import DesktopIcons from './components/DesktopIcons';
import Window from './components/Window';
import Wallpaper from './components/Wallpaper';
import Spotlight from './components/Spotlight';
import ContextMenu from './components/ContextMenu';

function LoadingScreen({ onDone }) {
  const [fadeOut, setFadeOut] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio('https://mp3tourl.com/audio/1778868134568-499584f1-f59e-45b6-8685-4bd8d413f14c.mp3');
    audioRef.current = audio;
    audio.volume = 0.5;
    audio.play().catch(() => {});
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onDone, 600);
    }, 2500);
    return () => { clearTimeout(timer); audio.pause(); audio.src = ''; };
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999999,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: fadeOut ? 'rgba(0,0,0,0)' : '#000',
      transition: 'background 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      pointerEvents: 'none',
    }}>
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" style={{
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.4s ease-out',
        marginBottom: 24,
      }}>
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="white" opacity={fadeOut ? 0 : 0.9} />
      </svg>
      <div style={{ width: 120, height: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 1, overflow: 'hidden' }}>
        <div style={{
          width: '30%', height: '100%',
          background: 'rgba(255,255,255,0.5)',
          borderRadius: 1,
          animation: 'loadingBar 1.2s ease-in-out infinite',
        }} />
      </div>
    </div>
  );
}

function Desktop() {
  const { windows, openApp } = useDesktop();
  const [ctxMenu, setCtxMenu] = useState(null);
  const [extraItems, setExtraItems] = useState([]);

  const closeCtx = useCallback(() => setCtxMenu(null), []);

  const addFolder = useCallback(() => {
    const id = 'folder-' + Date.now();
    const n = extraItems.filter((i) => i.id.startsWith('folder-')).length + 1;
    setExtraItems((prev) => [...prev, { id, name: 'untitled folder ' + n }]);
  }, [extraItems]);

  const handleDesktopCtx = useCallback((e) => {
    e.preventDefault();
    setCtxMenu({
      x: e.clientX, y: e.clientY,
      items: [
        { label: 'New Folder', action: addFolder, shortcut: '⇧⌘N' },
        { label: 'New File', action: () => {} },
        { sep: true },
        { label: 'Get Info', action: () => {} },
        { label: 'Change Wallpaper...', action: () => {} },
        { sep: true },
        { label: 'Clean Up By', action: () => {}, shortcut: '⌃⌘0' },
        { label: 'Show View Options', action: () => {}, shortcut: '⌘J' },
        { sep: true },
        { label: 'Paste', action: () => {}, shortcut: '⌘V' },
      ],
    });
  }, [addFolder]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        background: '#0d0d1a',
      }}
      onContextMenu={handleDesktopCtx}
    >
      <Wallpaper />
      <MenuBar />
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <DesktopIcons extraItems={extraItems} />
        {windows.map((win) => (
          <Window key={win.id} win={win} />
        ))}
      </div>
      <Dock onContext={closeCtx} />
      <Spotlight />
      {ctxMenu && <ContextMenu {...ctxMenu} onClose={closeCtx} />}
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);

  return loading ? (
    <LoadingScreen onDone={() => setLoading(false)} />
  ) : (
    <DesktopProvider>
      <Desktop />
    </DesktopProvider>
  );
}
