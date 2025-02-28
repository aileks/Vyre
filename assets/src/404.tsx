export default function NotFound() {
  return (
    <main class='flex min-h-screen w-full bg-zinc-900 text-zinc-200'>
      <div class='m-auto w-full max-w-lg px-4 py-8 text-center sm:px-8'>
        <div class='rounded-xs border border-zinc-700 bg-zinc-800 p-6 shadow-md'>
          <h1 class='mb-4 text-2xl font-bold text-violet-400'>404 Error</h1>
          <div class='space-y-4 rounded-xs border border-zinc-700 bg-zinc-900 p-3 text-left font-mono'>
            <p class='text-red-400'>
              <span class='text-zinc-500'>[System]: </span>
              Connection refused. Unable to locate requested resource.
            </p>
            <p class='text-zinc-300'>
              <span class='text-zinc-500'>[Server]: </span>
              The page you were looking for could not be found.
            </p>
            <p class='text-zinc-300'>
              <span class='text-zinc-500'>[Server]: </span>
              Please check the URL or return to the home channel.
            </p>
          </div>
          <div class='mt-6'>
            <a
              href='/'
              class='inline-block rounded-xs bg-violet-600 px-6 py-2 text-white transition-colors hover:bg-violet-700 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-violet-400'
            >
              Return to Home
            </a>
          </div>
          <p class='mt-4 text-xs text-zinc-500'>
            Channel #<span class='text-zinc-400'>404</span> | Session terminated
          </p>
        </div>
      </div>
    </main>
  );
}
