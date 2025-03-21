import { Icon } from '@iconify-icon/solid';
import { Dialog } from '@kobalte/core/dialog';
import { For, Show, createSignal } from 'solid-js';

interface CommandsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

interface Command {
  name: string;
  description: string;
  usage: string;
  example: string;
  category: string;
}

export default function CommandsModal(props: CommandsModalProps) {
  const [searchText, setSearchText] = createSignal('');
  const [selectedCategory, setSelectedCategory] = createSignal('all');

  // Mock commands list - this would come from your actual commands system
  const commands: Command[] = [
    {
      name: 'join',
      description: 'Join a channel',
      usage: '/join #channel',
      example: '/join #cyberpunk',
      category: 'navigation',
    },
    {
      name: 'leave',
      description: 'Leave current channel',
      usage: '/leave',
      example: '/leave',
      category: 'navigation',
    },
    {
      name: 'nick',
      description: 'Change your nickname',
      usage: '/nick new_name',
      example: '/nick CyberHacker42',
      category: 'profile',
    },
    {
      name: 'msg',
      description: 'Send private message',
      usage: '/msg @user message',
      example: "/msg @kai Hey, how's it going?",
      category: 'messaging',
    },
    {
      name: 'settheme',
      description: 'Change UI theme',
      usage: '/settheme theme_name',
      example: '/settheme synthwave',
      category: 'appearance',
    },
    {
      name: 'clear',
      description: 'Clear chat history',
      usage: '/clear',
      example: '/clear',
      category: 'utility',
    },
    {
      name: 'help',
      description: 'Show help for commands',
      usage: '/help [command]',
      example: '/help join',
      category: 'utility',
    },
    {
      name: 'add',
      description: 'Add a friend',
      usage: '/add username',
      example: '/add cyberpunk42',
      category: 'social',
    },
    {
      name: 'block',
      description: 'Block a user',
      usage: '/block username',
      example: '/block spammer123',
      category: 'moderation',
    },
    {
      name: 'unblock',
      description: 'Unblock a user',
      usage: '/unblock username',
      example: '/unblock formerSpammer',
      category: 'moderation',
    },
    {
      name: 'alias',
      description: 'Create command alias',
      usage: '/alias name command',
      example: '/alias j /join',
      category: 'utility',
    },
    {
      name: 'status',
      description: 'Set your status',
      usage: '/status [online|away|busy|invisible]',
      example: '/status busy',
      category: 'profile',
    },
    {
      name: 'mute',
      description: 'Mute a channel',
      usage: '/mute #channel',
      example: '/mute #general',
      category: 'moderation',
    },
    {
      name: 'unmute',
      description: 'Unmute a channel',
      usage: '/unmute #channel',
      example: '/unmute #general',
      category: 'moderation',
    },
  ];

  // Get unique categories for filter buttons
  const categories = () => {
    const cats = [...new Set(commands.map(cmd => cmd.category))];
    cats.sort();
    return ['all', ...cats];
  };

  // Filter commands by search text and category
  const filteredCommands = () => {
    return commands.filter(cmd => {
      const matchesSearch =
        searchText() === '' ||
        cmd.name.toLowerCase().includes(searchText().toLowerCase()) ||
        cmd.description.toLowerCase().includes(searchText().toLowerCase());

      const matchesCategory =
        selectedCategory() === 'all' || cmd.category === selectedCategory();

      return matchesSearch && matchesCategory;
    });
  };

  const handleSearchChange = (
    e: InputEvent & { currentTarget: HTMLInputElement; target: Element },
  ) => {
    setSearchText(e.currentTarget.value);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <Dialog open={props.isOpen} onOpenChange={props.onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay class='fixed inset-0 z-40 bg-black/50' />

        <div class='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <Dialog.Content class='bg-midnight-800 flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xs border border-gray-700 shadow-lg'>
            <div class='bg-midnight-900 flex items-center justify-between border-b border-gray-700 px-4 py-3'>
              <Dialog.Title class='text-cybertext-200 font-mono text-xl'>
                <span class='text-primary-400'>/</span> Chat Commands
              </Dialog.Title>
              <Dialog.CloseButton class='hover:text-cybertext-300 text-xl text-gray-500'>
                <Icon icon='material-symbols:close' class='h-6 w-6' />
              </Dialog.CloseButton>
            </div>

            <div class='border-b border-gray-700 p-4'>
              <input
                type='text'
                placeholder='Search commands...'
                value={searchText()}
                onInput={handleSearchChange}
                class='bg-midnight-900 text-cybertext-300 w-full rounded-xs border border-gray-700 px-3 py-2'
              />
            </div>

            <div class='flex flex-wrap gap-2 border-b border-gray-700 p-4'>
              <For each={categories()}>
                {category => (
                  <button
                    onClick={() => handleCategoryChange(category)}
                    class={`rounded-xs px-3 py-1 text-sm ${
                      selectedCategory() === category ?
                        'bg-primary-700 text-primary-200'
                      : 'bg-midnight-900 text-cybertext-400 hover:bg-midnight-700'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                )}
              </For>
            </div>

            <div class='flex-1 overflow-y-auto p-4'>
              <div class='grid grid-cols-1 gap-3 md:grid-cols-2'>
                <For each={filteredCommands()}>
                  {command => (
                    <div class='bg-midnight-700 overflow-hidden rounded-xs border border-gray-700'>
                      <div class='bg-midnight-800 flex items-center justify-between border-b border-gray-700 px-3 py-2'>
                        <div class='text-primary-400 font-mono'>
                          /{command.name}
                        </div>
                        <div class='bg-midnight-900 text-cybertext-500 rounded-xs px-2 py-0.5 text-xs capitalize'>
                          {command.category}
                        </div>
                      </div>

                      <div class='p-3'>
                        <div class='text-cybertext-300 mb-2'>
                          {command.description}
                        </div>
                        <div class='text-cybertext-500 mb-1.5 text-xs'>
                          <span class='text-cybertext-400'>Usage:</span>{' '}
                          {command.usage}
                        </div>
                        <div class='text-cybertext-500 bg-midnight-800 rounded-xs p-2 font-mono text-xs'>
                          {command.example}
                        </div>
                      </div>
                    </div>
                  )}
                </For>
              </div>

              <Show when={filteredCommands().length === 0}>
                <div class='bg-midnight-900 rounded-xs border border-gray-700 p-6 text-center'>
                  <div class='text-cybertext-300 mb-2'>No commands found</div>
                  <div class='text-cybertext-500 text-sm'>
                    Try a different search term or category
                  </div>
                </div>
              </Show>
            </div>

            <div class='bg-midnight-900 text-cybertext-500 border-t border-gray-700 p-3 text-xs'>
              Tip: You can use{' '}
              <span class='text-primary-400'>/help [command]</span> in chat to
              quickly see usage information
            </div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog>
  );
}
