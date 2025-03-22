// import { Icon } from '@iconify-icon/solid';
// import { ContextMenu } from '@kobalte/core/context-menu';
// import { Popover } from '@kobalte/core/popover';

// const UserAvatar: Component<{
//   user: User;
//   onClick: (userId: number) => void;
// }> = props => {
//   return (
//     <Popover>
//       <Popover.Trigger
//         class='relative cursor-pointer'
//         onClick={() => props.onClick(props.user.id)}
//       >
//         <div
//           class={`${props.user.avatarColor || 'bg-electric-800'} text-cybertext-100 flex h-10 w-10 items-center justify-center rounded-full text-sm`}
//         >
//           {props.user.avatarInitial ||
//             props.user.username.charAt(0).toUpperCase()}
//         </div>
//         <div
//           class={`status-indicator absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full status-indicator-${props.user.status}`}
//         ></div>
//       </Popover.Trigger>

//       <Popover.Portal>
//         <Popover.Content class='z-50'>
//           <div class='bg-midnight-900 w-64 rounded-xs border border-gray-700 shadow-lg'>
//             <div class='chat-avatar border-b border-gray-700 p-4'>
//               <div class='flex items-center'>
//                 <div
//                   class={`${props.user.avatarColor || 'bg-electric-800'} mr-3 flex h-14 w-14 items-center justify-center rounded-xs text-lg`}
//                 >
//                   {props.user.avatarInitial ||
//                     props.user.username.charAt(0).toUpperCase()}
//                 </div>
//                 <div>
//                   <div class='text-cybertext-200 text-lg'>
//                     {props.user.username}
//                   </div>
//                   <div class='text-cybertext-500 flex items-center text-sm'>
//                     <span
//                       class={`status-indicator status-indicator-${props.user.status}`}
//                     ></span>
//                     <span>{props.user.status}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div class='p-4'>
//               <div class='mb-4'>
//                 <div class='text-cybertext-400 mb-1 text-xs'>About</div>
//                 <div class='text- text-sm'>
//                   {props.user.note || 'Vyre user'}
//                 </div>
//               </div>
//               <div class='flex space-x-2'>
//                 <button class='bg-midnight-700 hover:bg-midnight-600 text- flex-1 rounded-xs py-1 text-sm'>
//                   Message
//                 </button>
//                 <button class='bg-midnight-700 hover:bg-midnight-600 text- flex-1 rounded-xs py-1 text-sm'>
//                   Add Friend
//                 </button>
//               </div>
//             </div>
//           </div>
//           <Popover.Arrow />
//         </Popover.Content>
//       </Popover.Portal>
//     </Popover>
//   );
// };

