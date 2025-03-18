// import { createEffect, createSignal } from 'solid-js';

// import apiClient from '../utils/apiClient';

// interface Server {
//   id: string;
//   name: string;
//   description: string;
//   iconUrl: string;
// }

export default function Servers() {
  // const [servers, setServers] = createSignal<Server[]>([]);

  // createEffect(() => {
  //   apiClient.get('/servers').then(res => {
  //     setServers(res.data);
  //   });
  // });

  return (
    <div>
      <h1 class='mt-12 ml-12 text-2xl font-bold'>Hello from Servers</h1>
    </div>
  );
}
