import { A } from '@solidjs/router';
import { Show } from 'solid-js';

import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div class='bg-midnight-500 flex min-h-screen flex-col'>
      {/* Header with Navigation */}
      <header class='bg-midnight-800 border-b border-gray-700 py-4'>
        <div class='container mx-auto flex items-center justify-between px-4'>
          <div class='flex items-center'>
            <div class='text-primary-400 font-mono text-xl font-bold'>Vyre</div>
          </div>

          <Show
            when={!isLoading()}
            fallback={
              <button
                disabled
                class='bg-midnight-700 text-cybertext-400 rounded-xs border border-gray-700 px-4 py-2'
              >
                <span class='flex items-center gap-2'>
                  <Spinner /> Loading...
                </span>
              </button>
            }
          >
            <Show
              when={!isAuthenticated()}
              fallback={
                <A
                  href='/app/friends'
                  class='bg-primary-700 hover:bg-primary-600 text-cybertext-100 border-primary-400 rounded-xs border px-4 py-2 font-mono duration-200'
                >
                  Launch App
                </A>
              }
            >
              <div class='flex gap-3'>
                <A
                  href='/login'
                  class='bg-verdant-500 hover:bg-verdant-600 text- border-verdant-400 rounded-xs border px-4 py-2 font-mono duration-200'
                >
                  Login
                </A>
                <A
                  href='/register'
                  class='bg-primary-500 hover:bg-primary-600 text-cybertext-100 border-primary-400 rounded-xs border px-4 py-2 font-mono duration-200'
                >
                  Register
                </A>
              </div>
            </Show>
          </Show>
        </div>
      </header>

      {/* Hero Section */}
      <div class='container mx-auto mt-16 max-w-6xl px-4 py-12'>
        <div class='bg-midnight-800 overflow-hidden rounded-xs border border-gray-700 shadow-lg'>
          <div class='bg-midnight-900 flex items-center border-b border-gray-700 px-4 py-2'>
            <div class='mr-4 flex space-x-2'>
              <div class='h-3 w-3 rounded-full bg-red-500'></div>
              <div class='h-3 w-3 rounded-full bg-yellow-500'></div>
              <div class='h-3 w-3 rounded-full bg-green-500'></div>
            </div>
          </div>

          <div class='flex flex-col gap-8 p-8 md:flex-row'>
            <div class='md:w-1/2'>
              <h1 class='mb-6 font-mono text-4xl font-bold md:text-5xl'>
                <span class='text-primary-400'>Vyre</span>
                <p class='text- mt-4 mb-0 text-3xl'> Chat like a human</p>
              </h1>

              <p class='text-cybertext-400 mb-6 font-mono text-lg'>
                A modern chat platform with IRC roots. Lightweight,
                customizable, and privacy-focused.
              </p>

              <pre class='text- mb-8 font-mono text-sm'>
                {`// Command-driven interface
/join #SoMDiscussion
/msg @user Hey there!
/settings theme dark`}
              </pre>

              <div class='mb-8 font-mono'>
                <div class='mb-2 flex items-center gap-2'>
                  <div class='bg-success-500 h-4 w-4 rounded-xs'></div>
                  <span>Fault-tolerant backend</span>
                </div>
                <div class='mb-2 flex items-center gap-2'>
                  <div class='bg-success-500 h-4 w-4 rounded-xs'></div>
                  <span>Self-hostable infrastructure</span>
                </div>
                <div class='flex items-center gap-2'>
                  <div class='bg-success-500 h-4 w-4 rounded-xs'></div>
                  <span>Server-side message history</span>
                </div>
              </div>

              <div class='flex flex-col gap-4 sm:flex-row'>
                <Show
                  when={!isAuthenticated()}
                  fallback={
                    <A
                      href='/register'
                      class='bg-primary-700 hover:bg-primary-600 text-cybertext-100 border-primary-400 rounded-xs border px-6 py-3 text-center font-mono duration-200'
                    >
                      Pre-Register
                    </A>
                  }
                >
                  <A
                    href='/register'
                    class='bg-primary-500 hover:bg-primary-600 text-cybertext-100 border-primary-400 rounded-xs border px-6 py-3 text-center font-mono duration-200'
                  >
                    Get Started
                  </A>
                </Show>

                <A
                  href='https://github.com/aileks/Vyre'
                  class='bg-midnight-700 hover:bg-midnight-500 text-electric-400 hover:text-electric-300 rounded-xs border border-gray-700 px-6 py-3 text-center font-mono duration-200'
                >
                  GitHub Repo
                </A>
              </div>
            </div>

            <div class='bg-midnight-900 flex items-center justify-center rounded-xs border border-gray-700 md:w-1/2'>
              <div class='w-full p-6'>
                <div class='mb-4 flex items-center'>
                  <div class='status-indicator status-indicator-online'></div>
                  <span class='font-mono'>3 Servers · 24 Channels</span>
                </div>

                {/* Mock Chat Interface Preview */}
                <div class='chat-bubble-recipient mb-3'>
                  <div class='text-cybertext-500 mb-1 text-xs'>@kai</div>
                  Has anyone tried the new command syntax?
                </div>

                <div class='chat-bubble-sender mb-3'>
                  <div class='text-primary-300 mb-1 text-xs'>@you</div>
                  Yeah, the /alias feature is amazing for custom commands
                </div>

                <div class='chat-bubble-recipient mb-3'>
                  <div class='text-cybertext-500 mb-1 text-xs'>@MrChristo</div>
                  I've set up some automation scripts with the API too
                </div>

                <div class='chat-bubble-system'>
                  User <span class='underline'>@local cryptid</span> has joined
                  #general
                </div>
              </div>
            </div>
          </div>

          <div class='bg-midnight-900 border-t border-gray-700 p-4'>
            <div class='text-cybertext-500 flex items-center font-mono text-xs'>
              <div class='text-lg font-semibold'>
                Estimated Launch: 2025/08/12
              </div>
              <div class='flex items-center'>
                <span class='bg-primary-400 animate-blink ml-1 inline-block h-4 w-2'></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div class='container mx-auto px-4 py-16'>
        <h2 class='text-cybertext-200 mb-12 text-center font-mono text-2xl md:text-3xl'>
          Key Features
        </h2>

        <div class='grid grid-cols-1 gap-6 md:grid-cols-3'>
          <div class='bg-midnight-800 rounded-xs border border-gray-700 p-6'>
            <div class='text-electric-400 mb-3 font-mono text-lg'>
              Command-Driven
            </div>
            <p class='text-cybertext-400'>
              Familiar IRC-style commands with modern enhancements. Easily
              access a command list with <kbd class='text-gray-300'>Ctrl+K</kbd>
              or by beginning a message with a slash (
              <kbd class='text-gray-300'>/</kbd>).
            </p>
          </div>

          <div class='bg-midnight-800 rounded-xs border border-gray-700 p-6'>
            <div class='text-verdant-300 mb-3 font-mono text-lg'>
              Self-Hostable
              <br />
              <span class='text-sm italic'>Coming Soon</span>
            </div>
            <p class='text-cybertext-400'>
              Run your own server or join existing networks. You control your
              data and privacy at all times.
            </p>
          </div>

          <div class='bg-midnight-800 rounded-xs border border-gray-700 p-6'>
            <div class='mb-3 font-mono text-lg text-pink-400'>
              Easy On The Eyes
            </div>
            <p class='text-cybertext-400'>
              Dark mode by default with customizable themes. Low-light friendly
              for late night coding sessions.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer class='mt-auto border-t border-gray-700 py-8'>
        <div class='container mx-auto px-4'>
          <div class='flex flex-col items-center justify-between md:flex-row'>
            <div class='text-primary-400 mb-4 font-mono text-xl md:mb-0'>
              Vyre
            </div>
            <div class='text-cybertext-400 flex gap-6 font-mono text-sm'>
              <A href='#' class='hover:text-primary-400 duration-200'>
                About
              </A>
              <A href='#' class='hover:text-primary-400 duration-200'>
                Privacy
              </A>
              <A href='#' class='hover:text-primary-400 duration-200'>
                Terms
              </A>
              <A
                href='https://github.com/aileks/Vyre'
                class='hover:text-primary-400 duration-200'
              >
                GitHub
              </A>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
