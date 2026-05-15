import { useState, useEffect, useRef } from 'react';
import { useDesktop } from '../context/DesktopContext';
import { APPS, DOCK_ICONS_SVG } from '../data/apps';

export default function Spotlight() {
  const { spotlightOpen, toggleSpotlight, openApp } = useDesktop();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const results = query.trim()
    ? APPS.filter((a) =>
        a.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : APPS.slice(0, 6);

  useEffect(() => {
    if (spotlightOpen) {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [spotlightOpen]);

  useEffect(() => {
    if (!spotlightOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        toggleSpotlight();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((prev) => Math.min(prev + 1, results.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((prev) => Math.max(prev - 1, 0));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const selected = results[selectedIdx];
        if (selected) {
          openApp(selected.id);
          toggleSpotlight();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [spotlightOpen, results, selectedIdx, toggleSpotlight, openApp]);

  if (!spotlightOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        justifyContent: 'center',
        paddingTop: '15vh',
        animation: 'spotlightFadeIn 0.15s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) toggleSpotlight();
      }}
    >
      <div
        style={{
          width: 520,
          maxWidth: '90vw',
          animation: 'slideDown 0.15s ease-out',
        }}
      >
        <div
          style={{
            background: 'rgba(40, 40, 45, 0.95)',
            backdropFilter: 'blur(40px)',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 16px 60px rgba(0,0,0,0.6)',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" style={{ marginRight: 10, flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedIdx(0); }}
              placeholder="Search apps and documents..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'white',
                fontSize: 14,
                fontFamily: 'var(--font-sf)',
              }}
            />
          </div>
          {results.length > 0 && (
            <div style={{ padding: 4 }}>
              {results.map((app, i) => (
                <div
                  key={app.id}
                  onClick={() => { openApp(app.id); toggleSpotlight(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '6px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    background: i === selectedIdx ? 'rgba(255,255,255,0.1)' : 'transparent',
                  }}
                  onMouseEnter={() => setSelectedIdx(i)}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: 'rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16,
                  }}>
                    {app.iconSrc ? (
                      <img src={app.iconSrc} alt="" style={{ width: 20, height: 20 }} />
                    ) : (
                      <svg viewBox={(DOCK_ICONS_SVG[app.id] || {}).viewBox || '0 0 24 24'} width={16} height={16} fill="none">
                        {((DOCK_ICONS_SVG[app.id] || {}).paths || []).map((d, i) => (
                          <path key={i} d={d} fill={(DOCK_ICONS_SVG[app.id] || {}).color || '#888'} />
                        ))}
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: 12.5 }}>{app.name}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ padding: '6px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 16, fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
            <span>↑↓ Navigate</span>
            <span>↵ Open</span>
            <span>⎋ Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
