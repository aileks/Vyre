// import { useNavigate } from '@solidjs/router';
import { Component, ParentProps, createEffect, createSignal } from 'solid-js';

import CommandsModal from '../components/CommandsModal';
import SettingsModal from '../components/SettingsModal';
import Sidebar from '../components/Sidebar';
import { useAppContext } from '../context/AppContext';

// import { useAuth } from '../context/AuthContext';

const AppLayout: Component<ParentProps> = props => {
  // const { isAuthenticated } = useAuth();
  // const navigate = useNavigate();
  // const location = useLocation();
  const context = useAppContext();

  const [isSettingsOpen, setIsSettingsOpen] = createSignal<boolean>(false);
  const [isCommandsOpen, setIsCommandsOpen] = createSignal<boolean>(false);

  // Connect context methods to modal state
  createEffect(() => {
    context.openSettings = () => setIsSettingsOpen(true);
    context.openCommands = () => setIsCommandsOpen(true);
  });

  // createEffect(() => {
  //   console.log('isAuthenticated', isAuthenticated());
  //   if (!isAuthenticated()) {
  //     navigate('/', { replace: true });
  //   }
  // });

  // createEffect(() => {
  //   if (location.pathname === '/app') {
  //     navigate('/app/chat', { replace: true });
  //   }
  // });

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl+K or Cmd+K to open commands modal
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setIsCommandsOpen(true);
    }

    // Ctrl+, or Cmd+, to open settings
    if ((e.ctrlKey || e.metaKey) && e.key === ',') {
      e.preventDefault();
      setIsSettingsOpen(true);
    }
  };

  // Set up event listener for keyboard shortcuts
  createEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  return (
    <>
      <div class='flex h-screen'>
        <Sidebar />

        <div class='flex h-full flex-1 flex-col overflow-hidden'>
          <main class='flex-1 overflow-hidden'>{props.children}</main>
        </div>
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen()}
        onOpenChange={setIsSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <CommandsModal
        isOpen={isCommandsOpen()}
        onOpenChange={setIsCommandsOpen}
      />
    </>
  );
};

export default AppLayout;
