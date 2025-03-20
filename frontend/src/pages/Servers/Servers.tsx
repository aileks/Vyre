import { A } from '@solidjs/router';
import { For, createEffect, createSignal } from 'solid-js';

import { ServerData } from '../../types';
import apiClient from '../../utils/apiClient';

export default function Servers() {
  const [servers, setServers] = createSignal<ServerData[]>([]);

  createEffect(async () => {
    await apiClient.get('/servers').then(res => {
      setServers(res.data.servers);
    });
  });

  return (
    <div class='flex flex-col items-center'>
      <h1 class='mt-12 mb-4 ml-12 text-4xl font-bold underline'>
        Server List:
      </h1>

      <div class='grid grid-cols-2 gap-4'>
        <For each={servers()}>
          {server => (
            <A href={`/servers/${server.id}`}>
              {/* bg-midnight-600 border-primary-800 justify-center rounded-xs border p-4 duration-200 */}
              <div class='border-primary-800 bg-midnight-600 hover:bg-midnight-800 hover:border-primary-700 rounded-xs border p-4 duration-200 hover:cursor-pointer'>
                <img
                  class='border-primary-300 h-32 w-32 rounded-full border-2'
                  src={server.iconUrl}
                  alt={server.name}
                  title={server.name}
                />

                <h3 class='mt-2 text-xl font-semibold'>{server.name}</h3>
                <p class='text-lg'>{server.description}</p>
              </div>
            </A>
          )}
        </For>
      </div>
    </div>
  );
}
