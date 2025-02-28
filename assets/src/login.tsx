// import { A, type RouteSectionProps, useSubmission } from '@solidjs/router';
// import { Show, createSignal } from 'solid-js';

// import { loginOrRegister } from '~/api';

// export default function Login(props: RouteSectionProps) {
//   const loggingIn = useSubmission(loginOrRegister);
//   const [loginType, setLoginType] = createSignal<'login' | 'register'>('login');

//   return (
//     <main class='flex min-h-screen w-full bg-zinc-900 text-zinc-200'>
//       <div class='m-auto w-full max-w-md px-4 py-8 sm:px-8'>
//         <div class='rounded-xs border border-zinc-700 bg-zinc-800 p-4 shadow-md sm:p-6'>
//           <div class='mb-6'>
//             <h1
//               class='mb-2 text-4xl font-bold text-violet-500'
//               id='login-header'
//             >
//               {loginType() === 'login' ? 'Login' : 'Register'}
//             </h1>
//             <p class='text-zinc-300'>
//               {loginType() === 'login' ?
//                 'Sign in to your account'
//               : 'Create a new account'}
//             </p>
//           </div>

//           <form
//             action={loginOrRegister}
//             method='post'
//             class='space-y-6'
//             aria-labelledby='login-header'
//             novalidate
//           >
//             <input
//               type='hidden'
//               name='redirectTo'
//               value={props.params.redirectTo ?? '/'}
//             />

//             <fieldset class='space-y-2'>
//               <legend class='mb-2 block font-semibold text-zinc-300'>
//                 Login or Register?
//               </legend>

//               <div class='flex gap-4'>
//                 <label class='flex cursor-pointer items-center space-x-2'>
//                   <input
//                     type='radio'
//                     name='loginType'
//                     value='login'
//                     checked={loginType() === 'login'}
//                     onChange={() => setLoginType('login')}
//                     class='h-4 w-4 rounded-xs border-zinc-600 bg-zinc-700 text-violet-500 focus:ring-0 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-violet-500'
//                     aria-describedby='login-description'
//                   />
//                   <span>Login</span>
//                 </label>

//                 <label class='flex cursor-pointer items-center space-x-2'>
//                   <input
//                     type='radio'
//                     name='loginType'
//                     value='register'
//                     checked={loginType() === 'register'}
//                     onChange={() => setLoginType('register')}
//                     class='h-4 w-4 rounded-xs border-zinc-600 bg-zinc-700 text-violet-500 focus:ring-0 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-violet-500'
//                     aria-describedby='register-description'
//                   />
//                   <span>Register</span>
//                 </label>
//               </div>
//               <div class='sr-only' id='login-description'>
//                 Select to log in to an existing account
//               </div>
//               <div class='sr-only' id='register-description'>
//                 Select to create a new account
//               </div>
//             </fieldset>

//             <div class='space-y-1'>
//               <label
//                 for='username-input'
//                 class='block text-sm font-medium text-zinc-300'
//               >
//                 Username
//               </label>
//               <input
//                 id='username-input'
//                 name='username'
//                 placeholder='user'
//                 autocomplete='username'
//                 class='w-full rounded-xs border border-zinc-700 bg-zinc-900 p-2 transition-colors hover:border-zinc-600 focus:border-2 focus:border-violet-500 focus:outline-none'
//                 required
//                 aria-required='true'
//               />
//             </div>

//             <div class='space-y-1'>
//               <label
//                 for='password-input'
//                 class='block text-sm font-medium text-zinc-300'
//               >
//                 Password
//               </label>
//               <input
//                 id='password-input'
//                 name='password'
//                 type='password'
//                 placeholder='••••••••'
//                 autocomplete={
//                   loginType() === 'login' ? 'current-password' : 'new-password'
//                 }
//                 class='w-full rounded-xs border border-zinc-700 bg-zinc-900 p-2 transition-colors hover:border-zinc-600 focus:border-2 focus:border-violet-500 focus:outline-none'
//                 required
//                 aria-required='true'
//                 minlength={loginType() === 'register' ? 8 : undefined}
//               />
//             </div>

//             <button
//               type='submit'
//               class='w-full rounded-xs bg-violet-600 px-4 py-2 text-sm text-white transition-colors hover:bg-violet-700 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-violet-400 disabled:cursor-not-allowed disabled:opacity-70 sm:text-base'
//               disabled={loggingIn.pending}
//               aria-busy={loggingIn.pending}
//             >
//               {loggingIn.pending ?
//                 'Processing...'
//               : loginType() === 'login' ?
//                 'Sign In'
//               : 'Create Account'}
//             </button>

//             <Show when={loggingIn.result}>
//               <div
//                 class='rounded-xs border border-red-800 bg-red-900/30 p-3 text-sm text-red-300'
//                 role='alert'
//                 id='error-message'
//                 aria-live='assertive'
//               >
//                 <p>{loggingIn.result!.message}</p>
//               </div>
//             </Show>

//             <div class='pt-1 text-center text-sm'>
//               <span class='text-zinc-400'>Forgot your password? </span>
//               <A
//                 href='/reset-password'
//                 class='text-violet-400 hover:underline focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-violet-400'
//               >
//                 Reset it here
//               </A>
//             </div>
//           </form>
//         </div>
//       </div>
//     </main>
//   );
// }
