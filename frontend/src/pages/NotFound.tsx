import { A } from '@solidjs/router';

export default function NotFound() {
  return (
    <div class='mx-auto my-12 max-w-md rounded border border-[gray-700] bg-gray-900 p-7'>
      <div class='text-accent-500 mb-3 text-2xl font-semibold'>404 Error</div>
      <div class='mb-6 text-gray-400'>The page you were looking for could not be found.</div>

      <div class='text-error-500 mb-4 text-sm'>The requested resource could not be located on this server.</div>

      <A
        href='/'
        class='bg-accent-500 hover:bg-accent-600 block w-full rounded px-4 py-2 text-center text-white transition-colors'
      >
        Return to Home
      </A>
    </div>
  );
}
