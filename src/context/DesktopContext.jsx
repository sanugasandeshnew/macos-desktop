import { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { APPS } from '../data/apps';

const DesktopContext = createContext();

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const initialState = {
  windows: [],
  activeWindowId: null,
  minimizedWindows: [],
  nextZIndex: 10,
  spotlightOpen: false,
  selectedDesktopIcon: null,
  maximizedWindowId: null,
  wallpaper: 'geranimo-bKhETeDV1WM-unsplash.jpg',
  dockAutoHide: false,
  magnificationEnabled: true,
};

function reducer(state, action) {
  switch (action.type) {
    case 'OPEN_APP': {
      const app = APPS.find((a) => a.id === action.appId);
      if (!app) return state;

      const existing = state.windows.find((w) => w.appId === app.id && !w.minimized);
      if (existing) {
        return {
          ...state,
          activeWindowId: existing.id,
          nextZIndex: state.nextZIndex + 1,
          windows: state.windows.map((w) =>
            w.id === existing.id ? { ...w, zIndex: state.nextZIndex } : w
          ),
        };
      }

      const minimized = state.minimizedWindows.find((w) => w.appId === app.id);
      if (minimized) {
        return {
          ...state,
          minimizedWindows: state.minimizedWindows.filter((w) => w.appId !== app.id),
          activeWindowId: minimized.id,
          nextZIndex: state.nextZIndex + 1,
          windows: state.windows.map((w) =>
            w.id === minimized.id
              ? { ...w, minimized: false, zIndex: state.nextZIndex }
              : w
          ),
        };
      }

      if (state.fullscreenWindowId) {
        return {
          ...state,
          fullscreenWindowId: null,
          windows: state.windows.map((w) =>
            w.id === state.fullscreenWindowId
              ? { ...w, fullscreen: false, zIndex: state.nextZIndex }
              : w
          ),
          ...spawnWindow(app, state),
        };
      }

      return {
        ...state,
        ...spawnWindow(app, state),
      };
    }

    case 'CLOSE_WINDOW': {
      const newWindows = state.windows.filter((w) => w.id !== action.id);
      const newActiveId =
        state.activeWindowId === action.id
          ? newWindows.length > 0
            ? newWindows.reduce((max, w) => (w.zIndex > max.zIndex ? w : max)).id
            : null
          : state.activeWindowId;
      return {
        ...state,
        windows: newWindows,
        activeWindowId: newActiveId,
        minimizedWindows: state.minimizedWindows.filter((w) => w.id !== action.id),
        maximizedWindowId: state.maximizedWindowId === action.id ? null : state.maximizedWindowId,
      };
    }

    case 'MINIMIZE_WINDOW': {
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, minimized: true } : w
        ),
        minimizedWindows: [
          ...state.minimizedWindows,
          state.windows.find((w) => w.id === action.id),
        ],
        activeWindowId:
          state.activeWindowId === action.id
            ? (state.windows
                .filter((w) => w.id !== action.id && !w.minimized)
                .sort((a, b) => b.zIndex - a.zIndex)[0] || {}).id || null
            : state.activeWindowId,
        maximizedWindowId: state.maximizedWindowId === action.id ? null : state.maximizedWindowId,
      };
    }

    case 'FOCUS_WINDOW': {
      return {
        ...state,
        activeWindowId: action.id,
        nextZIndex: state.nextZIndex + 1,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, zIndex: state.nextZIndex, minimized: false } : w
        ),
        minimizedWindows: state.minimizedWindows.filter((w) => w.id !== action.id),
      };
    }

    case 'MOVE_WINDOW': {
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, x: action.x, y: action.y } : w
        ),
      };
    }

    case 'RESIZE_WINDOW': {
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, width: action.width, height: action.height } : w
        ),
      };
    }

    case 'SET_ACTIVE': {
      if (action.id === state.activeWindowId) {
        return {
          ...state,
          nextZIndex: state.nextZIndex + 1,
          windows: state.windows.map((w) =>
            w.id === action.id ? { ...w, zIndex: state.nextZIndex } : w
          ),
        };
      }
      return {
        ...state,
        activeWindowId: action.id,
        nextZIndex: state.nextZIndex + 1,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, zIndex: state.nextZIndex } : w
        ),
      };
    }

    case 'TOGGLE_SPOTLIGHT': {
      return {
        ...state,
        spotlightOpen: !state.spotlightOpen,
      };
    }

    case 'SELECT_DESKTOP_ICON': {
      return {
        ...state,
        selectedDesktopIcon: action.id,
      };
    }

    case 'SET_WALLPAPER': {
      return { ...state, wallpaper: action.name };
    }

    case 'TOGGLE_DOCK_AUTO_HIDE': {
      return { ...state, dockAutoHide: !state.dockAutoHide };
    }

    case 'TOGGLE_MAGNIFICATION': {
      return { ...state, magnificationEnabled: !state.magnificationEnabled };
    }

    case 'MAXIMIZE_WINDOW': {
      const w = state.windows.find((w) => w.id === action.id);
      if (!w) return state;
      const isMaximized = state.maximizedWindowId === action.id;
      if (isMaximized) {
        return {
          ...state,
          maximizedWindowId: null,
          windows: state.windows.map((win) =>
            win.id === action.id
              ? { ...win, x: action.prevX || 100, y: action.prevY || 60, width: action.prevW || win.width, height: action.prevH || win.height }
              : win
          ),
        };
      }
      return {
        ...state,
        maximizedWindowId: action.id,
        windows: state.windows.map((win) =>
          win.id === action.id
            ? { ...win, x: 0, y: 0, width: window.innerWidth, height: window.innerHeight - 28 - (state.dockAutoHide ? 0 : 64), _prevX: win.x, _prevY: win.y, _prevW: win.width, _prevH: win.height }
            : win
        ),
      };
    }

    default:
      return state;
  }
}

