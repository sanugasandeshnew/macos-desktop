import { useEffect, useRef } from 'react';

export default function ContextMenu({ x, y, items, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const menuX = Math.min(x, window.innerWidth - 200);
  const menuY = Math.min(y, window.innerHeight - items.length * 30 - 20);

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        left: menuX,
        top: menuY,
        minWidth: 180,
        background: 'rgba(35, 35, 40, 0.97)',
        backdropFilter: 'blur(30px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8,
        padding: '4px 0',
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        zIndex: 100000,
        animation: 'fadeIn 0.08s ease-out',
      }}
    >
      {items.map((item, i) => (
        item.sep ? (
          <div key={i} style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 8px' }} />
        ) : (
          <div
            key={i}
            onClick={() => { item.action(); onClose(); }}
            style={{
              padding: '4px 14px',
              fontSize: 12.5,
              cursor: 'default',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: item.danger ? '#ff6b6b' : 'rgba(255,255,255,0.85)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.shortcut && (
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{item.shortcut}</span>
            )}
          </div>
        )
      ))}
    </div>
  );
}
