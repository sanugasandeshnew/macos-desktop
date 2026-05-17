import { useRef, useState, useCallback, useEffect } from 'react';
import { useDesktop } from '../context/DesktopContext';
import { DOCK_ICONS_SVG } from '../data/apps';

export default function Window({ win }) {
  const ctx = useDesktop();
  const { closeWindow, minimizeWindow, setActive, moveWindow, resizeWindow, maximizeWindow, maximizedWindowId } = ctx;
  const isActive = ctx.activeWindowId === win.id;
  const [dragging, setDragging] = useState(null);
  const [resizing, setResizing] = useState(null);
  const [size, setSize] = useState({ w: win.width, h: win.height });
  const [exiting, setExiting] = useState(false);
  const [minimizing, setMinimizing] = useState(false);
  const [animDone, setAnimDone] = useState(false);
  const winRef = useRef(null);
  const posRef = useRef({ x: win.x, y: win.y });
  const isMaximized = maximizedWindowId === win.id;

  useEffect(() => {
    if (!isMaximized && !minimizing) {
      setSize({ w: win.width, h: win.height });
      posRef.current = { x: win.x, y: win.y };
    }
  }, [win.width, win.height, win.x, win.y, isMaximized, minimizing]);

  useEffect(() => {
    if (!dragging && !resizing) return;
    const el = winRef.current;
    if (!el) return;
    const handleMouseMove = (e) => {
      if (dragging && !isMaximized) {
        const dx = e.clientX - dragging.mx;
        const dy = e.clientY - dragging.my;
        posRef.current.x = Math.max(-100, Math.min(window.innerWidth - 200, dragging.sx + dx));
        posRef.current.y = Math.max(0, Math.min(window.innerHeight - 60, dragging.sy + dy));
        el.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
      }
      if (resizing && !isMaximized) {
        const dx = e.clientX - resizing.mx;
        const dy = e.clientY - resizing.my;
        const newW = Math.max(400, resizing.sw + dx);
        const newH = Math.max(250, resizing.sh + dy);
        el.style.width = newW + 'px';
        el.style.height = newH + 'px';
      }
    };
    const handleMouseUp = () => {
      if (dragging && !isMaximized) moveWindow(win.id, posRef.current.x, posRef.current.y);
      if (resizing && !isMaximized) {
        resizeWindow(win.id, parseInt(el.style.width), parseInt(el.style.height));
        setSize({ w: parseInt(el.style.width), h: parseInt(el.style.height) });
      }
      setDragging(null);
      setResizing(null);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, resizing, win.id, moveWindow, resizeWindow, isMaximized]);

  const handleTitleMouseDown = useCallback((e) => {
    if (isMaximized) return;
    setActive(win.id);
    if (e.target.closest('.window-btn')) return;
    setDragging({ mx: e.clientX, my: e.clientY, sx: posRef.current.x, sy: posRef.current.y });
  }, [win.id, setActive, isMaximized]);

  const handleResizeStart = useCallback((e) => {
    if (isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    setResizing({ mx: e.clientX, my: e.clientY, sw: size.w, sh: size.h });
  }, [size, isMaximized]);

  const handleClose = (e) => {
    e.stopPropagation();
    setExiting(true);
    setTimeout(() => closeWindow(win.id), 150);
  };

  const handleMinimize = (e) => {
    e.stopPropagation();
    setMinimizing(true);
    setTimeout(() => {
      minimizeWindow(win.id);
      setMinimizing(false);
    }, 250);
  };

  const handleGreenClick = (e) => {
    e.stopPropagation();
    if (isMaximized) {
      maximizeWindow(win.id, {
        prevX: win._prevX || 100, prevY: win._prevY || 60,
        prevW: win._prevW || win.width, prevH: win._prevH || win.height,
      });
    } else {
      maximizeWindow(win.id, {
        prevX: posRef.current.x, prevY: posRef.current.y, prevW: size.w, prevH: size.h,
      });
    }
  };

  useEffect(() => {
    const el = winRef.current;
    if (!el) return;
    const handler = () => setAnimDone(true);
    el.addEventListener('animationend', handler);
    return () => el.removeEventListener('animationend', handler);
  }, []);

  const appContent = getAppContent(win.appId);

  const displayW = isMaximized ? window.innerWidth : Math.max(400, size.w);
  const displayH = isMaximized ? window.innerHeight - 28 - 64 : Math.max(250, size.h);

  if (win.minimized && !minimizing) return null;

  const animClass = exiting
    ? 'animate-window-close'
    : minimizing
    ? 'animate-minimize'
    : animDone
    ? ''
    : 'animate-window-open';

  return (
    <div
      ref={winRef}
      className={animClass}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: displayW,
        height: displayH,
        transform: isMaximized ? 'translate(0, 0)' : `translate(${posRef.current.x}px, ${posRef.current.y}px)`,
        willChange: dragging || resizing ? 'transform' : 'auto',
        background: isActive ? 'rgba(35, 35, 40, 0.97)' : 'rgba(25, 25, 30, 0.94)',
        backdropFilter: 'blur(40px)',
        borderRadius: isMaximized ? 0 : 'var(--radius-window)',
        boxShadow: isActive
          ? '0 20px 60px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.12)'
          : '0 8px 30px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: win.zIndex,
        overflow: 'hidden',
        pointerEvents: exiting ? 'none' : 'auto',
        transition: isMaximized
          ? 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
          : (dragging || resizing ? 'none' : 'box-shadow 0.2s, background 0.2s'),
        transformOrigin: 'center center',
      }}
      onMouseDown={() => setActive(win.id)}
    >
      <div
        onMouseDown={handleTitleMouseDown}
        style={{
          height: 38,
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        <div className="window-btn" style={{ display: 'flex', gap: 8, position: 'relative', zIndex: 2 }}>
          <button onClick={handleClose}
            style={{ width: 12, height: 12, borderRadius: '50%', border: 'none', background: isActive ? '#ff5f57' : '#555', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'transparent', transition: 'color 0.1s', lineHeight: 1, opacity: isActive ? 1 : 0.4 }}
            onMouseEnter={(e) => { if (isActive) { e.currentTarget.style.color = '#4a0000'; e.currentTarget.textContent = '\u2715'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'transparent'; e.currentTarget.textContent = ''; }}
          />
          <button onClick={handleMinimize}
            style={{ width: 12, height: 12, borderRadius: '50%', border: 'none', background: isActive ? '#febc2e' : '#555', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'transparent', transition: 'color 0.1s', lineHeight: 1, opacity: isActive ? 1 : 0.4 }}
            onMouseEnter={(e) => { if (isActive) { e.currentTarget.style.color = '#5a4000'; e.currentTarget.textContent = '\u2212'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'transparent'; e.currentTarget.textContent = ''; }}
          />
          <button onClick={handleGreenClick}
            style={{ width: 12, height: 12, borderRadius: '50%', border: 'none', background: isActive ? '#28c840' : '#555', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'transparent', transition: 'color 0.1s', lineHeight: 1, opacity: isActive ? 1 : 0.4 }}
            onMouseEnter={(e) => { if (isActive) { e.currentTarget.style.color = '#003a00'; e.currentTarget.textContent = isMaximized ? '\u2750' : '\u2922'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'transparent'; e.currentTarget.textContent = ''; }}
          />
        </div>
        <div style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          fontSize: 12, fontWeight: 600, color: isActive ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)',
          display: 'flex', alignItems: 'center', gap: 6, pointerEvents: 'none', opacity: isActive ? 1 : 0.5,
        }}>
          {win.iconSrc ? (
            <img src={win.iconSrc} alt="" style={{ width: 14, height: 14 }} />
          ) : (
            <svg viewBox={(DOCK_ICONS_SVG[win.appId] || {}).viewBox || '0 0 24 24'} width={12} height={12} fill="none">
              {((DOCK_ICONS_SVG[win.appId] || {}).paths || []).map((d, i) => (
                <path key={i} d={d} fill={(DOCK_ICONS_SVG[win.appId] || {}).color || '#888'} />
              ))}
            </svg>
          )}
          <span>{win.name}</span>
        </div>
      </div>
      <div className="window-content" style={{
        flex: 1, overflow: 'auto', color: 'white', fontSize: 13, position: 'relative',
        opacity: isActive ? 1 : 0.6, transition: 'opacity 0.15s',
      }}>
        {appContent}
      </div>
      {!isMaximized && (
        <div onMouseDown={handleResizeStart} style={{
          position: 'absolute', right: 0, bottom: 0, width: 16, height: 16,
          cursor: 'nwse-resize', zIndex: 10,
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10" style={{ position: 'absolute', right: 3, bottom: 3, opacity: 0.15 }}>
            <path d="M0 10 L10 0 L10 10 Z" fill="white" />
          </svg>
        </div>
      )}
    </div>
  );
}

function getAppContent(appId) {
  switch (appId) {
    case 'finder': return <FinderContent />;
    case 'terminal': return <TerminalContent />;
    case 'vscode': return <VSCodeContent />;
    case 'safari': return <SafariContent />;
    case 'notes': return <NotesContent />;
    case 'music': return <MusicContent />;
    case 'photos': return <PhotosContent />;
    case 'settings': return <SettingsContent />;
    case 'airdrop': return <AirDropContent />;
    case 'textedit': return <TextEditContent />;
    case 'wallpaper': return <WallpaperContent />;
    default: return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>This app has no content</div>;
  }
}

function FinderContent() {
  const folders = [
    { name: 'Applications', icon: '📁', count: '24 items', size: '1.2 GB' },
    { name: 'Desktop', icon: '🖥️', count: '5 items', size: '340 KB' },
    { name: 'Documents', icon: '📄', count: '12 items', size: '2.1 MB' },
    { name: 'Downloads', icon: '⬇️', count: '8 items', size: '156 MB' },
    { name: 'Movies', icon: '🎬', count: '3 items', size: '4.5 GB' },
    { name: 'Music', icon: '🎵', count: '42 items', size: '890 MB' },
    { name: 'Pictures', icon: '🖼️', count: '57 items', size: '1.8 GB' },
    { name: 'macOS Desktop', icon: '💻', count: 'Project', size: '--' },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 20, padding: '6px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
        <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Favorites</span>
        <span>iCloud Drive</span>
        <span>AirDrop</span>
        <span>Recents</span>
        <span>Applications</span>
        <span>Desktop</span>
      </div>
      <div style={{ display: 'flex', fontSize: 11, color: 'rgba(255,255,255,0.4)', padding: '4px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ flex: 3 }}>Name</span>
        <span style={{ flex: 1, textAlign: 'right' }}>Size</span>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {folders.map((f) => (
          <div key={f.name} style={{ display: 'flex', alignItems: 'center', padding: '5px 16px', fontSize: 12, cursor: 'default', borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.1s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ marginRight: 10, fontSize: 16 }}>{f.icon}</span>
            <span style={{ flex: 3, fontWeight: 500 }}>{f.name}</span>
            <span style={{ flex: 1, textAlign: 'right', color: 'rgba(255,255,255,0.4)' }}>{f.size}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TerminalContent() {
  const [cmd, setCmd] = useState('');
  const [history, setHistory] = useState([
    { text: 'macOS Desktop [Version 15.0]', type: 'system' },
    { text: 'Last login: ' + new Date().toLocaleString(), type: 'system' },
    { text: '', type: 'spacer' },
    { text: '', type: 'prompt' },
  ]);
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = () => inputRef.current?.focus();
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const newH = [...history];
      newH[newH.length - 1] = { text: `user@macbook ~ % ${cmd}`, type: 'input' };

      if (cmd.toLowerCase() === 'neofetch') {
        newH.push({ text: '              macOS Desktop 15.0', type: 'output' });
        newH.push({ text: '  Kernel:       React 19', type: 'output' });
        newH.push({ text: '  Shell:        zsh 5.9', type: 'output' });
        newH.push({ text: `  Resolution:   ${window.innerWidth}x${window.innerHeight}`, type: 'output' });
        newH.push({ text: '  CPU:          Apple M4 Pro', type: 'output' });
        newH.push({ text: '  Memory:       16384MB', type: 'output' });
      } else if (cmd.toLowerCase() === 'ls') {
        newH.push({ text: 'Applications\tDesktop\tDocuments\tDownloads', type: 'output' });
        newH.push({ text: 'Movies\tMusic\tPictures', type: 'output' });
      } else if (cmd.toLowerCase() === 'clear') {
        setHistory([{ text: '', type: 'prompt' }]);
        setCmd('');
        return;
      } else if (cmd.toLowerCase() === 'pwd') {
        newH.push({ text: '/Users/user', type: 'output' });
      } else if (cmd.toLowerCase() === 'whoami') {
        newH.push({ text: 'user', type: 'output' });
      } else if (cmd.toLowerCase() === 'date') {
        newH.push({ text: new Date().toString(), type: 'output' });
      } else if (cmd.toLowerCase() === 'echo hello') {
        newH.push({ text: 'hello', type: 'output' });
      } else if (cmd.toLowerCase() === 'cd ..') {
        newH.push({ text: 'Permission denied: going up is too mainstream', type: 'error' });
      } else if (cmd.toLowerCase() === 'sudo rm -rf /') {
        newH.push({ text: 'Nice try. This is a simulated macOS.', type: 'error' });
      } else if (cmd.trim()) {
        newH.push({ text: `zsh: command not found: ${cmd}`, type: 'error' });
      }

      newH.push({ text: '', type: 'prompt' });
      setHistory(newH);
      setCmd('');
    }
  };

  return (
    <div style={{ background: '#1a1a2e', height: '100%', padding: 12, fontFamily: 'var(--font-sf-mono)', fontSize: 12, overflow: 'auto', whiteSpace: 'pre', cursor: 'text' }}
      onClick={() => inputRef.current?.focus()}>
      {history.map((line, i) => {
        if (line.type === 'spacer') return <div key={i} style={{ height: 8 }} />;
        return (
          <div key={i} style={{
            color: line.type === 'error' ? '#ff6b6b' : line.type === 'output' ? '#50fa7b' :
                   line.type === 'input' ? '#f8f8f2' : line.type === 'system' ? '#6272a4' : '#50fa7b',
            minHeight: 16,
          }}>
            {line.text}
          </div>
        );
      })}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ color: '#50fa7b', flexShrink: 0 }}>user@macbook ~ % </span>
        <input
          ref={inputRef}
          autoFocus
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ background: 'transparent', border: 'none', outline: 'none', color: '#f8f8f2',
            fontFamily: 'var(--font-sf-mono)', fontSize: 12, flex: 1, caretColor: '#f8f8f2' }}
        />
      </div>
    </div>
  );
}

function VSCodeContent() {
  const files = [
    { name: 'index.html', icon: '🌐', active: true },
    { name: 'style.css', icon: '🎨' },
    { name: 'app.js', icon: '📜' },
    { name: 'README.md', icon: '📄' },
    { name: 'package.json', icon: '📋' },
  ];

  return (
    <div style={{ height: '100%', display: 'flex' }}>
      <div style={{ width: 200, background: 'rgba(0,0,0,0.25)', padding: '8px 0', overflow: 'auto', borderRight: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1.2, padding: '4px 16px', marginBottom: 4 }}>Explorer</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1.2, padding: '4px 16px' }}>macOS-Desktop</div>
        <div style={{ marginLeft: 8 }}>
          {files.map((f) => (
            <div key={f.name} style={{
              padding: '3px 8px 3px 28px', fontSize: 12, borderRadius: 4,
              color: f.active ? 'white' : 'rgba(255,255,255,0.65)',
              background: f.active ? 'rgba(255,255,255,0.08)' : 'transparent',
              cursor: 'default', display: 'flex', alignItems: 'center', gap: 6,
              transition: 'background 0.1s',
            }}
              onMouseEnter={(e) => { if (!f.active) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={(e) => { if (!f.active) e.currentTarget.style.background = 'transparent'; }}
            >
              <span>{f.icon}</span>
              {f.name}
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', fontSize: 11, background: 'rgba(0,0,0,0.15)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ padding: '4px 14px', background: 'rgba(255,255,255,0.05)', color: 'white', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#4a9eff' }}>●</span> index.html
          </div>
        </div>
        <div style={{ flex: 1, padding: 12, overflow: 'auto' }}>
          <pre style={{ fontFamily: 'var(--font-sf-mono)', fontSize: 11.5, lineHeight: 1.7, color: '#9cdcfe' }}>
{`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>macOS Desktop</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>`}
          </pre>
        </div>
      </div>
    </div>
  );
}

function SafariContent() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 8, padding: '6px 12px', background: 'rgba(0,0,0,0.15)', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <button style={{ width: 22, height: 22, border: 'none', borderRadius: 4, background: 'rgba(255,255,255,0.06)', cursor: 'pointer', color: 'white', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.1s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          >◀</button>
          <button style={{ width: 22, height: 22, border: 'none', borderRadius: 4, background: 'rgba(255,255,255,0.06)', cursor: 'pointer', color: 'white', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.1s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          >▶</button>
        </div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 5, padding: '4px 10px', fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z"/></svg>
          apple.com
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', gap: 16 }}>
        <div style={{ fontSize: 56, opacity: 0.8 }}>🌐</div>
        <h2 style={{ color: 'white', fontSize: 20, fontWeight: 600 }}>Safari</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Your new start page</p>
        <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
          {[
            { name: 'Apple', url: 'apple.com' },
            { name: 'Google', url: 'google.com' },
            { name: 'GitHub', url: 'github.com' },
            { name: 'Wikipedia', url: 'wikipedia.org' },
          ].map((s) => (
            <div key={s.name} style={{ textAlign: 'center', cursor: 'default', padding: 8, borderRadius: 10, transition: 'background 0.15s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 6 }}>🔗</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{s.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotesContent() {
  const notes = ['Getting Started', 'Shopping List', 'Project Ideas', 'Meeting Notes', 'Book List'];
  const [activeNote, setActiveNote] = useState(0);

  const content = [
    'Welcome to Notes! 📝\n\nNotes makes it easy to jot down thoughts, create checklists, and organize your ideas. Everything syncs across your devices with iCloud.\n\n→ Type anything you want\n→ Create multiple notes\n→ Organize with folders\n→ Search across all notes',
    '🥑 Groceries\n\n• Avocados (2)\n• Bread\n• Eggs (1 dozen)\n• Milk\n• Spinach\n• Chicken breast\n• Rice\n• Olive oil',
    '🎯 Project Ideas\n\n1. macOS Desktop Simulator ✅\n2. Weather app with animations\n3. Markdown editor\n4. Terminal-based games\n5. Personal dashboard',
    '📋 Design Review\n\n• Update color palette\n• Fix responsive layout\n• Add transition animations\n• Review accessibility\n• Test on mobile devices',
    '📚 Reading\n\n• Atomic Habits - James Clear\n• The Pragmatic Programmer\n• Designing Data-Intensive Applications\n• Clean Code - Robert C. Martin',
  ];

  return (
    <div style={{ height: '100%', display: 'flex' }}>
      <div style={{ width: 170, background: 'rgba(0,0,0,0.15)', padding: '8px 0', overflow: 'auto', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ padding: '4px 12px', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>iCloud</div>
        {notes.map((n, i) => (
          <div key={n} onClick={() => setActiveNote(i)} style={{
            padding: '6px 12px', fontSize: 11.5, cursor: 'default',
            background: i === activeNote ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: i === activeNote ? 'white' : 'rgba(255,255,255,0.65)',
            fontWeight: i === activeNote ? 600 : 400,
            borderLeft: i === activeNote ? '2px solid #4a9eff' : '2px solid transparent',
            transition: 'all 0.15s',
          }}>{n}</div>
        ))}
      </div>
      <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'rgba(255,255,255,0.9)' }}>{notes[activeNote]}</div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
          {content[activeNote]}
        </div>
      </div>
    </div>
  );
}

function MusicContent() {
  const tracks = [
    { title: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera', time: '5:55' },
    { title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', time: '3:20' },
    { title: 'Hotel California', artist: 'Eagles', album: 'Hotel California', time: '6:30' },
    { title: 'Stairway to Heaven', artist: 'Led Zeppelin', album: 'Led Zeppelin IV', time: '8:02' },
    { title: 'Imagine', artist: 'John Lennon', album: 'Imagine', time: '3:04' },
    { title: 'Billie Jean', artist: 'Michael Jackson', album: 'Thriller', time: '4:54' },
    { title: 'Rolling in the Deep', artist: 'Adele', album: '21', time: '3:48' },
    { title: 'Smells Like Teen Spirit', artist: 'Nirvana', album: 'Nevermind', time: '5:01' },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 20, background: 'linear-gradient(180deg, rgba(255,77,77,0.15) 0%, transparent 100%)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: 10, background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, boxShadow: '0 4px 16px rgba(255,77,77,0.3)' }}>🎵</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>macOS Hits</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>8 songs · Updated 2024</div>
        </div>
      </div>
      <div style={{ display: 'flex', padding: '8px 20px', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ flex: 3 }}>Title</span>
        <span style={{ flex: 2 }}>Artist</span>
        <span style={{ flex: 2 }}>Album</span>
        <span style={{ width: 40, textAlign: 'right' }}>Time</span>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {tracks.map((t, i) => (
          <div key={i} style={{
            display: 'flex', padding: '6px 20px', fontSize: 12, cursor: 'default',
            borderBottom: '1px solid rgba(255,255,255,0.03)',
            background: i === 0 ? 'rgba(255,255,255,0.04)' : 'transparent',
            transition: 'background 0.1s',
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            onMouseLeave={(e) => { e.currentTarget.style.background = i === 0 ? 'rgba(255,255,255,0.04)' : 'transparent'; }}
          >
            <span style={{ flex: 3, color: i === 0 ? 'white' : 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 8 }}>
              {i === 0 && <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#ff4d4d', display: 'inline-block' }} />}
              <span>{t.title}</span>
            </span>
            <span style={{ flex: 2, color: 'rgba(255,255,255,0.4)' }}>{t.artist}</span>
            <span style={{ flex: 2, color: 'rgba(255,255,255,0.3)' }}>{t.album}</span>
            <span style={{ width: 40, textAlign: 'right', color: 'rgba(255,255,255,0.3)' }}>{t.time}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: '8px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 24, height: 24, borderRadius: 4, background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, position: 'relative' }}>
          <div style={{ width: '30%', height: '100%', background: '#ff4d4d', borderRadius: 2 }} />
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>1:48 / 5:55</div>
      </div>
    </div>
  );
}

function PhotosContent() {
  const photos = [
    { emoji: '🏔️', label: 'Mountains' }, { emoji: '🌊', label: 'Ocean' },
    { emoji: '🌅', label: 'Sunset' }, { emoji: '🌲', label: 'Forest' },
    { emoji: '🌸', label: 'Cherry Blossom' }, { emoji: '🏖️', label: 'Beach' },
    { emoji: '🌃', label: 'Night City' }, { emoji: '🎆', label: 'Fireworks' },
    { emoji: '🌈', label: 'Rainbow' }, { emoji: '🏯', label: 'Temple' },
    { emoji: '🌋', label: 'Volcano' }, { emoji: '🏝️', label: 'Island' },
  ];

  return (
    <div style={{ height: '100%', overflow: 'auto', padding: 16, background: 'rgba(0,0,0,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Photos</span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>12 photos</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 4 }}>
        {photos.map((p, i) => (
          <div key={i} style={{
            borderRadius: 6, overflow: 'hidden', aspectRatio: '1',
            background: `linear-gradient(135deg, hsla(${i * 30}, 50%, 30%, 0.4), hsla(${i * 30 + 60}, 40%, 20%, 0.3))`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'default', transition: 'transform 0.15s, box-shadow 0.15s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <span style={{ fontSize: 28 }}>{p.emoji}</span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{p.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AirDropContent() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at center, rgba(74,158,255,0.1) 0%, transparent 60%)', gap: 8 }}>
      <div style={{ width: 80, height: 80, borderRadius: 20, background: 'rgba(74,158,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
        <svg width={40} height={40} viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm4-5.5c0 1.66-1.34 3-3 3s-3-1.34-3-3h2c0 .55.45 1 1 1s1-.45 1-1h2z" fill="#4a9eff"/>
        </svg>
      </div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>AirDrop</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Share wirelessly with nearby devices</div>
      <div style={{ marginTop: 16, display: 'flex', gap: 20 }}>
        {['👤', '👤', '👤'].map((p, i) => (
          <div key={i} style={{ textAlign: 'center', padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          >
            <div style={{ fontSize: 32, marginBottom: 4 }}>{p}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Device {i + 1}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>Make sure Wi-Fi and Bluetooth are on</div>
    </div>
  );
}

function TextEditContent() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 6, padding: '4px 12px', background: 'rgba(0,0,0,0.15)', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 11, alignItems: 'center' }}>
        <button style={{ border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '3px 6px', borderRadius: 4, fontSize: 11, transition: 'background 0.1s' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >New</button>
        <button style={{ border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '3px 6px', borderRadius: 4, fontSize: 11, transition: 'background 0.1s' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >Open</button>
        <button style={{ border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '3px 6px', borderRadius: 4, fontSize: 11, transition: 'background 0.1s' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >Save</button>
        <span style={{ flex: 1 }} />
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>Plain Text · 0 words</span>
      </div>
      <textarea
        placeholder="Start typing..."
        style={{
          flex: 1, background: 'transparent', border: 'none', outline: 'none', resize: 'none',
          padding: 20, fontSize: 14, lineHeight: 1.8, color: 'rgba(255,255,255,0.8)',
          fontFamily: 'var(--font-sf-mono, monospace)',
        }}
      />
    </div>
  );
}

function SettingsContent() {
  const items = [
    { icon: '📶', label: 'Wi-Fi', desc: 'Connected to Home Network' },
    { icon: '🔵', label: 'Bluetooth', desc: 'On' },
    { icon: '🔊', label: 'Sound', desc: 'Internal Speakers' },
    { icon: '🖥️', label: 'Display', desc: '1920 × 1080' },
    { icon: '🔋', label: 'Battery', desc: '87% charged' },
    { icon: '🎨', label: 'Appearance', desc: 'Dark Mode' },
    { icon: '🖱️', label: 'Trackpad', desc: 'All gestures enabled' },
    { icon: '⌨️', label: 'Keyboard', desc: 'US English' },
    { icon: '🔒', label: 'Privacy & Security', desc: 'No issues' },
    { icon: '☁️', label: 'iCloud', desc: 'Synced' },
  ];

  return (
    <div style={{ height: '100%', display: 'flex' }}>
      <div style={{ width: 180, background: 'rgba(0,0,0,0.15)', padding: '8px 0', overflow: 'auto', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ padding: '4px 16px', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>System Settings</div>
        {items.map((item) => (
          <div key={item.label} style={{
            padding: '5px 16px', fontSize: 12, cursor: 'default', display: 'flex', alignItems: 'center', gap: 10,
            color: 'rgba(255,255,255,0.7)', borderLeft: '2px solid transparent',
            transition: 'all 0.12s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
          >
            <span style={{ fontSize: 14 }}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>System Settings</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.map((item) => (
            <div key={item.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 16px', borderRadius: 8, cursor: 'default',
              background: 'rgba(255,255,255,0.03)', transition: 'background 0.12s',
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{item.desc}</div>
                </div>
              </div>
              <div style={{ width: 44, height: 24, borderRadius: 12, background: '#28c840', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, right: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const WALLPAPERS = [
  { name: 'geranimo-bKhETeDV1WM-unsplash.jpg', label: 'Squirrel' },
  { name: 'jack-anstey-XVoyX7l9ocY-unsplash.jpg', label: 'Abstract' },
  { name: 'luca-bravo-ii5JY_46xH0-unsplash.jpg', label: 'Dark' },
];

function WallpaperContent() {
  const { wallpaper, setWallpaper } = useDesktop();
  const BASE = import.meta.env.BASE_URL;

  return (
    <div style={{ height: '100%', overflow: 'auto', padding: 20 }}>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Wallpaper</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {WALLPAPERS.map((wp) => (
          <div
            key={wp.name}
            onClick={() => setWallpaper(wp.name)}
            style={{
              borderRadius: 10,
              overflow: 'hidden',
              cursor: 'pointer',
              border: wallpaper === wp.name ? '2px solid #4a9eff' : '2px solid transparent',
              transition: 'border 0.15s',
            }}
          >
            <img
              src={BASE + 'wallpapers/' + wp.name}
              alt={wp.label}
              style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
            />
            <div style={{
              padding: '6px 10px', fontSize: 12, fontWeight: 500,
              background: wallpaper === wp.name ? 'rgba(74,158,255,0.15)' : 'transparent',
            }}>
              {wp.label}
              {wallpaper === wp.name && <span style={{ float: 'right', color: '#4a9eff' }}>\u2713</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
