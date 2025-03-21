import { Tabs } from '@kobalte/core/tabs';
import { A, useLocation } from '@solidjs/router';
import { Component, createSignal } from 'solid-js';

const Friends: Component = () => {
  const location = useLocation();

  // Determine active tab based on URL
  const getActiveTabFromUrl = () => {
    const path = location.pathname;
    if (path.includes('/friends/all')) return 'all';
    if (path.includes('/friends/pending')) return 'pending';
    if (path.includes('/friends/blocked')) return 'blocked';
    if (path.includes('/friends/add')) return 'add';
    return 'online'; // Default tab
  };

  const [activeTab, setActiveTab] = createSignal<string>(getActiveTabFromUrl());

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div class='bg-midnight-600 flex h-full flex-col'>
      {/* Friends View Header */}
      <div class='bg-midnight-700 border-b border-gray-700 px-6 py-4'>
        <div class='flex items-center justify-between'>
          <h1 class='text-cybertext-200 font-mono text-xl'>Friends</h1>
          <div class='space-x-2'>
            <button
              class={`rounded-xs px-4 py-2 ${
                activeTab() === 'add' ?
                  'bg-primary-600 text-cybertext-100'
                : 'bg-midnight-800 text-cybertext-300 hover:bg-midnight-600'
              }`}
              onClick={() => setActiveTab('add')}
            >
              Add Friend
            </button>
          </div>
        </div>
      </div>

      {/* Tabs and Content */}
      <Tabs
        value={activeTab()}
        onChange={handleTabChange}
        class='flex flex-1 flex-col'
      >
        <div class='bg-midnight-700 border-b border-gray-700 px-6'>
          <Tabs.List class='flex'>
            <Tabs.Trigger
              value='online'
              class='text-cybertext-400 hover:text-cybertext-200 data-[selected]:text-primary-400 data-[selected]:border-primary-400 border-b-2 border-transparent px-4 py-3'
            >
              Online
            </Tabs.Trigger>
            <Tabs.Trigger
              value='all'
              class='text-cybertext-400 hover:text-cybertext-200 data-[selected]:text-primary-400 data-[selected]:border-primary-400 border-b-2 border-transparent px-4 py-3'
            >
              All
            </Tabs.Trigger>
            <Tabs.Trigger
              value='pending'
              class='text-cybertext-400 hover:text-cybertext-200 data-[selected]:text-primary-400 data-[selected]:border-primary-400 border-b-2 border-transparent px-4 py-3'
            >
              Pending
            </Tabs.Trigger>
            <Tabs.Trigger
              value='blocked'
              class='text-cybertext-400 hover:text-cybertext-200 data-[selected]:text-primary-400 data-[selected]:border-primary-400 border-b-2 border-transparent px-4 py-3'
            >
              Blocked
            </Tabs.Trigger>
            <Tabs.Trigger
              value='add'
              class='text-cybertext-400 hover:text-cybertext-200 data-[selected]:text-primary-400 data-[selected]:border-primary-400 border-b-2 border-transparent px-4 py-3'
            >
              Add Friend
            </Tabs.Trigger>
          </Tabs.List>
        </div>

        {/* Tab content panels */}
        <Tabs.Content value='online' class='flex h-full flex-col p-4'>
          <div class='text-cybertext-300'>Online friends content</div>
        </Tabs.Content>

        <Tabs.Content value='all' class='flex h-full flex-col p-4'>
          <div class='text-cybertext-300'>All friends content</div>
        </Tabs.Content>

        <Tabs.Content value='pending' class='flex h-full flex-col p-4'>
          <div class='text-cybertext-300'>Pending requests content</div>
        </Tabs.Content>

        <Tabs.Content value='blocked' class='flex h-full flex-col p-4'>
          <div class='text-cybertext-300'>Blocked users content</div>
        </Tabs.Content>

        <Tabs.Content value='add' class='flex h-full flex-col p-4'>
          <div class='text-cybertext-300'>Add friend content</div>
        </Tabs.Content>
      </Tabs>
    </div>
  );
};

export default Friends;
