import { useState, useCallback } from 'react';
import { useDesktop } from '../context/DesktopContext';

const APP_MAP = { 'macintosh-hd': 'finder', 'Applications': 'finder', 'Documents': 'notes', 'Downloads': 'terminal' };

const BASE = import.meta.env.BASE_URL;
const ICONS = {
  'macintosh-hd': <img src={BASE + 'icons/macintosh.png'} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
  applications: <img src={BASE + 'icons/applications.png'} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
  documents: <img src={BASE + 'icons/documents.png'} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
  downloads: <img src={BASE + 'icons/downloads.png'} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
  user: <img src={BASE + 'icons/user.png'} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
};

export default function DesktopIcons({ extraItems = [], onContext }) {
  const { selectedDesktopIcon, selectDesktopIcon, openApp } = useDesktop();
  const [animatingIcon, setAnimatingIcon] = useState(null);

  const items = [
    { id: 'macintosh-hd', name: 'Macintosh HD' },
    { id: 'applications', name: 'Applications' },
    { id: 'documents', name: 'Documents' },
    { id: 'downloads', name: 'Downloads' },
    { id: 'user', name: 'user' },
    ...extraItems,
  ];

  const handleItemClick = useCallback((item) => {
    selectDesktopIcon(selectedDesktopIcon === item.id ? null : item.id);
    setAnimatingIcon(item.name);
    setTimeout(() => setAnimatingIcon(null), 250);
    if (item.id === 'user') {
      window.open('https://sanugasandesh-portfolio.web.app/', '_blank');
      return;
    }
    const targetId = APP_MAP[item.name] || item.id;
    if (targetId) openApp(targetId);
  }, [selectedDesktopIcon, selectDesktopIcon, openApp]);

  const handleItemContext = useCallback((e, item) => {
    e.preventDefault();
    e.stopPropagation();
    const targetId = APP_MAP[item.name] || item.id;
    if (!onContext) return;
    onContext({
      x: e.clientX, y: e.clientY,
      items: [
        { label: 'Open', action: () => { if (targetId) openApp(targetId); } },
        { label: 'Open in New Window', action: () => {} },
        { sep: true },
        { label: 'Get Info', action: () => {} },
        { sep: true },
        { label: 'Move to Trash', danger: true, action: () => {} },
      ],
    });
  }, [onContext, openApp]);

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      padding: '24px 0', pointerEvents: 'none',
    }}>
      <div style={{
        position: 'absolute', left: 20, top: 22,
        display: 'flex', flexDirection: 'column', gap: 14,
        pointerEvents: 'auto',
      }}>
        {items.map((item) => {
          const isSelected = selectedDesktopIcon === item.id;
          const isAnimating = animatingIcon === item.name;
          return (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              onContextMenu={(e) => handleItemContext(e, item)}
              className={isAnimating ? 'animate-icon-pop' : ''}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                width: 64,
                cursor: 'default',
                padding: '4px 2px',
                borderRadius: 6,
                background: isSelected ? 'rgba(255,255,255,0.12)' : 'transparent',
                outline: isSelected ? '1px solid rgba(255,255,255,0.2)' : 'none',
                transition: 'background 0.12s',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {ICONS[item.id] || (
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                    <path d="M2 6h20l-1 14H3L2 6z" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
                    <rect x="4" y="8" width="16" height="1.5" rx="0.5" fill="rgba(255,255,255,0.25)" />
                    <rect x="4" y="11" width="12" height="1" rx="0.5" fill="rgba(255,255,255,0.15)" />
                    <rect x="4" y="13.5" width="10" height="1" rx="0.5" fill="rgba(255,255,255,0.12)" />
                    <rect x="4" y="16" width="8" height="1" rx="0.5" fill="rgba(255,255,255,0.1)" />
                    <path d="M3 6l1-3h16l1 3" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
                  </svg>
                )}
              </div>
              <span style={{
                fontSize: 10.5, fontWeight: 500, textAlign: 'center',
                textShadow: '0 1px 6px rgba(0,0,0,0.7)',
                lineHeight: 1.2, color: 'white',
                background: isSelected ? 'rgba(0,0,0,0.3)' : 'transparent',
                padding: '1px 6px', borderRadius: 4,
              }}>
                {item.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
