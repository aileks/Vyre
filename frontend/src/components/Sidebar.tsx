import { Icon } from '@iconify-icon/solid';
import { A, useLocation } from '@solidjs/router';
import { Component, For, Show, createSignal } from 'solid-js';

import { useAppContext } from '../context/AppContext';

interface DirectMessageUser {
  id: number;
  username: string;
  status: 'online' | 'away' | 'offline' | 'busy';
  unread: boolean;
}

interface ServerChannel {
  id: number;
  name: string;
  unread: boolean;
  mentions: number;
}

interface Server {
  id: number;
  name: string;
  icon?: string;
  channels: ServerChannel[];
}

const Sidebar: Component = () => {
  const location = useLocation();
  const appContext = useAppContext();

  // Mock data - would come from your API/state management
  const [directMessages, _setDirectMessages] = createSignal<
    DirectMessageUser[]
  >([
    { id: 2, username: 'neo_coder', status: 'online', unread: true },
    { id: 3, username: 'cyber_ghost', status: 'away', unread: false },
    { id: 4, username: 'pixeldreamer', status: 'offline', unread: false },
  ]);

  const [servers, _setServers] = createSignal<Server[]>([
    {
      id: 1,
      name: 'Cyberpunk Coders',
      channels: [
        { id: 101, name: 'general', unread: true, mentions: 0 },
        { id: 102, name: 'help', unread: false, mentions: 0 },
        { id: 103, name: 'projects', unread: false, mentions: 2 },
      ],
    },
    {
      id: 2,
      name: 'SolidJS Community',
      channels: [
        { id: 201, name: 'chat', unread: false, mentions: 0 },
        { id: 202, name: 'typescript', unread: true, mentions: 0 },
        { id: 203, name: 'beginners', unread: false, mentions: 0 },
      ],
    },
  ]);

  // Sidebar sections expanded state
  const [pmExpanded, setPmExpanded] = createSignal(true);
  const [serversExpanded, setServersExpanded] = createSignal(true);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Handle opening settings modal
  const handleOpenSettings = () => {
    if (appContext && typeof appContext.openSettings === 'function') {
      appContext.openSettings();
    } else {
      console.error('openSettings function not found in context');
    }
  };

  // Handle opening commands modal
  const handleOpenCommands = () => {
    if (appContext && typeof appContext.openCommands === 'function') {
      appContext.openCommands();
    } else {
      console.error('openCommands function not found in context');
    }
  };

  return (
    <div class='bg-midnight-800 flex h-full w-64 flex-col border-r border-gray-700'>
      {/* Header with user info */}
      <div class='bg-midnight-900 border-b border-gray-700 p-4'>
        <div class='flex items-center justify-between'>
          <div class='flex items-center'>
            <div class='relative mr-3'>
              <div class='bg-primary-600 flex h-10 w-10 items-center justify-center rounded-xs text-sm'>
                Y
              </div>
              <div class='border-midnight-900 status-indicator-away absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2'></div>
            </div>
            <div>
              <div class='text-cybertext-200 font-mono'>you</div>
              <div class='text-cybertext-500 text-xs'>Connected</div>
            </div>
          </div>

          {/* Settings button */}
          <button
            onClick={handleOpenSettings}
            class='text-cybertext-400 hover:text-cybertext-200 hover:bg-midnight-700 rounded-xs p-1'
            aria-label='Open settings'
          >
            <Icon icon='material-symbols:settings' class='h-5 w-5' />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div class='flex-1 overflow-y-auto p-2'>
        <div class='mb-4 space-y-1'>
          <A
            href='/app/friends'
            class={`flex items-center rounded-xs px-3 py-2 ${location.pathname.startsWith('/app/friends') ? 'bg-primary-900 text-primary-300' : 'text-cybertext-400 hover:bg-midnight-700'}`}
          >
            <Icon icon='material-symbols:group' class='mr-3 h-5 w-5' />
            Friends
          </A>
        </div>

        {/* Private Messages */}
        <div class='mb-4'>
          <div
            class='flex cursor-pointer items-center justify-between px-3 py-1 text-sm'
            onClick={() => setPmExpanded(!pmExpanded())}
          >
            <span class='text-cybertext-500 font-mono text-xs uppercase'>
              Private Messages
            </span>
            <Icon
              icon={
                pmExpanded() ?
                  'material-symbols:keyboard-arrow-down'
                : 'material-symbols:keyboard-arrow-right'
              }
              class='text-cybertext-500 h-4 w-4'
            />
          </div>

          <Show when={pmExpanded()}>
            <div class='mt-1 space-y-1'>
              <For each={directMessages()}>
                {pm => (
                  <A
                    href={`/app/channels/${pm.id}`}
                    class={`flex items-center rounded-xs px-3 py-2 ${isActive(`/app/channels/${pm.id}`) ? 'bg-primary-900 text-primary-300' : 'text-cybertext-400 hover:bg-midnight-700'}`}
                  >
                    <div class='relative mr-2'>
                      <div class='bg-electric-800 flex h-6 w-6 items-center justify-center rounded-xs text-xs'>
                        {pm.username.charAt(0).toUpperCase()}
                      </div>
                      <div
                        class={`border-midnight-800 absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full border-2 status-indicator-${pm.status}`}
                      ></div>
                    </div>

                    <span>{pm.username}</span>
                    <Show when={pm.unread}>
                      <div class='bg-primary-400 ml-auto h-2 w-2 rounded-full'></div>
                    </Show>
                  </A>
                )}
              </For>
            </div>
          </Show>
        </div>

        {/* Servers */}
        <div>
          <div
            class='flex cursor-pointer items-center justify-between px-3 py-1 text-sm'
            onClick={() => setServersExpanded(!serversExpanded())}
          >
            <span class='text-cybertext-500 font-mono text-xs uppercase'>
              Servers
            </span>
            <Icon
              icon={
                serversExpanded() ?
                  'material-symbols:keyboard-arrow-down'
                : 'material-symbols:keyboard-arrow-right'
              }
              class='text-cybertext-500 h-4 w-4'
            />
          </div>

          <Show when={serversExpanded()}>
            <div class='mt-1 space-y-3'>
              <For each={servers()}>
                {server => (
                  <div>
                    <div class='flex items-center px-3 py-1'>
                      <span class='text- font-mono text-sm'>{server.name}</span>
                    </div>
                    <div class='mt-1 ml-2 space-y-1'>
                      <For each={server.channels}>
                        {channel => (
                          <A
                            href={`/app/channels/${server.id}-${channel.name}`}
                            class={`flex items-center rounded-xs px-3 py-1 ${isActive(`/app/channels/${server.id}-${channel.name}`) ? 'bg-primary-900 text-primary-300' : 'text-cybertext-400 hover:bg-midnight-700'}`}
                          >
                            <span class='text-cybertext-500 mr-1'>#</span>
                            <span>{channel.name}</span>

                            <Show when={channel.unread}>
                              <div class='bg-primary-400 ml-auto h-2 w-2 rounded-full'></div>
                            </Show>

                            <Show when={channel.mentions > 0}>
                              <div class='bg-error-600 text-error-200 ml-auto rounded-xs px-1.5 text-xs'>
                                {channel.mentions}
                              </div>
                            </Show>
                          </A>
                        )}
                      </For>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </div>
      </div>

      <div class='bg-midnight-900 border-t border-gray-700 p-3'>
        {/* Commands button */}
        <button
          onClick={handleOpenCommands}
          class='bg-midnight-300 hover:bg-midnight-400 text-cybertext-400 hover:text-cybertext-200 flex w-full items-center rounded-xs px-3 py-2 duration-200'
          aria-label='Open commands'
        >
          <span class='text-primary-500 mr-2'>/</span>
          <span>Commands</span>
          <kbd class='bg-midnight-800 text-cybertext-500 ml-auto rounded-xs px-1.5 py-0.5 text-xs'>
            Ctrl+K
          </kbd>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
