import React from 'react';

export const SessionInfoCard = ({ className = '', rows, title }) => (
  <div className={`aura-surface-panel rounded-2xl p-5 ${className}`}>
    <h4 className="mb-2 line-clamp-2 text-lg font-bold">{title}</h4>
    {rows.map((row) => (
      <p
        className="text-sm text-gray-500 dark:text-gray-400"
        key={row.label}
      >
        {row.label}: {row.value}
      </p>
    ))}
  </div>
);
