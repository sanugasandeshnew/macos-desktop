import { useState, useCallback } from 'react';
import { DOCK_APPS, APPS, DOCK_ICONS_SVG } from '../data/apps';
import { useDesktop } from '../context/DesktopContext';
import ContextMenu from './ContextMenu';

const BASE_SIZE = 48;

function DockIcon({ appId, meta, open, minimized, onClick, onContext }) {
  const [hover, setHover] = useState(false);
  const [imgError, setImgError] = useState(false);
  const app = APPS.find((a) => a.id === appId);

  const handleContext = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const name = app?.name || appId;
    onContext({
      x: e.clientX, y: e.clientY,
      items: [
        { label: open ? 'Show All Windows' : 'Open', action: () => onClick(), shortcut: '⌘O' },
        { label: 'Open in New Window', action: () => {} },
        { sep: true },
        { label: 'Get Info', action: () => {} },
        { sep: true },
        { label: `Remove from Dock`, danger: true, action: () => {} },
      ],
    });
  }, [appId, app, open, onClick, onContext]);

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: BASE_SIZE,
      height: BASE_SIZE,
    }}>
      <div
        style={{
          position: 'absolute',
          bottom: 'calc(100% + 4px)',
          background: 'rgba(30,30,35,0.95)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          fontSize: 11,
          fontWeight: 600,
          padding: '3px 10px',
          borderRadius: 5,
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          pointerEvents: 'none',
          zIndex: 10,
          opacity: hover ? 1 : 0,
          transform: `translateY(${hover ? '0' : '4px'})`,
          transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
        }}
      >
        <span>{app?.name || appId}</span>
        {minimized && <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>(hidden)</span>}
      </div>
      <button
        onClick={onClick}
        onContextMenu={handleContext}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          width: BASE_SIZE,
          height: BASE_SIZE,
          border: 'none',
          borderRadius: 0,
          background: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition: 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: minimized ? 0.5 : hover ? 0.75 : 1,
        }}
      >
        {app?.iconSrc && !imgError ? (
          <img
            src={app.iconSrc}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={() => setImgError(true)}
          />
        ) : (
          <svg viewBox={meta.viewBox} width={22} height={22} fill="none">
            {meta.paths.map((d, i) => (
              <path key={i} d={d} fill={meta.color} />
            ))}
          </svg>
        )}
        {open && (
          <span
            style={{
              position: 'absolute',
              bottom: 1,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.8)',
            }}
          />
        )}
      </button>
    </div>
  );
}

export default function Dock({ onContext }) {
  const { windows, openApp, focusWindow } = useDesktop();
  const [ctx, setCtx] = useState(null);

  const handleClick = (appId) => {
    const app = APPS.find((a) => a.id === appId);
    if (!app) return;

    const isOpen = windows.some((w) => w.appId === appId && !w.minimized);
    const isMinimized = windows.some((w) => w.appId === appId && w.minimized);

    if (isOpen) {
      const win = windows.find((w) => w.appId === appId && !w.minimized);
      if (win) focusWindow(win.id);
    } else if (isMinimized) {
      const win = windows.find((w) => w.appId === appId);
      if (win) focusWindow(win.id);
    } else {
      openApp(appId);
    }
  };

  const handleCtx = useCallback((menu) => {
    setCtx(menu);
    if (onContext) onContext();
  }, [onContext]);

  return (
    <nav
      style={{
        height: 'var(--dock-height)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingBottom: 6,
        flexShrink: 0,
        zIndex: 9998,
      }}
    >
      <div
        style={{
          background: 'var(--dock-bg)',
          backdropFilter: 'blur(40px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(40px) saturate(1.3)',
          borderRadius: 12,
          padding: '4px 5px',
          display: 'flex',
          gap: 2,
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 0 0 0.5px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        {DOCK_APPS.map((appId) => {
          const meta = DOCK_ICONS_SVG[appId] || { viewBox: '0 0 24 24', color: '#888', paths: [] };
          const open = windows.some((w) => w.appId === appId && !w.minimized);
          const minimized = windows.some((w) => w.appId === appId && w.minimized);

          return (
            <DockIcon
              key={appId}
              appId={appId}
              meta={meta}
              open={open}
              minimized={minimized}
              onClick={() => handleClick(appId)}
              onContext={handleCtx}
            />
          );
        })}
      </div>
      {ctx && <ContextMenu {...ctx} onClose={() => setCtx(null)} />}
    </nav>
  );
}
