import { useLocation, useNavigate } from '@solidjs/router';
import { Component, ParentProps, createEffect, createSignal } from 'solid-js';

import CommandsModal from '../components/CommandsModal';
import SettingsModal from '../components/SettingsModal';
import Sidebar from '../components/Sidebar';
import { useAppContext } from '../context/AppContext';

// Auth check - would integrate with your actual auth system
const isAuthenticated = () => {
  // Replace with your actual auth check
  // Example: return !!localStorage.getItem('authToken');
  return true; // Temporary for development
};

const AppLayout: Component<ParentProps> = props => {
  const navigate = useNavigate();
  const location = useLocation();
  const context = useAppContext();

  // Modal state
  const [isSettingsOpen, setIsSettingsOpen] = createSignal<boolean>(false);
  const [isCommandsOpen, setIsCommandsOpen] = createSignal<boolean>(false);

  // Connect context methods to modal state
  createEffect(() => {
    // Override context methods to control modal visibility
    context.openSettings = () => setIsSettingsOpen(true);
    context.openCommands = () => setIsCommandsOpen(true);
  });

  // Check authentication on route change
  createEffect(() => {
    if (!isAuthenticated()) {
      navigate('/', { replace: true });
    }
  });

  // If the URL is exactly /app, redirect to /app/chat
  createEffect(() => {
    if (location.pathname === '/app') {
      navigate('/app/chat', { replace: true });
    }
  });

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
      <div class='bg-midnight-600 flex h-screen'>
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
