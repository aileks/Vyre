/* TODO: Actually use this */

// import { A } from '@solidjs/router';

// import { isAuthenticated } from '../stores/authStore';

// export default function Nav() {
//   return (
//     <nav class='bg-midnight-700 shadow-midnight-900/50 shadow-md'>
//       <ul class='text-cybertext-200 border-primary-800 flex items-center justify-between border-b p-2 text-lg font-medium'>
//         <li class='ml-2'>
//           <A
//             class='text-cybertext-500 hover:text-cybertext-300 transition-all duration-100 hover:font-semibold'
//             href='/'
//           >
//             Home
//           </A>
//         </li>

//         <span class='flex gap-4'>
//           {isAuthenticated() ?
//             <li>
//               {/* COMMENTED OUT FOR PROD */}
//               {/* <span
//                 onClick={handleLogout}
//                 class='hover:text-cybertext-200 text-cybertext-50 bg-error-800 hover:bg-error-700 cursor-pointer rounded-xs px-2 py-0.5 transition-all duration-200'
//               >
//                 Logout
//               </span> */}
//             </li>
//           : <>
//               {/* <li>
//                 <A
//                   class='hover:text-cybertext-400 rounded-xs bg-pink-600 px-2 py-0.5 transition-all duration-200 hover:bg-pink-500'
//                   href='/register'
//                 >
//                   Register
//                 </A>
//               </li> */}

//               <li class='mr-2'>
//                 <A
//                   class='bg-electric-600 hover:bg-electric-500 hover:text-cybertext-400 rounded-xs px-2 py-0.5 transition-all duration-200'
//                   href='/login'
//                 >
//                   Login
//                 </A>
//               </li>
//             </>
//           }
//         </span>
//       </ul>
//     </nav>
//   );
// }
