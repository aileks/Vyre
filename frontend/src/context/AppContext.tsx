import { JSX, createContext, createSignal, useContext } from 'solid-js';

export interface AppSettings {
  appearance: {
    fontSize: 'small' | 'medium' | 'large';
    messageDensity: 'compact' | 'comfortable';
    animationsEnabled: boolean;
    useSystemTheme: boolean;
  };
  notifications: {
    sounds: boolean;
    desktopNotifications: boolean;
    mentionsOnly: boolean;
    muteChannels: string[];
  };
  privacy: {
    showStatus: boolean;
    allowDirectMessages: 'everyone' | 'friends' | 'server-members' | 'none';
    displayCurrentActivity: boolean;
  };
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    screenReaderOptimized: boolean;
  };
}

interface AppContextValue {
  // Modal controls
  openSettings: () => void;
  openCommands: () => void;
  openAddFriend: () => void;

  // Settings
  settings: () => AppSettings;
  updateSettings: <K extends keyof AppSettings, T extends keyof AppSettings[K]>(
    category: K,
    setting: T,
    value: AppSettings[K][T],
  ) => void;
}

// Default settings
const defaultSettings: AppSettings = {
  appearance: {
    fontSize: 'medium',
    messageDensity: 'comfortable',
    animationsEnabled: true,
    useSystemTheme: false,
  },
  notifications: {
    sounds: true,
    desktopNotifications: true,
    mentionsOnly: false,
    muteChannels: [],
  },
  privacy: {
    showStatus: true,
    allowDirectMessages: 'friends',
    displayCurrentActivity: true,
  },
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    screenReaderOptimized: false,
  },
};

// Create the context
export const AppContext = createContext<AppContextValue>({} as AppContextValue);

// Context provider component
export function AppContextProvider(props: { children: JSX.Element }) {
  // Load settings from localStorage if available
  const loadSavedSettings = (): AppSettings => {
    if (typeof window === 'undefined') {
      return defaultSettings;
    }

    try {
      const savedSettings = localStorage.getItem('vyre-settings');
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }

    return defaultSettings;
  };

  // Modal states
  const [_isSettingsOpen, setIsSettingsOpen] = createSignal(false);
  const [_isCommandsOpen, setIsCommandsOpen] = createSignal(false);

  // Settings state
  const [settings, setSettings] =
    createSignal<AppSettings>(loadSavedSettings());

  // Save settings to localStorage when they change
  const saveSettings = (newSettings: AppSettings) => {
    try {
      localStorage.setItem('vyre-settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  // Update a specific setting
  const updateSettings = <
    K extends keyof AppSettings,
    T extends keyof AppSettings[K],
  >(
    category: K,
    setting: T,
    value: AppSettings[K][T],
  ) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        [category]: {
          ...prev[category],
          [setting]: value,
        },
      };

      saveSettings(newSettings);
      return newSettings;
    });
  };

  // Modal controls
  const openSettings = () => setIsSettingsOpen(true);
  const openCommands = () => setIsCommandsOpen(true);
  const openAddFriend = () => {
    // Navigate to the friends add page
    if (typeof window !== 'undefined') {
      window.location.href = '/app/friends/add';
    }
  };

  const value: AppContextValue = {
    openSettings,
    openCommands,
    openAddFriend,
    settings,
    updateSettings,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
}

// Hook to use the context
export function useAppContext() {
  return useContext(AppContext);
}
