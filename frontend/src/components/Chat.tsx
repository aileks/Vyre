import { Icon } from '@iconify-icon/solid';
import { DropdownMenu } from '@kobalte/core/dropdown-menu';
import { Popover } from '@kobalte/core/popover';
import {
  Component,
  For,
  Show,
  createMemo,
  createSignal,
  onMount,
} from 'solid-js';

// Types
interface User {
  id: number;
  username: string;
  status: 'online' | 'away' | 'offline' | 'busy';
  avatarInitial?: string;
  avatarColor?: string;
  note?: string;
}

interface Message {
  id: number;
  userId: number;
  content: string;
  timestamp: Date;
  isSystem?: boolean;
}

interface ChatCommand {
  name: string;
  description: string;
  handler: (args: string) => void;
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

const mockMessages: Message[] = [
  {
    id: 1,
    userId: 2,
    content: 'Hey everyone, welcome to the cyberpunk channel!',
    timestamp: new Date(Date.now() - 3600000 * 2), // 2 hours ago
  },
  {
    id: 2,
    userId: 0, // System message
    content: 'User pixeldreamer joined the channel',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    isSystem: true,
  },
  {
    id: 3,
    userId: 4,
    content: "Thanks for having me! I'm new here.",
    timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
  },
  {
    id: 4,
    userId: 3,
    content:
      'Did anyone check out the new interface design? I think the neon accents really make it pop.',
    timestamp: new Date(Date.now() - 900000), // 15 minutes ago
  },
  {
    id: 5,
    userId: 1, // Current user
    content:
      'Yeah, I love the cyberpunk aesthetic. The dark mode is easier on the eyes too.',
    timestamp: new Date(Date.now() - 300000), // 5 minutes ago
  },
  {
    id: 6,
    userId: 2,
    content:
      'We should add some more interactive elements to the UI. Maybe some hover effects?',
    timestamp: new Date(Date.now() - 60000), // 1 minute ago
  },
];

// User avatar component
const UserAvatar: Component<{
  user: User;
  onClick: (userId: number) => void;
}> = props => {
  return (
    <Popover>
      <Popover.Trigger
        class='relative cursor-pointer'
        onClick={() => props.onClick(props.user.id)}
      >
        <div
          class={`${props.user.avatarColor || 'bg-electric-800'} text-cybertext-100 flex h-10 w-10 items-center justify-center rounded-xs font-mono text-sm`}
        >
          {props.user.avatarInitial ||
            props.user.username.charAt(0).toUpperCase()}
        </div>
        <div
          class={`border-midnight-600 absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 status-indicator-${props.user.status}`}
        ></div>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content class='z-50'>
          <div class='bg-midnight-900 w-64 rounded-xs border border-gray-700 shadow-lg'>
            <div class='border-b border-gray-700 p-4'>
              <div class='flex items-center'>
                <div
                  class={`${props.user.avatarColor || 'bg-electric-800'} text-cybertext-100 mr-3 flex h-14 w-14 items-center justify-center rounded-xs font-mono text-lg`}
                >
                  {props.user.avatarInitial ||
                    props.user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div class='text-cybertext-200 font-mono text-lg'>
                    {props.user.username}
                  </div>
                  <div class='text-cybertext-500 flex items-center text-sm'>
                    <span
                      class={`status-indicator status-indicator-${props.user.status}`}
                    ></span>
                    <span>{props.user.status}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class='p-4'>
              <div class='mb-4'>
                <div class='text-cybertext-400 mb-1 text-xs'>About</div>
                <div class='text-cybertext-300 text-sm'>
                  {props.user.note || 'Vyre user'}
                </div>
              </div>
              <div class='flex space-x-2'>
                <button class='bg-midnight-700 hover:bg-midnight-600 text-cybertext-300 flex-1 rounded-xs py-1 text-sm'>
                  Message
                </button>
                <button class='bg-midnight-700 hover:bg-midnight-600 text-cybertext-300 flex-1 rounded-xs py-1 text-sm'>
                  Add Friend
                </button>
              </div>
            </div>
          </div>
          <Popover.Arrow />
        </Popover.Content>
      </Popover.Portal>
    </Popover>
  );
};

// Main Chat component
const Chat = () => {
  // State
  const [users] = createSignal<User[]>(mockUsers);
  const [messages, setMessages] = createSignal<Message[]>(mockMessages);
  const [currentUser, setCurrentUser] = createSignal<User>(mockUsers[0]); // First user is "you"

  const [inputValue, setInputValue] = createSignal('');
  const [commandInput, setCommandInput] = createSignal('');
  const [showCommandMenu, setShowCommandMenu] = createSignal(false);
  const [selectedCommandIndex, setSelectedCommandIndex] = createSignal(0);

  // Reference for auto-scrolling
  const [messagesEndRef, setMessagesEndRef] =
    createSignal<HTMLDivElement | null>(null);

  // Available commands
  const commands: ChatCommand[] = [
    {
      name: 'help',
      description: 'Show available commands',
      handler: () => {
        addSystemMessage(
          'Available commands: /help, /clear, /nick, /status, /dm, /join',
        );
      },
    },
    {
      name: 'clear',
      description: 'Clear chat history',
      handler: () => {
        setMessages([
          {
            id: messages().length + 1,
            userId: 0,
            content: 'Chat history cleared',
            timestamp: new Date(),
            isSystem: true,
          },
        ]);
      },
    },
    {
      name: 'nick',
      description: 'Change your nickname: /nick <new_name>',
      handler: args => {
        if (args.trim()) {
          const oldName = currentUser().username;
          setCurrentUser({ ...currentUser(), username: args.trim() });
          addSystemMessage(
            `User ${oldName} changed their nickname to ${args.trim()}`,
          );
        }
      },
    },
    {
      name: 'status',
      description: 'Change your status: /status <online|away|offline|busy>',
      handler: args => {
        const status = args.trim().toLowerCase();
        if (['online', 'away', 'offline', 'busy'].includes(status)) {
          setCurrentUser({
            ...currentUser(),
            status: status as 'online' | 'away' | 'offline' | 'busy',
          });
          addSystemMessage(`User ${currentUser().username} is now ${status}`);
        }
      },
    },
    {
      name: 'dm',
      description: 'Send direct message: /dm <username> <message>',
      handler: args => {
        const parts = args.split(' ');
        if (parts.length >= 2) {
          const username = parts[0];
          const message = parts.slice(1).join(' ');
          addSystemMessage(`[DM to ${username}]: ${message}`);
        }
      },
    },
    {
      name: 'join',
      description: 'Join a channel: /join <channel>',
      handler: args => {
        if (args.trim()) {
          addSystemMessage(`You joined channel #${args.trim()}`);
        }
      },
    },
  ];

  // Filtered commands based on input
  const filteredCommands = createMemo(() => {
    if (!commandInput()) return commands;
    return commands.filter(cmd =>
      cmd.name.toLowerCase().includes(commandInput().toLowerCase()),
    );
  });

  // Methods
  const addMessage = (content: string) => {
    if (!content.trim()) return;

    const newMessage: Message = {
      id: messages().length + 1,
      userId: currentUser().id,
      content: content,
      timestamp: new Date(),
    };

    setMessages([...messages(), newMessage]);
    scrollToBottom();
  };

  const addSystemMessage = (content: string) => {
    const newMessage: Message = {
      id: messages().length + 1,
      userId: 0,
      content: content,
      timestamp: new Date(),
      isSystem: true,
    };

    setMessages([...messages(), newMessage]);
    scrollToBottom();
  };

  const handleInputKeyDown = (e: KeyboardEvent) => {
    // Starting a command
    if (e.key === '/' && inputValue() === '') {
      setShowCommandMenu(true);
      setCommandInput('');
      setSelectedCommandIndex(0);
      return;
    }

    // Command menu navigation
    if (showCommandMenu()) {
      if (e.key === 'Escape') {
        setShowCommandMenu(false);
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCommandIndex(prev =>
          Math.min(prev + 1, filteredCommands().length - 1),
        );
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCommandIndex(prev => Math.max(prev - 1, 0));
        return;
      }

      if (e.key === 'Enter' && filteredCommands().length > 0) {
        e.preventDefault();
        const selectedCommand = filteredCommands()[selectedCommandIndex()];
        handleCommandSelection(selectedCommand);
        return;
      }

      // Update command filter input
      if (inputValue().startsWith('/')) {
        setCommandInput(inputValue().slice(1));
      }
    } else {
      // Regular input handling
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    }
  };

  const handleSendMessage = () => {
    const content = inputValue().trim();

    if (!content) return;

    if (content.startsWith('/')) {
      // Handle command
      const parts = content.slice(1).split(' ');
      const commandName = parts[0].toLowerCase();
      const args = parts.slice(1).join(' ');

      const command = commands.find(cmd => cmd.name === commandName);
      if (command) {
        command.handler(args);
      } else {
        addSystemMessage(`Unknown command: ${commandName}`);
      }
    } else {
      // Regular message
      addMessage(content);
    }

    setInputValue('');
  };

  const handleCommandSelection = (command: ChatCommand) => {
    setInputValue(`/${command.name} `);
    setShowCommandMenu(false);
  };

  const getUserById = (id: number): User | undefined => {
    return users().find(user => user.id === id);
  };

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // Today, show time
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    // This week, show day and time
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return (
        date.toLocaleDateString(undefined, { weekday: 'short' }) +
        ' ' +
        date.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    }

    // Older, show full date
    return date.toLocaleDateString();
  };

  const handleUserClick = (userId: number) => {
    // This could be expanded to show user profile, open DM, etc.
    console.log(`User clicked: ${userId}`);
  };

  const scrollToBottom = () => {
    const ref = messagesEndRef();
    if (ref) {
      setTimeout(() => {
        ref.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Scroll to bottom on initial render
  onMount(() => {
    scrollToBottom();
  });

  return (
    <div class='bg-midnight-600 flex h-full flex-col'>
      {/* Chat container */}
      <div class='flex flex-1 flex-col items-center overflow-y-auto p-4'>
        <div class='w-full max-w-3xl'>
          {/* Messages */}
          <For each={messages()}>
            {message => {
              const user =
                message.isSystem ? undefined : getUserById(message.userId);
              const isCurrentUser = user?.id === currentUser().id;

              return (
                <div
                  class={`mb-4 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Message content with context menu */}
                  <DropdownMenu>
                    <DropdownMenu.Trigger
                      class={isCurrentUser ? 'order-2 ml-2' : 'order-1 mr-2'}
                    >
                      {message.isSystem ?
                        <div class='chat-bubble-system relative mx-auto'>
                          {message.content}
                          <span class='text-cybertext-600 mt-1 block text-right text-xs'>
                            {formatTimestamp(message.timestamp)}
                          </span>
                        </div>
                      : isCurrentUser ?
                        <div class='chat-bubble-sender relative'>
                          <div class='text-primary-300 mb-1 font-mono text-xs'>
                            {user?.username}
                          </div>
                          {message.content}
                          <span class='text-cybertext-600 mt-1 block text-right text-xs'>
                            {formatTimestamp(message.timestamp)}
                          </span>
                        </div>
                      : <div class='chat-bubble-recipient relative'>
                          <div class='text-cybertext-500 mb-1 font-mono text-xs'>
                            {user?.username}
                          </div>
                          {message.content}
                          <span class='text-cybertext-600 mt-1 block text-right text-xs'>
                            {formatTimestamp(message.timestamp)}
                          </span>
                        </div>
                      }
                    </DropdownMenu.Trigger>

                    <Show when={!message.isSystem}>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content class='bg-midnight-900 z-50 w-48 overflow-hidden rounded-xs border border-gray-700 shadow-lg'>
                          <DropdownMenu.Item class='hover:bg-midnight-700 text-cybertext-300 cursor-pointer px-4 py-2 text-sm'>
                            Copy Message
                          </DropdownMenu.Item>
                          <DropdownMenu.Item class='hover:bg-midnight-700 text-cybertext-300 cursor-pointer px-4 py-2 text-sm'>
                            Reply
                          </DropdownMenu.Item>
                          <DropdownMenu.Item class='hover:bg-midnight-700 text-cybertext-300 cursor-pointer px-4 py-2 text-sm'>
                            Add Reaction
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator class='my-1 border-t border-gray-800' />
                          <DropdownMenu.Item class='hover:bg-midnight-700 text-error-400 cursor-pointer px-4 py-2 text-sm'>
                            Delete Message
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </Show>
                  </DropdownMenu>

                  {/* User avatar */}
                  <Show when={!message.isSystem && user}>
                    <div class={isCurrentUser ? 'order-1' : 'order-2'}>
                      <UserAvatar user={user!} onClick={handleUserClick} />
                    </div>
                  </Show>
                </div>
              );
            }}
          </For>

          {/* Invisible element to scroll to */}
          <div ref={setMessagesEndRef}></div>
        </div>
      </div>

      {/* Input area */}
      <div class='flex justify-center border-t border-gray-700 p-4'>
        <div class='relative w-full max-w-3xl'>
          <div class='relative'>
            <textarea
              value={inputValue()}
              onInput={e => {
                setInputValue(e.target.value);
                if (e.target.value.startsWith('/')) {
                  setShowCommandMenu(true);
                  setCommandInput(e.target.value.slice(1));
                  setSelectedCommandIndex(0);
                } else {
                  setShowCommandMenu(false);
                }
              }}
              onKeyDown={handleInputKeyDown}
              placeholder='Type a message... (try typing / for commands)'
              class='bg-midnight-800 text-cybertext-300 h-14 w-full resize-none rounded-xs border border-gray-700 px-4 py-3 pr-10 font-mono'
            />
            <button
              onClick={handleSendMessage}
              class='text-primary-400 hover:text-primary-300 absolute top-3 right-3'
              aria-label='Send message'
            >
              <Icon icon='material-symbols:send' class='h-6 w-6' />
            </button>
          </div>

          {/* Command menu */}
          <Show when={showCommandMenu()}>
            <div class='bg-midnight-900 absolute bottom-full left-0 mb-1 max-h-60 w-full overflow-y-auto rounded-xs border border-gray-700 shadow-lg'>
              <For each={filteredCommands()}>
                {(command, index) => (
                  <div
                    class={`cursor-pointer border-b border-gray-800 p-3 last:border-b-0 ${selectedCommandIndex() === index() ? 'bg-midnight-700' : 'hover:bg-midnight-800'}`}
                    onClick={() => handleCommandSelection(command)}
                  >
                    <div class='text-primary-400 font-mono'>
                      /{command.name}
                    </div>
                    <div class='text-cybertext-500 text-sm'>
                      {command.description}
                    </div>
                  </div>
                )}
              </For>
              <Show when={filteredCommands().length === 0}>
                <div class='text-cybertext-500 p-3 text-center'>
                  No matching commands found
                </div>
              </Show>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
};

export default Chat;