export default function Chat() {
  // const [users] = createSignal<User[]>(mockUsers);
  // const [messages, setMessages] = createSignal<Message[]>(mockMessages);
  // const [currentUser, setCurrentUser] = createSignal<User>(mockUsers[0]); // First user is "you"

  // const [inputValue, setInputValue] = createSignal('');
  // const [commandInput, setCommandInput] = createSignal('');
  // const [showCommandMenu, setShowCommandMenu] = createSignal(false);
  // const [selectedCommandIndex, setSelectedCommandIndex] = createSignal(0);

  // Reference for auto-scrolling
  // const [messagesEndRef, setMessagesEndRef] =
  //   createSignal<HTMLDivElement | null>(null);

  // const addMessage = (content: string) => {
  //   if (!content.trim()) return;

  //   const newMessage: Message = {
  //     id: messages().length + 1,
  //     userId: currentUser().id,
  //     content: content,
  //     timestamp: new Date(),
  //   };

  //   setMessages([...messages(), newMessage]);
  //   scrollToBottom();
  // };

  // const handleInputKeyDown = (e: KeyboardEvent) => {
  //   // Starting a command
  //   if (e.key === '/' && inputValue() === '') {
  //     setShowCommandMenu(true);
  //     setCommandInput('');
  //     setSelectedCommandIndex(0);
  //     return;
  //   }

  //   // Command menu navigation
  //   if (showCommandMenu()) {
  //     if (e.key === 'Escape') {
  //       setShowCommandMenu(false);
  //       return;
  //     }

  //     if (e.key === 'ArrowDown') {
  //       e.preventDefault();
  //       setSelectedCommandIndex(prev =>
  //         Math.min(prev + 1, filteredCommands().length - 1),
  //       );
  //       return;
  //     }

  //     if (e.key === 'ArrowUp') {
  //       e.preventDefault();
  //       setSelectedCommandIndex(prev => Math.max(prev - 1, 0));
  //       return;
  //     }

  //     if (e.key === 'Enter' && filteredCommands().length > 0) {
  //       e.preventDefault();
  //       const selectedCommand = filteredCommands()[selectedCommandIndex()];
  //       handleCommandSelection(selectedCommand);
  //       return;
  //     }

  //     // Update command filter input
  //     if (inputValue().startsWith('/')) {
  //       setCommandInput(inputValue().slice(1));
  //     }
  //   } else {
  //     // Regular input handling
  //     if (e.key === 'Enter' && !e.shiftKey) {
  //       e.preventDefault();
  //       handleSendMessage();
  //     }
  //   }
  // };

  // const handleSendMessage = () => {
  //   const content = inputValue().trim();

  //   if (!content) return;

  //   if (content.startsWith('/')) {
  //     // Handle command
  //     const parts = content.slice(1).split(' ');
  //     const commandName = parts[0].toLowerCase();
  //     const args = parts.slice(1).join(' ');

  //     const command = commands.find(cmd => cmd.name === commandName);
  //     if (command) {
  //       command.handler(args);
  //     } else {
  //       addSystemMessage(`Unknown command: ${commandName}`);
  //     }
  //   } else {
  //     // Regular message
  //     addMessage(content);
  //   }

  //   setInputValue('');
  // };

  // const formatTimestamp = (date: Date): string => {
  //   const now = new Date();
  //   const diff = now.getTime() - date.getTime();

  //   // Today, show time
  //   if (diff < 24 * 60 * 60 * 1000) {
  //     return date.toLocaleTimeString(undefined, {
  //       hour: '2-digit',
  //       minute: '2-digit',
  //     });
  //   }

  //   // This week, show day and time
  //   if (diff < 7 * 24 * 60 * 60 * 1000) {
  //     return (
  //       date.toLocaleDateString(undefined, { weekday: 'short' }) +
  //       ' ' +
  //       date.toLocaleTimeString(undefined, {
  //         hour: '2-digit',
  //         minute: '2-digit',
  //       })
  //     );
  //   }

  //   // Older, show full date
  //   return date.toLocaleDateString();
  // };

  // const scrollToBottom = () => {
  //   const ref = messagesEndRef();
  //   if (ref) {
  //     setTimeout(() => {
  //       ref.scrollIntoView({ behavior: 'smooth' });
  //     }, 100);
  //   }
  // };

  // // Scroll to bottom on initial render
  // onMount(() => {
  //   scrollToBottom();
  // });

  // const handleUserClick = (userId: number) => {
  //   console.log(`User clicked: ${userId}`);
  // };

  // const groupedMessages = createMemo(() => {
  //   const groups = [];
  //   let currentGroup = null;

  //   for (const message of messages()) {
  //     // Start a new group for system messages or different users
  //     if (
  //       message.isSystem ||
  //       !currentGroup ||
  //       currentGroup.userId !== message.userId
  //     ) {
  //       if (currentGroup) {
  //         groups.push(currentGroup);
  //       }
  //       currentGroup = {
  //         userId: message.userId,
  //         isSystem: message.isSystem,
  //         messages: [message],
  //       };
  //     } else {
  //       // Add to existing group
  //       currentGroup.messages.push(message);
  //     }
  //   }

  //   // Add the last group
  //   if (currentGroup) {
  //     groups.push(currentGroup);
  //   }

  //   return groups;
  // });

  return (
    <h1 class='text-center text-4xl font-bold'>Chat Goes Here</h1>

    // <div class='flex h-full w-full flex-col'>
    //   {/* Chat container */}
    //   <div class='flex flex-1 flex-col items-center overflow-y-auto p-4'>
    //     <div class='w-full max-w-3/5'>
    //       {/* Message Groups */}
    //       <For each={groupedMessages()}>
    //         {group => {
    //           const user =
    //             group.isSystem ? undefined : getUserById(group.userId);
    //           const isCurrentUser = user?.id === currentUser().id;

    //           return (
    //             <div class='chat-message-group'>
    //               {/* System message group */}
    //               <Show when={group.isSystem}>
    //                 <For each={group.messages}>
    //                   {message => (
    //                     <div class='chat-message-system'>
    //                       <div class='chat-bubble-system'>
    //                         {message.content}
    //                         <span class='text-cybertext-600 mt-1 block text-right text-xs'>
    //                           {formatTimestamp(message.timestamp)}
    //                         </span>
    //                       </div>
    //                     </div>
    //                   )}
    //                 </For>
    //               </Show>

    //               {/* User message group */}
    //               <Show when={!group.isSystem}>
    //                 {/* Username header */}
    //                 <div class='mb-1 flex items-baseline px-2'>
    //                   <span
    //                     class={`font-mono text-sm font-medium ${isCurrentUser ? 'text-primary-400' : 'text-electric-600'}`}
    //                   >
    //                     {user?.username}
    //                   </span>
    //                   <span class='text-cybertext-600 ml-2 text-xs'>
    //                     {formatTimestamp(group.messages[0].timestamp)}
    //                   </span>
    //                 </div>

    //                 {/* Messages */}
    //                 <For each={group.messages}>
    //                   {(message, index) => (
    //                     <div class='mb-[2px] flex items-end'>
    //                       {/* Avatar - only shown for first message in group */}
    //                       <Show when={index() === 0}>
    //                         <UserAvatar
    //                           user={user!}
    //                           onClick={handleUserClick}
    //                         />
    //                       </Show>
    //                       <Show when={index() > 0}>
    //                         <div class='h-10 w-10 flex-shrink-0'></div>
    //                       </Show>

    //                       {/* Message with context menu */}
    //                       <ContextMenu>
    //                         <ContextMenu.Trigger>
    //                           <div
    //                             class={`${
    //                               isCurrentUser ? 'chat-bubble-self' : (
    //                                 'chat-bubble-other'
    //                               )
    //                             }`}
    //                           >
    //                             {message.content}

    //                             {/* Only show timestamp on last message in group */}
    //                             <Show
    //                               when={index() === group.messages.length - 1}
    //                             >
    //                               <span class='text-cybertext-600 mt-1 block text-right text-xs'>
    //                                 {formatTimestamp(message.timestamp)}
    //                               </span>
    //                             </Show>
    //                           </div>
    //                         </ContextMenu.Trigger>

    //                         <ContextMenu.Portal>
    //                           <ContextMenu.Content class='bg-midnight-900 z-50 w-48 overflow-hidden rounded-xs border border-gray-700 shadow-lg'>
    //                             <ContextMenu.Item class='hover:bg-midnight-700 text-cybertext-300 cursor-pointer px-4 py-2 text-sm'>
    //                               Copy Message
    //                             </ContextMenu.Item>
    //                             <ContextMenu.Item class='hover:bg-midnight-700 text-cybertext-300 cursor-pointer px-4 py-2 text-sm'>
    //                               Reply
    //                             </ContextMenu.Item>
    //                             <ContextMenu.Item class='hover:bg-midnight-700 text-cybertext-300 cursor-pointer px-4 py-2 text-sm'>
    //                               Add Reaction
    //                             </ContextMenu.Item>
    //                             <ContextMenu.Separator class='my-1 border-t border-gray-800' />
    //                             <ContextMenu.Item class='hover:bg-midnight-700 text-error-400 cursor-pointer px-4 py-2 text-sm'>
    //                               Delete Message
    //                             </ContextMenu.Item>
    //                           </ContextMenu.Content>
    //                         </ContextMenu.Portal>
    //                       </ContextMenu>

    //                       {/* Message actions (show on hover) */}
    //                       <div class='bg-midnight-800/90 absolute top-0 right-2 flex space-x-1 rounded-xs p-1 opacity-0 group-hover:opacity-100'>
    //                         <button class='text-cybertext-500 hover:text-cybertext-300 rounded-xs p-1'>
    //                           <Icon icon='lucide:smile' class='h-4 w-4' />
    //                         </button>
    //                         <button class='text-cybertext-500 hover:text-cybertext-300 rounded-xs p-1'>
    //                           <Icon icon='lucide:reply' class='h-4 w-4' />
    //                         </button>
    //                       </div>
    //                     </div>
    //                   )}
    //                 </For>
    //               </Show>
    //             </div>
    //           );
    //         }}
    //       </For>

    //       {/* Invisible element to scroll to */}
    //       <div ref={setMessagesEndRef}></div>
    //     </div>
    //   </div>

    //   {/* Input area with typing indicator */}
    //   <div class='flex flex-col justify-center border-t border-gray-700 p-4'>
    //     {/* Optional typing indicator */}
    //     <div class='text-cybertext-500 mb-2 ml-4 flex items-center gap-1 text-xs'>
    //       <span>neo_coder is typing</span>
    //       <div class='flex gap-1'>
    //         <span class='bg-primary-500 h-1 w-1 animate-bounce rounded-full'></span>
    //         <span
    //           class='bg-primary-500 h-1 w-1 animate-bounce rounded-full'
    //           style='animation-delay: 0.2s'
    //         ></span>
    //         <span
    //           class='bg-primary-500 h-1 w-1 animate-bounce rounded-full'
    //           style='animation-delay: 0.4s'
    //         ></span>
    //       </div>
    //     </div>

    //     <div class='relative mx-auto w-full max-w-3xl'>
    //       <textarea
    //         value={inputValue()}
    //         onInput={e => {
    //           setInputValue(e.target.value);
    //           if (e.target.value.startsWith('/')) {
    //             setShowCommandMenu(true);
    //             setCommandInput(e.target.value.slice(1));
    //             setSelectedCommandIndex(0);
    //           } else {
    //             setShowCommandMenu(false);
    //           }
    //         }}
    //         onKeyDown={handleInputKeyDown}
    //         placeholder='Type a message... (try typing / for commands)'
    //         class='bg-midnight-800 text-cybertext-200 h-14 w-full resize-none rounded-xs border border-gray-700 px-4 py-3 pr-10'
    //       />
    //       <button
    //         onClick={handleSendMessage}
    //         class='text-primary-400 hover:text-primary-300 absolute top-3 right-3'
    //         aria-label='Send message'
    //       >
    //         <Icon icon='lucide:send' class='h-6 w-6' />
    //       </button>

    //       {/* Command menu */}
    //       <Show when={showCommandMenu()}>
    //         <div class='bg-midnight-900 absolute bottom-full left-0 mb-1 max-h-60 w-full overflow-y-auto rounded-xs border border-gray-700 shadow-lg'>
    //           <For each={filteredCommands()}>
    //             {(command, index) => (
    //               <div
    //                 class={`cursor-pointer border-b border-gray-800 p-3 last:border-b-0 ${selectedCommandIndex() === index() ? 'bg-midnight-700' : 'hover:bg-midnight-800'}`}
    //                 onClick={() => handleCommandSelection(command)}
    //               >
    //                 <div class='text-primary-400 font-mono'>
    //                   /{command.name}
    //                 </div>
    //                 <div class='text-cybertext-500 text-sm'>
    //                   {command.description}
    //                 </div>
    //               </div>
    //             )}
    //           </For>

    //           <Show when={filteredCommands().length === 0}>
    //             <div class='text-cybertext-500 p-3 text-center'>
    //               No matching commands found
    //             </div>
    //           </Show>
    //         </div>
    //       </Show>
    //     </div>
    //   </div>
    // </div>
  );
}
