import { useParams } from '@solidjs/router';
import { Show, createEffect, createSignal } from 'solid-js';

import SpinnerFallback from '../../components/SpinnerFallback';
import { ServerData } from '../../types/serverTypes';
import apiClient from '../../utils/apiClient';

export default function Server() {
  const [server, setServer] = createSignal<ServerData | null>(null);
  setServer(null);
  const params = useParams();
  const serverId = params.id;

  createEffect(async () => {
    const res = await apiClient.get(`/servers/${serverId}`);
    setServer(res.data.server);
  });

  const parseDate = (date?: string) => {
    if (!date) return 'Unknown date';

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <Show when={server()} fallback={<SpinnerFallback />}>
      <div class='flex justify-center p-18'>
        <div class='bg-midnight-600 border-primary-800 justify-center rounded-xs border p-4 duration-200'>
          <div class='flex items-center gap-4'>
            <img
              class='border-primary-300 h-32 w-32 rounded-full border-2'
              src={server()?.iconUrl}
              alt={server()?.name}
              title={server()?.name}
            />
            <h3 class='text-xl font-bold'>{server()?.name}</h3>
          </div>

          <p class='mt-2 text-lg'>{server()?.description}</p>

          <p class='text-cybertext-700 mt-2 font-semibold italic'>
            Created: {parseDate(server()?.createdAt)}
          </p>
        </div>
      </div>
    </Show>
  );
}
