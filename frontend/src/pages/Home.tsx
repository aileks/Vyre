import { A } from '@solidjs/router';
import { Show } from 'solid-js';

import { useAuth } from '../context/authContext';

const Spinner = () => (
  <div
    class='inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]'
    role='status'
  >
    <span class='!absolute !-m-px !h-px !w-px !overflow-hidden !border-0 !p-0 !whitespace-nowrap ![clip:rect(0,0,0,0)]'>
      Loading...
    </span>
  </div>
);

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div class='container mx-auto mt-32 max-w-6xl px-4 py-16'>
      <div class='bg-midnight-800 shadow-midnight-900/50 mb-12 overflow-hidden rounded-xs border border-gray-700 shadow-md'>
        <div class='bg-midnight-900 flex items-center border-b border-gray-700 px-4 py-2'>
          <div class='mr-4 flex space-x-2'>
            <div class='rounded-xs-full h-3 w-3 bg-red-500'></div>
            <div class='rounded-xs-full h-3 w-3 bg-yellow-500'></div>
            <div class='rounded-xs-full h-3 w-3 bg-green-500'></div>
          </div>
          <div class='text-cybertext-400 font-mono text-sm'>
            Vyre - Connected
          </div>
        </div>

        <div class='px-6 py-10 md:py-16'>
          <h1 class='mb-6 text-center font-mono text-4xl font-bold md:text-6xl'>
            <span class='text-primary-400'>Vyre</span>
          </h1>

          <pre class='text-cybertext-300 mb-8 overflow-x-auto text-center font-mono text-sm whitespace-pre md:text-base'>
            {`
 ██████╗ ██████╗ ███╗   ███╗██╗███╗   ██╗ ██████╗     ███████╗ ██████╗  ██████╗ ███╗   ██╗
██╔════╝██╔═══██╗████╗ ████║██║████╗  ██║██╔════╝     ██╔════╝██╔═══██╗██╔═══██╗████╗  ██║
██║     ██║   ██║██╔████╔██║██║██╔██╗ ██║██║  ███╗    ███████╗██║   ██║██║   ██║██╔██╗ ██║
██║     ██║   ██║██║╚██╔╝██║██║██║╚██╗██║██║   ██║    ╚════██║██║   ██║██║   ██║██║╚██╗██║
╚██████╗╚██████╔╝██║ ╚═╝ ██║██║██║ ╚████║╚██████╔╝    ███████║╚██████╔╝╚██████╔╝██║ ╚████║
 ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝     ╚══════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝
`}
          </pre>

          <div class='mb-8 flex justify-center'>
            <div class='text-cybertext-400 flex items-center font-mono text-lg md:text-xl'>
              <span>Estimated Launch Date: 2025/06/15</span>
              <span class='bg-primary-400 animate-blink ml-1 inline-block h-5 w-2.5'></span>
            </div>
          </div>

          <div class='bg-midnight-900 mb-8 rounded-xs border border-gray-700 px-4 py-3'>
            <div class='flex flex-col space-y-2 font-mono text-xs md:text-sm'>
              <div class='flex'>
                <span class='w-24 shrink-0 text-gray-500'>[STATUS]</span>
                <span class='text-electric-400'>
                  Building infrastructure...
                </span>
              </div>

              <div class='flex'>
                <span class='w-24 shrink-0 text-gray-500'>[PROGRESS]</span>
                <span class='text-teal-300'>13% complete</span>
              </div>

              <div class='flex'>
                <span class='w-24 shrink-0 text-gray-500'>[NOTICE]</span>
                <span class='text-cybertext-300'>
                  Click "Learn More" below to check out the repo!
                </span>
              </div>
            </div>
          </div>

          <div class='flex flex-col justify-center gap-4 md:flex-row'>
            <Show
              when={!isLoading()}
              fallback={
                <button
                  disabled
                  class='bg-primary-600/80 text-cybertext-100 border-primary-400 cursor-wait rounded-xs border px-6 py-3 text-center font-mono transition-all duration-200 focus:ring-2 focus:outline-none'
                >
                  <span class='flex items-center justify-center gap-2'>
                    <Spinner /> Loading...
                  </span>
                </button>
              }
            >
              <Show
                when={isAuthenticated()}
                fallback={
                  <A
                    href='/register'
                    class='bg-primary-600 text-cybertext-100 hover:bg-primary-500 focus:ring-primary-300 border-primary-400 rounded-xs border px-6 py-3 text-center font-mono transition-all duration-200 focus:ring-2 focus:outline-none'
                  >
                    Pre-Register
                  </A>
                }
              >
                <div class='bg-electric-600/20 text-cybertext-400 border-electric-700 rounded-xs border px-6 py-3 text-center font-mono'>
                  <span class='text-success-500 text-lg'>✓</span> Thanks for
                  pre-registering!
                </div>
              </Show>
            </Show>

            <A
              href='https://github.com/aileks/Vyre'
              class='bg-midnight-700 text-electric-400 hover:bg-midnight-600 focus:ring-electric-700 rounded-xs border border-gray-700 px-6 py-3 text-center font-mono transition-all duration-200 focus:ring-2 focus:outline-none'
            >
              Learn More
            </A>
          </div>
        </div>
      </div>
    </div>
  );
}
