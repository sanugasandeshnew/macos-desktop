import { useDesktop } from '../context/DesktopContext';

export default function Wallpaper() {
  const { wallpaper } = useDesktop();
  const BASE = import.meta.env.BASE_URL;

  return (
    <img
      src={BASE + 'wallpapers/' + wallpaper}
      alt=""
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        pointerEvents: 'none',
      }}
    />
  );
}
