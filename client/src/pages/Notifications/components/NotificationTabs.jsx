import React from 'react';
import { filterTabs } from '../constants/notificationFilters';

export const NotificationTabs = ({ filter, setFilter }) => (
  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
    {filterTabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => setFilter(tab.id)}
        className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
          filter === tab.id
            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);
