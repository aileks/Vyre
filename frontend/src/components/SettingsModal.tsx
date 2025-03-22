import { Icon } from '@iconify-icon/solid';
import { Dialog } from '@kobalte/core/dialog';
import { Tabs } from '@kobalte/core/tabs';
import { A } from '@solidjs/router';
import { For, Show, createSignal } from 'solid-js';

interface SettingsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onClose?: () => void;
}

interface SettingsState {
  appearance: {
    theme: string;
    fontSize: string;
    messageDensity: string;
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
    allowDirectMessages: string;
    displayCurrentActivity: boolean;
  };
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    screenReaderOptimized: boolean;
  };
}

interface BlockedUser {
  id: number;
  username: string;
}

export default function SettingsModal(props: SettingsModalProps) {
  const [hasChanges, setHasChanges] = createSignal<boolean>(false);
  const [activeTab, setActiveTab] = createSignal<string>('appearance');
  const [isExiting, setIsExiting] = createSignal(false);
  const [blockedUsers, setBlockedUsers] = createSignal<BlockedUser[]>([
    { id: 501, username: 'spammer123' },
    { id: 502, username: 'annoyinguser' },
  ]);

  const [settings, setSettings] = createSignal<SettingsState>({
    appearance: {
      theme: 'midnight',
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
  });

  const handleSettingChange = <T,>(
    category: keyof SettingsState,
    setting: string,
    value: T,
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleSaveSettings = () => {
    setHasChanges(false);
    if (props.onClose) props.onClose();
  };

  const unblockUser = (userId: number) => {
    setBlockedUsers(prev => prev.filter(user => user.id !== userId));
    setHasChanges(true);
  };

  const handleClose = () => {
    if (!props.isOpen || isExiting()) return;

    setIsExiting(true);

    setTimeout(() => {
      setIsExiting(false);
      props.onOpenChange(false);
    }, 200);
  };

  return (
    <Dialog
      open={props.isOpen}
      onOpenChange={open => {
        if (!open && !isExiting()) {
          handleClose();
          return;
        }
        props.onOpenChange(open);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay
          class={`modal-overlay ${isExiting() ? 'modal-exit' : 'animate-fade-in'}`}
        />

        <div class='modal-container'>
          <Dialog.Content
            class={`modal-content h-3/5 w-full max-w-4xl ${
              isExiting() ? 'modal-content-exit' : 'animate-scale-in'
            }`}
          >
            <div class='modal-header'>
              <Dialog.Title class='modal-title'>Settings</Dialog.Title>
              <Dialog.CloseButton
                class='hover:text-cybertext-500 text-xl text-gray-300 hover:cursor-pointer focus:outline-0'
                onClick={handleClose}
              >
                <Icon icon='material-symbols:close' class='h-4 w-4' />
              </Dialog.CloseButton>
            </div>

            <div class='flex flex-1 overflow-hidden'>
              {/* Settings Sidebar */}
              <div class='bg-midnight-900 w-48 border-r border-gray-700'>
                <Tabs
                  orientation='vertical'
                  value={activeTab()}
                  onChange={handleTabChange}
                >
                  <Tabs.List class='flex flex-col'>
                    <Tabs.Trigger
                      value='appearance'
                      class={`hover:bg-midnight-500 mt-1 px-4 py-3 text-left transition-colors duration-200 ${
                        activeTab() === 'appearance' ?
                          'bg-midnight-500 text-primary-400'
                        : 'text-cybertext-400'
                      }`}
                    >
                      Appearance
                    </Tabs.Trigger>

                    <Tabs.Trigger
                      value='notifications'
                      class={`hover:bg-midnight-500 mt-1 px-4 py-3 text-left transition-colors duration-200 ${
                        activeTab() === 'notifications' ?
                          'bg-midnight-500 text-primary-400'
                        : 'text-cybertext-400'
                      }`}
                    >
                      Notifications
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value='privacy'
                      class={`hover:bg-midnight-500 mt-1 px-4 py-3 text-left transition-colors duration-200 ${
                        activeTab() === 'privacy' ?
                          'bg-midnight-500 text-primary-400'
                        : 'text-cybertext-400'
                      }`}
                    >
                      Privacy
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value='blocked'
                      class={`hover:bg-midnight-500 mt-1 px-4 py-3 text-left transition-colors duration-200 ${
                        activeTab() === 'blocked' ?
                          'bg-midnight-500 text-primary-400'
                        : 'text-cybertext-400'
                      }`}
                    >
                      Blocked Users
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value='accessibility'
                      class={`hover:bg-midnight-500 mt-1 px-4 py-3 text-left transition-colors duration-200 ${
                        activeTab() === 'accessibility' ?
                          'bg-midnight-500 text-primary-400'
                        : 'text-cybertext-400'
                      }`}
                    >
                      Accessibility
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value='about'
                      class={`hover:bg-midnight-500 mt-1 px-4 py-3 text-left transition-colors duration-200 ${
                        activeTab() === 'about' ?
                          'bg-midnight-500 text-primary-400'
                        : 'text-cybertext-400'
                      }`}
                    >
                      About
                    </Tabs.Trigger>
                  </Tabs.List>
                </Tabs>
              </div>

              {/* Settings Content */}
              <div class='flex-1 overflow-y-auto p-6'>
                <Tabs value={activeTab()} onChange={handleTabChange}>
                  <Tabs.Content value='appearance'>
                    <h3 class='text-cybertext-200 mb-4 font-mono text-lg'>
                      Appearance
                    </h3>

                    <div class='mb-6'>
                      <label class='text-cybertext-300 mb-2 block'>
                        Font Size
                      </label>
                      <div class='flex gap-3'>
                        <button
                          class={`rounded-xs px-4 py-2 ${
                            settings().appearance.fontSize === 'small' ?
                              'bg-primary-700 text-cybertext-200'
                            : 'bg-midnight-500 text-cybertext-400 hover:bg-midnight-600'
                          }`}
                          onClick={() =>
                            handleSettingChange(
                              'appearance',
                              'fontSize',
                              'small',
                            )
                          }
                        >
                          Small
                        </button>

                        <button
                          class={`rounded-xs px-4 py-2 ${
                            settings().appearance.fontSize === 'medium' ?
                              'bg-primary-700 text-cybertext-200'
                            : 'bg-midnight-500 text-cybertext-400 hover:bg-midnight-600'
                          }`}
                          onClick={() =>
                            handleSettingChange(
                              'appearance',
                              'fontSize',
                              'medium',
                            )
                          }
                        >
                          Medium
                        </button>

                        <button
                          class={`rounded-xs px-4 py-2 ${
                            settings().appearance.fontSize === 'large' ?
                              'bg-primary-700 text-cybertext-200'
                            : 'bg-midnight-500 text-cybertext-400 hover:bg-midnight-600'
                          }`}
                          onClick={() =>
                            handleSettingChange(
                              'appearance',
                              'fontSize',
                              'large',
                            )
                          }
                        >
                          Large
                        </button>
                      </div>
                    </div>

                    <div class='mb-6'>
                      <label class='text-cybertext-300 mb-2 block'>
                        Message Density
                      </label>
                      <div class='flex gap-3'>
                        <button
                          class={`rounded-xs px-4 py-2 ${
                            settings().appearance.messageDensity === 'compact' ?
                              'bg-primary-700 text-cybertext-200'
                            : 'bg-midnight-500 text-cybertext-400 hover:bg-midnight-600'
                          }`}
                          onClick={() =>
                            handleSettingChange(
                              'appearance',
                              'messageDensity',
                              'compact',
                            )
                          }
                        >
                          Compact
                        </button>
                        <button
                          class={`rounded-xs px-4 py-2 ${
                            (
                              settings().appearance.messageDensity ===
                              'comfortable'
                            ) ?
                              'bg-primary-700 text-cybertext-200'
                            : 'bg-midnight-500 text-cybertext-400 hover:bg-midnight-600'
                          }`}
                          onClick={() =>
                            handleSettingChange(
                              'appearance',
                              'messageDensity',
                              'comfortable',
                            )
                          }
                        >
                          Comfortable
                        </button>
                      </div>
                    </div>

                    <div class='mb-4 flex items-center'>
                      <input
                        type='checkbox'
                        id='animations-toggle'
                        checked={settings().appearance.animationsEnabled}
                        onChange={e =>
                          handleSettingChange(
                            'appearance',
                            'animationsEnabled',
                            e.target.checked,
                          )
                        }
                        class='bg-midnight-900 text-electric-600 h-4 w-4 rounded-xs border-gray-700'
                      />
                      <label
                        for='animations-toggle'
                        class='text-cybertext-300 ml-2'
                      >
                        Enable animations
                      </label>
                    </div>
                  </Tabs.Content>

                  <Tabs.Content value='notifications'>
                    <h3 class='text-cybertext-200 mb-4 font-mono text-lg'>
                      Notifications
                    </h3>

                    <div class='space-y-4'>
                      <div class='flex items-center justify-between'>
                        <label class='text-cybertext-300'>Enable sounds</label>
                        <input
                          type='checkbox'
                          checked={settings().notifications.sounds}
                          onChange={e =>
                            handleSettingChange(
                              'notifications',
                              'sounds',
                              e.target.checked,
                            )
                          }
                          class='bg-midnight-900 text-electric-600 h-4 w-4 rounded-xs border-gray-700'
                        />
                      </div>

                      <div class='flex items-center justify-between'>
                        <label class='text-cybertext-300'>
                          Desktop notifications
                        </label>
                        <input
                          type='checkbox'
                          checked={
                            settings().notifications.desktopNotifications
                          }
                          onChange={e =>
                            handleSettingChange(
                              'notifications',
                              'desktopNotifications',
                              e.target.checked,
                            )
                          }
                          class='bg-midnight-900 text-electric-600 h-4 w-4 rounded-xs border-gray-700'
                        />
                      </div>

                      <div class='flex items-center justify-between'>
                        <label class='text-cybertext-300'>
                          Only notify for mentions
                        </label>
                        <input
                          type='checkbox'
                          checked={settings().notifications.mentionsOnly}
                          onChange={e =>
                            handleSettingChange(
                              'notifications',
                              'mentionsOnly',
                              e.target.checked,
                            )
                          }
                          class='bg-midnight-900 text-electric-600 h-4 w-4 rounded-xs border-gray-700'
                        />
                      </div>
                    </div>

                    <div class='mt-8'>
                      <h4 class='text-cybertext-300 mb-2 font-mono'>
                        Muted Channels
                      </h4>
                      <p class='text-cybertext-500 mb-4 text-sm'>
                        You won't receive notifications from these channels
                      </p>

                      <div class='bg-midnight-900 rounded-xs border border-gray-700 p-3'>
                        <Show
                          when={
                            settings().notifications.muteChannels.length > 0
                          }
                          fallback={
                            <div class='text-sm text-gray-500'>
                              No muted channels
                            </div>
                          }
                        >
                          <For each={settings().notifications.muteChannels}>
                            {channel => (
                              <div class='flex items-center justify-between py-1'>
                                <span class='text-cybertext-400 channel-name'>
                                  {channel}
                                </span>
                                <button
                                  class='hover:text-error-400 text-gray-500'
                                  onClick={() => {
                                    const updated =
                                      settings().notifications.muteChannels.filter(
                                        c => c !== channel,
                                      );
                                    handleSettingChange(
                                      'notifications',
                                      'muteChannels',
                                      updated,
                                    );
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            )}
                          </For>
                        </Show>
                      </div>
                    </div>
                  </Tabs.Content>

                  <Tabs.Content value='privacy'>
                    <h3 class='text-cybertext-200 mb-4 font-mono text-lg'>
                      Privacy
                    </h3>

                    <div class='space-y-6'>
                      <div>
                        <label class='text-cybertext-300 mb-2 block'>
                          Show online status
                        </label>
                        <div class='flex items-center'>
                          <input
                            type='checkbox'
                            id='status-toggle'
                            checked={settings().privacy.showStatus}
                            onChange={e =>
                              handleSettingChange(
                                'privacy',
                                'showStatus',
                                e.target.checked,
                              )
                            }
                            class='bg-midnight-900 text-electric-600 h-4 w-4 rounded-xs border-gray-700'
                          />
                          <label
                            for='status-toggle'
                            class='text-cybertext-500 ml-2 text-sm'
                          >
                            Others can see when you're online
                          </label>
                        </div>
                      </div>

                      <div>
                        <label class='text-cybertext-300 mb-2 block'>
                          Direct Messages
                        </label>
                        <select
                          value={settings().privacy.allowDirectMessages}
                          onChange={e =>
                            handleSettingChange(
                              'privacy',
                              'allowDirectMessages',
                              e.target.value,
                            )
                          }
                          class='bg-midnight-900 text-cybertext-300 w-full rounded-xs border border-gray-700 px-3 py-2'
                        >
                          <option value='everyone'>Allow from everyone</option>
                          <option value='friends'>Friends only</option>
                          <option value='server-members'>
                            Server members only
                          </option>
                          <option value='none'>Disabled</option>
                        </select>
                      </div>

                      <div>
                        <label class='text-cybertext-300 mb-2 block'>
                          Activity Status
                        </label>
                        <div class='flex items-center'>
                          <input
                            type='checkbox'
                            id='activity-toggle'
                            checked={settings().privacy.displayCurrentActivity}
                            onChange={e =>
                              handleSettingChange(
                                'privacy',
                                'displayCurrentActivity',
                                e.target.checked,
                              )
                            }
                            class='bg-midnight-900 text-electric-600 h-4 w-4 rounded-xs border-gray-700'
                          />
                          <label
                            for='activity-toggle'
                            class='text-cybertext-500 ml-2 text-sm'
                          >
                            Display your current activity to others
                          </label>
                        </div>
                      </div>
                    </div>
                  </Tabs.Content>

                  <Tabs.Content value='blocked'>
                    <h3 class='text-cybertext-200 mb-4 font-mono text-lg'>
                      Blocked Users
                    </h3>

                    <p class='text-cybertext-500 mb-4 text-sm'>
                      You won't receive messages or notifications from blocked
                      users
                    </p>

                    <div class='bg-midnight-900 rounded-xs border border-gray-700'>
                      <Show
                        when={blockedUsers().length > 0}
                        fallback={
                          <div class='p-4 text-center text-gray-500'>
                            No blocked users
                          </div>
                        }
                      >
                        <div class='stagger-children'>
                          <For each={blockedUsers()}>
                            {user => (
                              <div class='flex items-center justify-between border-b border-gray-800 p-3 last:border-b-0'>
                                <div class='flex items-center'>
                                  <div class='mr-3 flex h-8 w-8 items-center justify-center rounded-xs bg-gray-800 text-xs'>
                                    {user.username.charAt(0)}
                                  </div>
                                  <span class='text-cybertext-400 user-name'>
                                    {user.username}
                                  </span>
                                </div>
                                <button
                                  onClick={() => unblockUser(user.id)}
                                  class='bg-midnight-500 hover:bg-midnight-600 text-cybertext-300 rounded-xs px-3 py-1 text-sm'
                                >
                                  Unblock
                                </button>
                              </div>
                            )}
                          </For>
                        </div>
                      </Show>
                    </div>
                  </Tabs.Content>

                  <Tabs.Content value='accessibility'>
                    <h3 class='text-cybertext-200 mb-4 font-mono text-lg'>
                      Accessibility
                    </h3>

                    <div class='space-y-4'>
                      <div class='flex items-center justify-between'>
                        <label class='text-cybertext-300'>Reduced motion</label>
                        <input
                          type='checkbox'
                          checked={settings().accessibility.reducedMotion}
                          onChange={e =>
                            handleSettingChange(
                              'accessibility',
                              'reducedMotion',
                              e.target.checked,
                            )
                          }
                          class='bg-midnight-900 text-electric-600 h-4 w-4 rounded-xs border-gray-700'
                        />
                      </div>

                      <div class='flex items-center justify-between'>
                        <label class='text-cybertext-300'>
                          High contrast mode
                        </label>
                        <input
                          type='checkbox'
                          checked={settings().accessibility.highContrast}
                          onChange={e =>
                            handleSettingChange(
                              'accessibility',
                              'highContrast',
                              e.target.checked,
                            )
                          }
                          class='bg-midnight-900 text-electric-600 h-4 w-4 rounded-xs border-gray-700'
                        />
                      </div>

                      <div class='flex items-center justify-between'>
                        <label class='text-cybertext-300'>
                          Screen reader optimized
                        </label>
                        <input
                          type='checkbox'
                          checked={
                            settings().accessibility.screenReaderOptimized
                          }
                          onChange={e =>
                            handleSettingChange(
                              'accessibility',
                              'screenReaderOptimized',
                              e.target.checked,
                            )
                          }
                          class='bg-midnight-900 text-electric-600 h-4 w-4 rounded-xs border-gray-700'
                        />
                      </div>
                    </div>
                  </Tabs.Content>

                  <Tabs.Content value='about'>
                    <h3 class='text-cybertext-200 mb-4 font-mono text-lg'>
                      About Vyre
                    </h3>

                    <div class='space-y-4'>
                      <div class='bg-midnight-900 scanlines rounded-xs border border-gray-700 p-4'>
                        <div class='text-cybertext-200 primary-glow mb-2 text-center font-mono text-xl'>
                          Vyre Chat
                        </div>
                        <div class='text-cybertext-500 mb-4 text-center'>
                          Version 0.9.1 Beta
                        </div>

                        <div class='mb-4 flex justify-center'>
                          <div class='bg-primary-900/50 text-primary-400 glitch-text rounded-xs px-3 py-1 text-sm'>
                            Development Build
                          </div>
                        </div>

                        <p class='text-cybertext-400 mb-2 text-sm'>
                          A modern chat platform with IRC roots. Lightweight,
                          customizable, and privacy-focused.
                        </p>

                        <p class='text-cybertext-500 text-sm'>
                          Created with Solid.js, Phoenix, and a passion for
                          cyberpunk aesthetics.
                        </p>
                      </div>

                      <div class='flex justify-center space-x-4'>
                        <A
                          href='https://github.com/aileks/Vyre'
                          target='_blank'
                          rel='noopener noreferrer'
                          class='bg-midnight-500 hover:bg-midnight-600 text-cybertext-300 rounded-xs px-4 py-2 text-sm transition-colors duration-200'
                        >
                          GitHub
                        </A>

                        <A
                          href='#'
                          class='bg-midnight-500 hover:bg-midnight-600 text-cybertext-300 rounded-xs px-4 py-2 text-sm transition-colors duration-200'
                        >
                          Website
                        </A>

                        <A
                          href='#'
                          class='bg-midnight-500 hover:bg-midnight-600 text-cybertext-300 rounded-xs px-4 py-2 text-sm transition-colors duration-200'
                        >
                          Report Bug
                        </A>
                      </div>
                    </div>
                  </Tabs.Content>
                </Tabs>
              </div>
            </div>

            {/* Footer with action buttons */}
            <div class='bg-midnight-900 flex justify-end border-t border-gray-700 px-6 py-4'>
              <Show when={hasChanges()}>
                <div class='text-warning-400 mr-auto flex items-center text-sm'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    class='mr-1 h-4 w-4'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fill-rule='evenodd'
                      d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                      clip-rule='evenodd'
                    />
                  </svg>
                  Unsaved changes
                </div>
              </Show>

              <div class='space-x-3'>
                <Dialog.CloseButton
                  class='bg-midnight-400 hover:bg-midnight-300 text-cybertext-300 rounded-xs px-4 py-2 transition-colors duration-200 hover:cursor-pointer'
                  onClick={handleClose}
                >
                  Cancel
                </Dialog.CloseButton>

                <button
                  onClick={handleSaveSettings}
                  class={`rounded-xs px-4 py-2 ${
                    hasChanges() ?
                      'bg-primary-600 hover:bg-primary-500 text-cybertext-200 transition-colors duration-200 hover:cursor-pointer'
                    : 'bg-primary-800 cursor-not-allowed text-gray-500'
                  }`}
                  disabled={!hasChanges()}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog>
  );
}
