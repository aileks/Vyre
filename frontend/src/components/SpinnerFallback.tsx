export default function SpinnerFallback() {
  return (
    <div class='bg-midnight-400 flex min-h-screen w-full items-center justify-center'>
      <div class='border-primary-600 h-12 w-12 animate-spin rounded-full border-3 border-t-transparent sm:h-16 sm:w-16'></div>
    </div>
  );
}
