import { useState, useRef, useEffect } from 'react';

function TopToggleBar({ open }) {
  return (
    <div style={{
      width: '100%', height: 5, borderRadius: 3, position: 'relative',
      border: open ? 'none' : '1px solid rgba(255,255,255,0.9)',
      background: open ? 'rgba(255,255,255,0.9)' : 'transparent',
      transition: 'all 0.2s',
    }}>
      <div style={{
        position: 'absolute', width: 3, height: 3, borderRadius: '50%',
        background: open ? '#007aff' : 'rgba(255,255,255,0.9)',
        top: 0, bottom: 0, margin: 'auto',
        left: open ? 11 : 1, transition: 'all 0.2s',
      }} />
    </div>
  );
}

function BottomToggleBar({ open }) {
  return (
    <div style={{
      width: '100%', height: 5, borderRadius: 3, position: 'relative',
      background: open ? 'transparent' : 'rgba(255,255,255,0.9)',
      border: open ? '1px solid rgba(255,255,255,0.9)' : 'none',
      transition: 'all 0.2s',
    }}>
      <div style={{
        position: 'absolute', width: 3, height: 3, borderRadius: '50%',
        background: open ? 'rgba(255,255,255,0.9)' : '#007aff',
        top: 0, bottom: 0, margin: 'auto',
        right: open ? 11 : 1, transition: 'all 0.2s',
      }} />
    </div>
  );
}

export default function ControlCenter() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const cb = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const keyCb = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', cb);
    document.addEventListener('keydown', keyCb);
    return () => {
      document.removeEventListener('mousedown', cb);
      document.removeEventListener('keydown', keyCb);
    };
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <div
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4,
          width: 16, height: 18, cursor: 'pointer', padding: '2px 0',
          background: open ? 'rgba(255,255,255,0.2)' : 'transparent',
          borderRadius: 4, transition: 'background 0.1s',
        }}
      >
        <TopToggleBar open={open} />
        <BottomToggleBar open={open} />
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 34, right: 0, zIndex: 99999,
          animation: 'openPanel 0.14s cubic-bezier(0.2,0.8,0.2,1)',
          transformOrigin: 'top right',
        }}>
          <div style={{
            width: 310, background: 'rgba(235,243,250,0.75)',
            backdropFilter: 'blur(40px) saturate(130%)',
            WebkitBackdropFilter: 'blur(40px) saturate(130%)',
            borderRadius: 18, padding: 12,
            boxShadow: '0 15px 35px rgba(0,0,0,0.25)',
            border: '0.5px solid rgba(255,255,255,0.4)',
            display: 'flex', flexDirection: 'column', gap: 10,
            color: '#1d1d1f',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 10 }}>
              <PanelCard>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '10px 8px' }}>
                  <NetItem icon={<i className="fa-solid fa-wifi" />} color="#007aff" title="Wi-Fi" subtitle="Home" />
                  <NetItem icon={<i className="fa-solid fa-bluetooth-b" />} color="#007aff" title="Bluetooth" subtitle="On" />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: 'rgba(0,0,0,0.05)', color: '#007aff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
                      }}>
                        <i className="fa-solid fa-circle-dot" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>AirDrop</span>
                        <span style={{ fontSize: 10, color: '#6e6e73', fontWeight: 500 }}>Contacts Only</span>
                      </div>
                    </div>
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: 10, color: '#86868b' }} />
                  </div>
                </div>
              </PanelCard>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <PanelCard>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px' }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: 'rgba(0,0,0,0.05)', color: '#515154',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
                    }}>
                      <i className="fa-solid fa-moon" />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Do Not Disturb</span>
                  </div>
                </PanelCard>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <PanelCard>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', padding: 10, height: 64 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                        <i className="fa-solid fa-keyboard" />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.2, marginTop: 4 }}>Keyboard Brightness</span>
                    </div>
                  </PanelCard>
                  <PanelCard>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', padding: 10, height: 64 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                        <i className="fa-solid fa-display" />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.2, marginTop: 4 }}>AirPlay Display</span>
                    </div>
                  </PanelCard>
                </div>
              </div>
            </div>

            <SliderCard label="Display" icon="fa-solid fa-sun" fill={58} />
            <SliderCard label="Sound" icon="fa-solid fa-volume-high" fill={42} />

            <PanelCard>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 7, background: '#121212', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', color: '#fff', fontSize: 16 }}>
                    <i className="fa-solid fa-music" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Dragonball Durag</span>
                    <span style={{ fontSize: 11, color: '#6e6e73', fontWeight: 500, marginTop: 1 }}>Thundercat - It Is What It Is</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingRight: 8 }}>
                  <i className="fa-solid fa-play" style={{ fontSize: 14, color: '#3a3a3c' }} />
                  <i className="fa-solid fa-forward" style={{ fontSize: 14, color: '#3a3a3c' }} />
                </div>
              </div>
            </PanelCard>
          </div>
        </div>
      )}
    </div>
  );
}

function NetItem({ icon, color, title, subtitle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 26, height: 26, borderRadius: '50%',
        background: color, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
      }}>
        {icon}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{title}</span>
        <span style={{ fontSize: 10, color: '#6e6e73', fontWeight: 500 }}>{subtitle}</span>
      </div>
    </div>
  );
}

function PanelCard({ children }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.5)',
      border: '0.5px solid rgba(255,255,255,0.3)',
      borderRadius: 14,
    }}>
      {children}
    </div>
  );
}

function SliderCard({ label, icon, fill }) {
  return (
    <PanelCard>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: '8px 12px' }}>
        <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
        <div style={{ height: 22, background: 'rgba(0,0,0,0.06)', borderRadius: 11, position: 'relative', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: fill + '%', background: '#fff',
            borderRadius: '11px 0 0 11px', display: 'flex', alignItems: 'center',
            paddingLeft: 8, boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
          }}>
            <i className={icon} style={{ fontSize: 11, color: '#515154' }} />
          </div>
        </div>
      </div>
    </PanelCard>
  );
}