function spawnWindow(app, state) {
  const centerX = Math.max(100, (window.innerWidth - app.defaultWidth) / 2);
  const centerY = Math.max(60, (window.innerHeight - app.defaultHeight) / 2);

  const newWindow = {
    id: generateId(),
    appId: app.id,
    name: app.name,
    iconSrc: app.iconSrc,
    x: centerX + (state.windows.length * 20) % 100,
    y: centerY + (state.windows.length * 20) % 60,
    width: app.defaultWidth,
    height: app.defaultHeight,
    minimized: false,
    zIndex: state.nextZIndex,
  };

  return {
    windows: [...state.windows, newWindow],
    activeWindowId: newWindow.id,
    nextZIndex: state.nextZIndex + 1,
  };
}

export function DesktopProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const openApp = useCallback((appId) => dispatch({ type: 'OPEN_APP', appId }), []);
  const closeWindow = useCallback((id) => dispatch({ type: 'CLOSE_WINDOW', id }), []);
  const minimizeWindow = useCallback((id) => dispatch({ type: 'MINIMIZE_WINDOW', id }), []);
  const focusWindow = useCallback((id) => dispatch({ type: 'FOCUS_WINDOW', id }), []);
  const moveWindow = useCallback((id, x, y) => dispatch({ type: 'MOVE_WINDOW', id, x, y }), []);
  const resizeWindow = useCallback((id, width, height) => dispatch({ type: 'RESIZE_WINDOW', id, width, height }), []);
  const setActive = useCallback((id) => dispatch({ type: 'SET_ACTIVE', id }), []);
  const toggleSpotlight = useCallback(() => dispatch({ type: 'TOGGLE_SPOTLIGHT' }), []);
  const selectDesktopIcon = useCallback((id) => dispatch({ type: 'SELECT_DESKTOP_ICON', id }), []);
  const maximizeWindow = useCallback((id, prevRect) => dispatch({ type: 'MAXIMIZE_WINDOW', id, ...prevRect }), []);
  const setWallpaper = useCallback((name) => dispatch({ type: 'SET_WALLPAPER', name }), []);
  const toggleDockAutoHide = useCallback(() => dispatch({ type: 'TOGGLE_DOCK_AUTO_HIDE' }), []);
  const toggleMagnification = useCallback(() => dispatch({ type: 'TOGGLE_MAGNIFICATION' }), []);

  const value = useMemo(() => ({
    ...state,
    openApp,
    closeWindow,
    minimizeWindow,
    focusWindow,
    moveWindow,
    resizeWindow,
    setActive,
    toggleSpotlight,
    selectDesktopIcon,
    maximizeWindow,
    setWallpaper,
    toggleDockAutoHide,
    toggleMagnification,
  }), [state, openApp, closeWindow, minimizeWindow, focusWindow, moveWindow, resizeWindow, setActive, toggleSpotlight, selectDesktopIcon, maximizeWindow, setWallpaper, toggleDockAutoHide, toggleMagnification]);

  return (
    <DesktopContext.Provider value={value}>
      {children}
    </DesktopContext.Provider>
  );
}

export function useDesktop() {
  const ctx = useContext(DesktopContext);
  if (!ctx) throw new Error('useDesktop must be used within DesktopProvider');
  return ctx;
}
