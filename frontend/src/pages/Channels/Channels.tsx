import { useParams } from '@solidjs/router';
import { createEffect, createSignal } from 'solid-js';

import Chat from '../../components/Chat';

// Types
interface User {
  id: number;
  username: string;
  status: 'online' | 'away' | 'offline' | 'busy';
  avatarInitial?: string;
  avatarColor?: string;
  note?: string;
}

interface ServerChannel {
  id: string;
  name: string;
  serverId: string;
  serverName: string;
  description?: string;
  memberCount?: number;
}

// Mock data for testing
const mockUsers: User[] = [
  {
    id: 1,
    username: 'you',
    status: 'online',
    avatarInitial: 'Y',
    avatarColor: 'bg-primary-600',
    note: 'Current user',
  },
  {
    id: 2,
    username: 'neo_coder',
    status: 'online',
    avatarInitial: 'N',
    avatarColor: 'bg-verdant-600',
    note: 'Full-stack developer',
  },
  {
    id: 3,
    username: 'cyber_ghost',
    status: 'away',
    avatarInitial: 'C',
    avatarColor: 'bg-electric-600',
    note: 'Security specialist',
  },
  {
    id: 4,
    username: 'pixeldreamer',
    status: 'offline',
    avatarInitial: 'P',
    avatarColor: 'bg-pink-600',
    note: 'UI/UX Designer',
  },
];

const mockServerChannels: ServerChannel[] = [
  {
    id: 'server1-general',
    name: 'general',
    serverId: 'server1',
    serverName: 'Uni Group',
    description: 'General discussion for all members',
    memberCount: 156,
  },
  {
    id: 'server1-projects',
    name: 'projects',
    serverId: 'server1',
    serverName: 'Uni Group',
    description: 'Share and discuss your coding projects',
    memberCount: 89,
  },
  {
    id: 'server2-chat',
    name: 'chat',
    serverId: 'server2',
    serverName: 'Dev Chat',
    description: 'Chat about all things dev',
    memberCount: 243,
  },
];

const Channels = () => {
  const params = useParams<{ channelId: string }>();
  const channelId = () => params.channelId;

  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [isPrivateMessage, setIsPrivateMessage] = createSignal(false);
  const [user, setUser] = createSignal<User | null>(null);
  const [channel, setChannel] = createSignal<ServerChannel | null>(null);

  // Helper to determine if the channel ID is a user ID (for private messages)
  const isUserChannel = (id: string): boolean => {
    // User IDs are numeric, server channel IDs have format "serverId-channelName"
    return !isNaN(Number(id)) && !id.includes('-');
  };

  // Fetch channel/user data based on channelId
  createEffect(() => {
    const id = channelId();
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      if (isUserChannel(id)) {
        // Handle private message channel (to a user)
        setIsPrivateMessage(true);
        const userId = Number(id);
        const foundUser = mockUsers.find(u => u.id === userId);

        if (foundUser) {
          setUser(foundUser);
          setChannel(null);
        } else {
          setError(`User with ID ${userId} not found`);
        }
      } else {
        // Handle server channel
        setIsPrivateMessage(false);
        const foundChannel = mockServerChannels.find(c => c.id === id);

        if (foundChannel) {
          setChannel(foundChannel);
          setUser(null);
        } else {
          setError(`Channel with ID ${id} not found`);
        }
      }
    } catch (err) {
      setError('Error loading channel data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  });

  // const renderChannelHeader = () => {
  //   if (loading()) {
  //     return (
  //       <div class='bg-midnight-600 h-6 w-32 animate-pulse rounded-xs'></div>
  //     );
  //   }

  //   if (error()) {
  //     return <div class='text-error-400 font-mono'>{error()}</div>;
  //   }

  //   if (isPrivateMessage() && user()) {
  //     // Private message header
  //     return (
  //       <>
  //         <div class='relative mr-3'>
  //           <div
  //             class={`${user()?.avatarColor || 'bg-electric-800'} text-cybertext-100 flex h-8 w-8 items-center justify-center rounded-xs text-sm`}
  //           >
  //             {user()?.avatarInitial ||
  //               user()?.username.charAt(0).toUpperCase()}
  //           </div>
  //           <div
  //             class={`border-midnight-700 absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 status-indicator-${user()?.status}`}
  //           ></div>
  //         </div>
  //         <div class='flex flex-col'>
  //           <h1 class='text-cybertext-200 font-mono text-lg'>
  //             {user()?.username}
  //           </h1>
  //           <div class='text-cybertext-500 flex items-center text-xs'>
  //             <span
  //               class={`status-indicator status-indicator-${user()?.status}`}
  //             ></span>
  //             <span class='capitalize'>{user()?.status}</span>
  //           </div>
  //         </div>
  //       </>
  //     );
  //   } else if (channel()) {
  //     // Server channel header
  //     return (
  //       <>
  //         <div class='text-cybertext-500 mr-3 font-mono text-lg'>#</div>
  //         <div class='flex flex-col'>
  //           <h1 class='text-cybertext-200 font-mono text-lg'>
  //             {channel()?.name}
  //           </h1>
  //           <div class='text-cybertext-500 text-xs'>
  //             {channel()?.description} • {channel()?.memberCount} members
  //           </div>
  //         </div>
  //       </>
  //     );
  //   }

  //   return null;
  // };

  const renderChannelHeader = () => {
    if (loading()) {
      return (
        <div class='bg-midnight-600 h-6 w-32 animate-pulse rounded-xs'></div>
      );
    }

    if (error()) {
      return <div class='text-error-400 font-mono'>{error()}</div>;
    }

    if (isPrivateMessage() && user()) {
      // Private message header
      return (
        <>
          <div class='relative mr-3'>
            <div class='chat-avatar'>
              {user()?.avatarInitial ||
                user()?.username.charAt(0).toUpperCase()}
            </div>
            <div
              class={`border-midnight-700 absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 status-indicator-${user()?.status}`}
            ></div>
          </div>
          <div class='flex flex-col'>
            <h1 class='chat-username text-lg'>{user()?.username}</h1>
            <div class='text-cybertext-500 flex items-center text-xs'>
              <span
                class={`status-indicator status-indicator-${user()?.status}`}
              ></span>
              <span class='capitalize'>{user()?.status}</span>
            </div>
          </div>
        </>
      );
    } else if (channel()) {
      // Server channel header
      return (
        <>
          <div class='text-verdant-400 mr-3 font-mono text-lg'>#</div>
          <div class='flex flex-col'>
            <h1 class='channel-name text-lg'>{channel()?.name}</h1>
            <div class='text-cybertext-500 text-xs'>
              {channel()?.description} • {channel()?.memberCount} members
            </div>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div class='flex h-full flex-col'>
      {/* Channel header */}
      <div class='bg-midnight-700 flex items-center border-b border-gray-700 px-6 py-3'>
        {renderChannelHeader()}
      </div>

      {/* Channel content */}
      <div class='flex-1 overflow-hidden'>
        {!loading() && !error() && <Chat />}
      </div>
    </div>
  );
};

export default Channels;
