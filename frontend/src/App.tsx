import { createSignal, onMount } from 'solid-js';

function App() {
  const [theme, setTheme] = createSignal(
    localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ?
        'dark'
      : 'light'),
  );

  const toggleTheme = () => {
    const newTheme = theme() === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  onMount(() => {
    document.documentElement.setAttribute('data-theme', theme());
  });

  const channels = [
    { id: 1, name: 'general', unread: false, active: true },
    { id: 2, name: 'random', unread: true, active: false },
    { id: 3, name: 'development', unread: false, active: false },
    { id: 4, name: 'design', unread: false, active: false },
    { id: 5, name: 'help', unread: false, active: false },
  ];

  const users = [
    { id: 1, username: 'sarah_dev', status: 'online' },
    { id: 2, username: 'mike_code', status: 'away' },
    { id: 3, username: 'user47', status: 'busy' },
    { id: 4, username: 'designpro', status: 'offline' },
  ];

  const messages = [
    {
      id: 1,
      content: 'Hey everyone! Has anyone tried the new React 19 features?',
      timestamp: '14:32',
      author: users[0],
    },
    {
      id: 2,
      content:
        "Not yet, but I've been reading about concurrent rendering. Seems powerful!",
      timestamp: '14:34',
      author: users[1],
    },
    {
      id: 3,
      content: "I'm still upgrading my projects to use hooks properly 😅",
      timestamp: '14:35',
      author: users[2],
    },
    {
      id: 4,
      content:
        "Here's what I've built with the new features so far. Pretty impressed with the performance improvements.",
      timestamp: '14:38',
      author: { id: 999, username: 'you', status: 'online' },
      isOwnMessage: true,
    },
    {
      id: 5,
      content: '*** user47 has left the channel',
      timestamp: '14:42',
      isSystem: true,
    },
    {
      id: 6,
      content:
        "Let's plan a coding session to try out these new features together.",
      timestamp: '14:43',
      author: users[0],
    },
  ];

  return (
    <div>
      {/* Header */}
      {/* <header>
        <div>
          <h1>Vyre IRC</h1>
        </div>

        <div>
          <span>Connected to irc.vyre.net</span>
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme() === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme() === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>
      </header> */}

      {/* <div>
        {/* Sidebar */}
      {/* <div>
          <div>Network: Vyre</div>

          <div>
            <div>Channels</div>

            {channels.map(channel => (
              <div key={channel.id}>
                <span>#</span>
                <span>{channel.name}</span>
                {channel.unread && <span></span>}
              </div>
            ))}

            <div>Users ({users.length})</div>

            {users.map(user => (
              <div key={user.id}>
                <span data-status={user.status}></span>
                <span>{user.username}</span>
              </div>
            ))}
          </div>

          <div>
            <div>Server Info</div>
            <div>
              <span>Lag:</span>
              <span>32ms</span>
            </div>
            <div>
              <span>Users:</span>
              <span>248</span>
            </div>
          </div>
        </div> */}

      {/* Main Chat Area */}
      {/* <div>
          <div>
            <span>#general</span>
            <span>|</span>
            <span>Topic: A channel for general discussions</span>
            <span>|</span>
            <span>Users: 4</span>
          </div> */}

      {/* <div>
            <div>--- Log opened Tuesday June 15 2024 14:30:05 ---</div>

            {messages.map(message => {
              if (message.isSystem) {
                return (
                  <div key={message.id}>
                    <span>[{message.timestamp}]</span> {message.content}
                  </div>
                );
              }

              return (
                <div key={message.id}>
                  <span>[{message.timestamp}]</span>
                  <span>&lt;{message.author.username}&gt;</span>
                  <span>{message.content}</span>
                </div>
              );
            })}
          </div> */}

      {/* <div>
            <div>
              <div>#general</div>
              <input type='text' placeholder='Message #general' />
              <button>Send</button>
            </div>
            <div>
              <span>Tip: Use /help to show available commands</span>
              <span>Press Enter to send</span>
            </div>
          </div>
        </div> */}

      {/* Channel Details */}
      {/* <div>
          <div>Channel Details</div>

          <div>
            <div>Channel Topic</div>
            <div>
              This is the general discussion channel for all Vyre IRC users.
              Please keep conversations respectful and on-topic.
            </div>
          </div>

          <div>
            <div>Operators</div>
            <div>
              <span>@</span>
              <span>serveradmin</span>
            </div>

            <div>Voice (+v)</div>
            <div>
              <span>+</span>
              <span>sarah_dev</span>
            </div>

            <div>Regular Users</div>
            {users
              .filter(u => u.username !== 'sarah_dev')
              .map(user => (
                <div key={user.id}>
                  <span></span>
                  <span>{user.username}</span>
                  <span data-status={user.status}></span>
                </div>
              ))}
          </div>

          <div>
            <button>Leave Channel</button>
          </div>
        </div>
      </div> */}

      {/* Status Bar */}
      {/* <div>
        <div>
          Connected as: <span>you</span>
        </div>
        <div>
          Channels: <span>5</span>
        </div>
        <div>
          Private Messages: <span>2</span>
        </div>
        <div>
          Server: <span>irc.vyre.net:6667</span>
        </div>
      </div> */}
    </div>
  );
}

export default App;
