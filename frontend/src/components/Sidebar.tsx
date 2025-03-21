import { Icon } from '@iconify-icon/solid';
import { A, useLocation } from '@solidjs/router';
import { Component, For, Show, createSignal } from 'solid-js';

import { useAppContext } from '../context/AppContext';

interface Channel {
  id: number;
  name: string;
  unread: boolean;
  mentions: number;
}

interface Server {
  id: number;
  name: string;
  icon?: string;
  channels: Channel[];
}

interface DirectMessageUser {
  id: number;
  username: string;
  status: 'online' | 'away' | 'offline' | 'busy';
  unread: boolean;
}

const AppSidebar: Component = () => {
  const location = useLocation();
  const { openSettings, openCommands } = useAppContext();

  // Mock data - would come from your API/state management
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

  const [directMessages, _setDirectMessages] = createSignal<
    DirectMessageUser[]
  >([
    { id: 2, username: 'neo_coder', status: 'online', unread: true },
    { id: 3, username: 'cyber_ghost', status: 'away', unread: false },
    { id: 4, username: 'pixeldreamer', status: 'offline', unread: false },
  ]);

  // Sidebar sections expanded state
  const [dmExpanded, setDmExpanded] = createSignal(true);
  const [serversExpanded, setServersExpanded] = createSignal(true);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div class='bg-midnight-800 flex h-full w-64 flex-col border-r border-gray-700'>
      {/* Header with user info */}
      <div class='bg-midnight-900 border-b border-gray-700 p-4'>
        <div class='flex items-center'>
          <div class='relative mr-3'>
            <div class='bg-primary-600 flex h-10 w-10 items-center justify-center rounded-xs text-sm'>
              Y
            </div>
            <div class='border-midnight-900 status-indicator-online absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2'></div>
          </div>
          <div>
            <div class='text-cybertext-200 font-mono'>you</div>
            <div class='text-cybertext-500 text-xs'>Connected</div>
          </div>

          {/* Settings button */}
          <button
            onClick={openSettings}
            class='text-cybertext-400 hover:text-cybertext-200 ml-auto'
            aria-label='Settings'
          >
            <Icon icon='material-symbols:settings' class='h-5 w-5' />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div class='flex-1 overflow-y-auto p-2'>
        {/* Main navigation */}
        <div class='mb-4 space-y-1'>
          <A
            href='/app/chat'
            class={`flex items-center rounded-xs px-3 py-2 ${isActive('/app/chat') ? 'bg-primary-900 text-primary-300' : 'text-cybertext-400 hover:bg-midnight-700'}`}
          >
            <Icon icon='material-symbols:chat' class='mr-3 h-5 w-5' />
            Chat
          </A>
          <A
            href='/app/friends'
            class={`flex items-center rounded-xs px-3 py-2 ${location.pathname.startsWith('/app/friends') ? 'bg-primary-900 text-primary-300' : 'text-cybertext-400 hover:bg-midnight-700'}`}
          >
            <Icon icon='material-symbols:group' class='mr-3 h-5 w-5' />
            Friends
          </A>
        </div>

        {/* Direct Messages */}
        <div class='mb-4'>
          <div
            class='flex cursor-pointer items-center justify-between px-3 py-1 text-sm'
            onClick={() => setDmExpanded(!dmExpanded())}
          >
            <span class='text-cybertext-500 font-mono text-xs uppercase'>
              Direct Messages
            </span>
            <Icon
              icon={
                dmExpanded() ?
                  'material-symbols:keyboard-arrow-down'
                : 'material-symbols:keyboard-arrow-right'
              }
              class='text-cybertext-500 h-4 w-4'
            />
          </div>

          <Show when={dmExpanded()}>
            <div class='mt-1 space-y-1'>
              <For each={directMessages()}>
                {dm => (
                  <A
                    href={`/app/channels/${dm.id}`}
                    class={`flex items-center rounded-xs px-3 py-2 ${isActive(`/app/channels/${dm.id}`) ? 'bg-primary-900 text-primary-300' : 'text-cybertext-400 hover:bg-midnight-700'}`}
                  >
                    <div class='relative mr-2'>
                      <div class='bg-electric-800 flex h-6 w-6 items-center justify-center rounded-xs text-xs'>
                        {dm.username.charAt(0).toUpperCase()}
                      </div>
                      <div
                        class={`border-midnight-800 absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full border-2 status-indicator-${dm.status}`}
                      ></div>
                    </div>
                    <span>{dm.username}</span>
                    <Show when={dm.unread}>
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
                      <span class='text-cybertext-300 font-mono text-sm'>
                        {server.name}
                      </span>
                    </div>
                    <div class='mt-1 ml-2 space-y-1'>
                      <For each={server.channels}>
                        {channel => (
                          <a
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
                          </a>
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

      {/* Footer with commands */}
      <div class='bg-midnight-900 border-t border-gray-700 p-3'>
        <button
          onClick={openCommands}
          class='bg-midnight-700 text-cybertext-400 hover:bg-midnight-600 flex w-full items-center justify-between rounded-xs px-3 py-2'
        >
          <div class='flex items-center'>
            <span class='text-primary-400 mr-2 font-mono'>/</span>
            <span>Commands</span>
          </div>
          <kbd class='bg-midnight-800 text-cybertext-500 rounded-xs px-1.5 py-0.5 text-xs'>
            Ctrl+K
          </kbd>
        </button>
      </div>
    </div>
  );
};

export default AppSidebar;
