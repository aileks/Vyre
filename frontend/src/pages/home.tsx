export default function Home() {
  return (
    <div class='flex min-h-screen items-center justify-center bg-gray-900 p-4'>
      <div class='from-accent-900 to-accent-700 relative w-full max-w-2xl overflow-hidden rounded-lg border-gray-500 bg-gradient-to-br p-12 text-center shadow-xl'>
        {/* Decorative elements */}
        <div class='absolute top-0 left-0 h-full w-full bg-gray-700 opacity-10'></div>
        <div class='bg-accent-300/10 absolute right-0 bottom-0 h-64 w-64 translate-x-1/4 translate-y-1/4 transform rounded-full blur-xl'></div>
        <div class='bg-accent-400/10 absolute top-0 left-0 h-64 w-64 -translate-x-1/4 -translate-y-1/4 transform rounded-full blur-xl'></div>

        <div class='relative z-10'>
          <h1 class='mb-2 font-mono text-6xl font-extrabold tracking-wider text-white md:text-7xl'>COMING SOON!</h1>
          <div class='mx-auto mt-6 h-1 w-full bg-white/80'></div>
        </div>
      </div>
    </div>
  );
}
