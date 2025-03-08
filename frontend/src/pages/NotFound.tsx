import { A } from '@solidjs/router';

export default function NotFound() {
  return (
    <div class='bg-midnight-700 shadow-midnight-900/50 mx-auto mt-64 max-w-xl rounded-xs border border-gray-700 p-7 shadow-lg'>
      <div class='text-center'>
        <div class='text-error-500 mb-3 font-mono text-5xl font-bold underline'>404</div>
        <div class='text-error-600 mb-4 font-mono text-xl font-semibold tracking-wide'>Failure!</div>
      </div>

      <div class='text-cybertext-400 mb-6 text-center font-mono'>The requested channel or user does not exist.</div>

      <div class='border-midnight-900 bg-midnight-800 mb-8 rounded-xs border p-4 font-mono'>
        <div class='flex items-start'>
          <div class='text-error-500 mr-2'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              class='h-5 w-5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                stroke-linecap='round'
                stroke-linejoin='round'
                stroke-width='2'
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
              />
            </svg>
          </div>
          <div>
            <div class='text-error-400 mb-1 text-sm font-bold'>ERROR: Resource not found</div>
            <code class='text-cybertext-300 block text-xs'>
              [SERVER]: The requested resource could not be located on this server.
              <br />
              [SERVER]: Error code: 404
              <br />
              [SERVER]: Timestamp: {new Date().toISOString()}
            </code>
          </div>
        </div>
      </div>

      <A
        href='/'
        class='bg-primary-600 text-cybertext-100 hover:bg-primary-500 focus:ring-primary-500/50 border-primary-400 flex items-center justify-center rounded-xs border px-4 py-2.5 font-mono transition-all duration-200 focus:ring-2 focus:outline-none'
      >
        Go Back
      </A>
    </div>
  );
}
