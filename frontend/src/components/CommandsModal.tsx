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
  const [isExiting, setIsExiting] = createSignal(false);

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

  const handleClose = () => {
    if (!props.isOpen || isExiting()) return;

    setIsExiting(true);

    // Wait for animation to complete before actually closing
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
              <Dialog.Title class='modal-title'>
                <span class='command-prefix'>/</span> Chat Commands
              </Dialog.Title>

              <Dialog.CloseButton
                class='hover:text-cybertext-500 text-xl text-gray-300 hover:cursor-pointer'
                onClick={handleClose}
              >
                <Icon icon='material-symbols:close' class='h-4 w-4' />
              </Dialog.CloseButton>
            </div>

            <div class='border-b border-gray-700 p-4'>
              <input
                type='text'
                placeholder='Search commands...'
                value={searchText()}
                onInput={handleSearchChange}
                class='search-input'
              />
            </div>

            <div class='flex flex-wrap gap-2 border-b border-gray-700 p-4'>
              <For each={categories()}>
                {category => (
                  <button
                    onClick={() => handleCategoryChange(category)}
                    class={
                      selectedCategory() === category ?
                        'filter-button filter-button-active'
                      : 'filter-button filter-button-inactive'
                    }
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                )}
              </For>
            </div>

            <div class='flex-1 overflow-y-auto p-4'>
              <div class='stagger-children grid grid-cols-1 gap-3 md:grid-cols-2'>
                <For each={filteredCommands()}>
                  {command => (
                    <div class='command-card'>
                      <div class='command-card-header'>
                        <div class='command-prefix'>/{command.name}</div>
                        <div class='command-category-tag'>
                          {command.category}
                        </div>
                      </div>

                      <div class='p-3'>
                        <div class='mb-2'>{command.description}</div>
                        <div class='text-cybertext-500 mb-1.5 text-xs'>
                          <span class='text-cybertext-400'>Usage:</span>{' '}
                          {command.usage}
                        </div>
                        <div class='command-example'>{command.example}</div>
                      </div>
                    </div>
                  )}
                </For>
              </div>

              <Show when={filteredCommands().length === 0}>
                <div class='empty-state animate-fade-in'>
                  <div class='mb-2'>No commands found</div>
                  <div class='text-cybertext-500 text-sm'>
                    Try a different search term or category
                  </div>
                </div>
              </Show>
            </div>

            <div class='modal-footer'>
              Tip: You can use{' '}
              <span class='command-prefix'>/help [command]</span> in chat to
              quickly see usage information
            </div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog>
  );
}
