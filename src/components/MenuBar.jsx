import { useState, useEffect, useRef, useCallback } from 'react';
import { useDesktop } from '../context/DesktopContext';

const MENUS = {
  Finder: [
    { label: 'About This Mac', sep: true },
    { label: 'Settings...', shortcut: '⌘,', action: 'settings' },
    { label: 'Services', sep: true },
    { label: 'Hide Finder', shortcut: '⌘H' },
    { label: 'Hide Others', shortcut: '⌥⌘H', sep: true },
    { label: 'Quit Finder', shortcut: '⌘Q' },
  ],
  Settings: [
    { label: 'System Settings...', shortcut: '⌘,', action: 'settings' },
    { label: 'App Store...', sep: true },
    { label: 'Notifications' },
    { label: 'Sound' },
    { label: 'Network' },
    { label: 'Privacy & Security' },
  ],
  File: [
    { label: 'New Finder Window', shortcut: '⌘N' },
    { label: 'New Folder', shortcut: '⇧⌘N' },
    { label: 'New File', shortcut: '⌃⌘N', sep: true },
    { label: 'Open', shortcut: '⌘O' },
    { label: 'Close Window', shortcut: '⌘W', sep: true },
    { label: 'Get Info', shortcut: '⌘I' },
    { label: 'Rename', shortcut: '↩', sep: true },
    { label: 'Move to Trash', shortcut: '⌘⌫' },
    { label: 'Duplicate', shortcut: '⌘D' },
    { label: 'Make Alias', shortcut: '⌘L', sep: true },
    { label: 'Print', shortcut: '⌘P' },
  ],
  Edit: [
    { label: 'Undo', shortcut: '⌘Z' },
    { label: 'Redo', shortcut: '⇧⌘Z', sep: true },
    { label: 'Cut', shortcut: '⌘X' },
    { label: 'Copy', shortcut: '⌘C' },
    { label: 'Paste', shortcut: '⌘V' },
    { label: 'Select All', shortcut: '⌘A', sep: true },
    { label: 'Find', shortcut: '⌘F' },
    { label: 'Replace...', shortcut: '⌥⌘F' },
  ],
  View: [
    { label: 'as Icons', shortcut: '⌘1' },
    { label: 'as List', shortcut: '⌘2' },
    { label: 'as Columns', shortcut: '⌘3' },
    { label: 'as Gallery', shortcut: '⌘4', sep: true },
    { label: 'Show Path Bar', checked: true },
    { label: 'Show Status Bar' },
    { label: 'Show Tab Bar', sep: true },
    { label: 'Enter Full Screen', shortcut: '⌃⌘F' },
  ],
  Go: [
    { label: 'Back', shortcut: '⌘[' },
    { label: 'Forward', shortcut: '⌘]' },
    { label: 'Enclosing Folder', shortcut: '⌘↑', sep: true },
    { label: 'Recents', shortcut: '⇧⌘F' },
    { label: 'Documents', shortcut: '⇧⌘O' },
    { label: 'Desktop', shortcut: '⇧⌘D' },
    { label: 'Downloads', shortcut: '⌥⌘L' },
    { label: 'Home', shortcut: '⇧⌘H' },
    { label: 'Applications', shortcut: '⇧⌘A' },
    { label: 'Utilities', shortcut: '⇧⌘U', sep: true },
    { label: 'Go to Folder...', shortcut: '⇧⌘G' },
  ],
  Window: [
    { label: 'Minimize', shortcut: '⌘M' },
    { label: 'Zoom', shortcut: '⌥⌘=', sep: true },
    { label: 'Show All Windows', shortcut: '⌃↓' },
    { label: 'Bring All to Front' },
  ],
  Help: [
    { label: 'macOS Desktop Help' },
    { label: 'Search Help' },
    { label: 'About macOS Desktop', sep: true },
    { label: 'Report an Issue' },
  ],
};

function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = time;
  const dateStr = `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  return (
    <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.3 }}>
      {dateStr} {hours}:{mins}
    </span>
  );
}

export default function MenuBar() {
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);
  const { toggleSpotlight, openApp } = useDesktop();

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    };
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleSpotlight();
      }
    };
    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKey);
    };
  }, [toggleSpotlight]);

  return (
    <header
      ref={menuRef}
      style={{
        height: 'var(--menu-bar-height)',
        background: 'var(--menu-bar-bg)',
        backdropFilter: 'blur(30px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(30px) saturate(1.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 10px',
        position: 'relative',
        zIndex: 9999,
        flexShrink: 0,
        borderBottom: '1px solid rgba(0,0,0,0.3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <div
          style={{
            fontSize: 15,
            width: 22,
            textAlign: 'center',
            cursor: 'default',
            marginRight: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
        </div>
        {Object.keys(MENUS).map((menuName) => {
          const isActive = activeMenu === menuName;
          return (
            <div
              key={menuName}
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenu(isActive ? null : menuName);
              }}
              style={{
                padding: '0 9px',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                  fontSize: 12.5,
                  fontWeight: menuName === 'Finder' ? 700 : 400,
                cursor: 'default',
                background: isActive ? 'rgba(255,255,255,0.13)' : 'transparent',
                borderRadius: 3,
                position: 'relative',
              }}
            >
              {menuName}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    minWidth: 220,
                    background: 'rgba(35, 35, 40, 0.97)',
                    backdropFilter: 'blur(30px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 6,
                    padding: '5px 0',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    animation: 'slideDown 0.12s ease-out',
                  }}
                >
                  {MENUS[menuName].map((item, i) => (
                    item.sep ? (
                      <div key={i} style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '4px 8px' }} />
                    ) : (
                      <div
                        key={i}
                        onClick={() => {
                          if (item.action === 'settings') { openApp('settings'); setActiveMenu(null); }
                        }}
                        style={{
                          padding: '3px 14px',
                          fontSize: 12.5,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 40,
                          cursor: 'default',
                          color: item.checked ? 'white' : 'rgba(255,255,255,0.85)',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span>{item.checked ? '✓ ' : ''}{item.label}</span>
                        {item.shortcut && (
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{item.shortcut}</span>
                        )}
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={toggleSpotlight}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            padding: 2,
            opacity: 0.7,
          }}
          title="Spotlight Search (\u2318K)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7">
          <path d="M6 9l6 6 6-6"/>
        </svg>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" opacity="0.7">
          <rect x="2" y="7" width="20" height="13" rx="2"/>
          <line x1="16" y1="20" x2="8" y2="20"/>
        </svg>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="white" opacity="0.7">
          <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
        </svg>
        <Clock />
      </div>
    </header>
  );
}
