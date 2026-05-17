import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { DOCK_APPS, APPS, DOCK_ICONS_SVG } from '../data/apps';
import { useDesktop } from '../context/DesktopContext';
import ContextMenu from './ContextMenu';

const BASE_SIZE = 48;
const MAGNIFY_RADIUS = 160;
const MAX_SCALE = 0.55;

function DockIcon({ appId, meta, open, minimized, onClick, onContext, scale, dockAutoHide, toggleDockAutoHide, magnificationEnabled, toggleMagnification }) {
  const [hover, setHover] = useState(false);
  const [imgError, setImgError] = useState(false);
  const app = APPS.find((a) => a.id === appId);

  const handleContext = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onContext({
      x: e.clientX, y: e.clientY,
      items: [
        { label: open ? 'Show All Windows' : 'Open', action: () => onClick(), shortcut: '\u2318O' },
        { label: 'Open in New Window', action: () => {} },
        { sep: true },
        { label: 'Get Info', action: () => {} },
        { sep: true },
        { label: 'Remove from Dock', danger: true, action: () => {} },
        { sep: true },
        { label: 'Auto-Hide Dock', checked: dockAutoHide, action: () => toggleDockAutoHide() },
        { label: 'Magnification', checked: magnificationEnabled, action: () => toggleMagnification() },
      ],
    });
  }, [appId, open, onClick, onContext, dockAutoHide, toggleDockAutoHide, magnificationEnabled, toggleMagnification]);

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: BASE_SIZE,
        height: BASE_SIZE,
        transform: `scale(${scale})`,
        transformOrigin: 'bottom',
        transition: 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)',
        willChange: 'transform',
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 'calc(100% + 8px)',
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
          borderRadius: 12,
          background: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          opacity: minimized ? 0.5 : 1,
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
              bottom: -4,
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
  const { windows, openApp, focusWindow, dockAutoHide, toggleDockAutoHide, magnificationEnabled, toggleMagnification } = useDesktop();
  const [ctx, setCtx] = useState(null);
  const dockRef = useRef(null);
  const [scales, setScales] = useState(DOCK_APPS.map(() => 1));
  const [gapPadding, setGapPadding] = useState({ gap: 8, padding: '4px 5px' });
  const lastActiveIdRef = useRef(null);
  const [dockVisible, setDockVisible] = useState(false);
  const hideTimeoutRef = useRef(null);

  const showDock = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setDockVisible(true);
  }, []);

  const hideDock = useCallback(() => {
    hideTimeoutRef.current = setTimeout(() => setDockVisible(false), 200);
  }, []);

  useEffect(() => {
    if (!dockAutoHide) {
      setDockVisible(true);
      return;
    }
    setDockVisible(false);
    const onMouseMove = (e) => {
      const nearBottom = window.innerHeight - e.clientY < 12;
      if (nearBottom) showDock();
    };
    document.addEventListener('mousemove', onMouseMove);
    return () => document.removeEventListener('mousemove', onMouseMove);
  }, [dockAutoHide, showDock]);

  const handleClick = useCallback((appId) => {
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
  }, [windows, openApp, focusWindow]);

  const handleCtx = useCallback((menu) => {
    setCtx(menu);
    if (onContext) onContext();
  }, [onContext]);

  const handleDockCtx = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setCtx({
      x: e.clientX, y: e.clientY,
      items: [
        { label: 'Open', action: () => {} },
        { label: 'Open in New Window', action: () => {} },
        { sep: true },
        { label: 'Get Info', action: () => {} },
        { sep: true },
        { label: 'Remove from Dock', danger: true, action: () => {} },
        { sep: true },
        { label: 'Auto-Hide Dock', checked: dockAutoHide, action: () => toggleDockAutoHide() },
        { label: 'Magnification', checked: magnificationEnabled, action: () => toggleMagnification() },
      ],
    });
    if (onContext) onContext();
  }, [onContext, dockAutoHide, toggleDockAutoHide, magnificationEnabled, toggleMagnification]);

  const resetDock = useCallback(() => {
    setScales(DOCK_APPS.map(() => 1));
    setGapPadding({ gap: 8, padding: '4px 5px' });
    lastActiveIdRef.current = null;
  }, []);

  const handleMagnify = useCallback((clientX, clientY, isTouch) => {
    if (!magnificationEnabled) return;
    if (!dockRef.current) return;
    const dockEl = dockRef.current;
    const iconEls = dockEl.querySelectorAll('[data-dock-item]');

    let isNearDock = false;
    let currentActiveId = null;
    let minDist = MAGNIFY_RADIUS;
    const newScales = [];

    iconEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MAGNIFY_RADIUS) {
        isNearDock = true;
        const s = 1 + ((MAGNIFY_RADIUS - dist) / MAGNIFY_RADIUS) * MAX_SCALE;
        newScales.push(s);
        if (dist < minDist) {
          minDist = dist;
          currentActiveId = el.getAttribute('data-dock-item');
        }
      } else {
        newScales.push(1);
      }
    });

    if (isNearDock) {
      setScales(newScales);
      setGapPadding({ gap: 20, padding: '10px 20px' });

      if (isTouch && currentActiveId && currentActiveId !== lastActiveIdRef.current) {
        if (navigator.vibrate) navigator.vibrate(40);
        lastActiveIdRef.current = currentActiveId;
      }
    } else {
      resetDock();
    }
  }, [resetDock, magnificationEnabled]);

  const handleMouseMove = useCallback((e) => {
    handleMagnify(e.clientX, e.clientY, false);
  }, [handleMagnify]);

  useEffect(() => {
    const onTouchMove = (e) => {
      const touch = e.touches[0];
      handleMagnify(touch.clientX, touch.clientY, true);
    };
    const onTouchStart = (e) => {
      const touch = e.touches[0];
      handleMagnify(touch.clientX, touch.clientY, true);
    };
    const onTouchEnd = () => resetDock();

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [handleMagnify, resetDock]);

  const isDockShown = !dockAutoHide || dockVisible;

  return (
    <nav
      style={{
        ...(dockAutoHide ? {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          overflow: 'visible',
        } : {
          height: 'var(--dock-height)',
          flexShrink: 0,
        }),
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingBottom: 6,
        zIndex: 9998,
        pointerEvents: 'none',
      }}
    >
      <div
        ref={dockRef}
        onContextMenu={handleDockCtx}
        onMouseMove={handleMouseMove}
        onMouseEnter={showDock}
        onMouseLeave={() => { resetDock(); hideDock(); }}
        style={{
          background: 'var(--dock-bg)',
          backdropFilter: 'blur(40px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(40px) saturate(1.3)',
          borderRadius: 24,
          padding: gapPadding.padding,
          display: 'flex',
          gap: gapPadding.gap,
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 0 0 0.5px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.3)',
          transition: 'gap 0.15s ease-out, padding 0.15s ease-out, transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease-out',
          willChange: 'gap, padding, transform',
          transform: isDockShown ? 'translateY(0)' : 'translateY(calc(100% + 30px))',
          opacity: isDockShown ? 1 : 0,
          pointerEvents: 'auto',
        }}
      >
        {DOCK_APPS.map((appId, i) => {
          const meta = DOCK_ICONS_SVG[appId] || { viewBox: '0 0 24 24', color: '#888', paths: [] };
          const open = windows.some((w) => w.appId === appId && !w.minimized);
          const minimized = windows.some((w) => w.appId === appId && w.minimized);

          return (
            <div key={appId} data-dock-item={appId}>
              <DockIcon
                appId={appId}
                meta={meta}
                open={open}
                minimized={minimized}
                onClick={() => handleClick(appId)}
                onContext={handleCtx}
                scale={scales[i]}
                dockAutoHide={dockAutoHide}
                toggleDockAutoHide={toggleDockAutoHide}
                magnificationEnabled={magnificationEnabled}
                toggleMagnification={toggleMagnification}
              />
            </div>
          );
        })}
      </div>
      {ctx && <ContextMenu {...ctx} onClose={() => setCtx(null)} />}
    </nav>
  );
}
