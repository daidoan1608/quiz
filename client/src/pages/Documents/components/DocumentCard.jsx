import React from 'react';
import {
  formatFileSize,
  getDocumentDownloadUrl,
  getFileType,
} from '../utils/documentFormatters';

export const DocumentCard = ({ item }) => (
  <article className="aura-surface-panel aura-surface-panel-hover flex min-h-56 flex-col p-5">
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
        {getFileType(item.originalFilename)}
      </div>
      <div className="min-w-0">
        <h2 className="line-clamp-2 text-lg font-bold text-gray-950 dark:text-white">
          {item.title}
        </h2>
        <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">
          {item.originalFilename}
        </p>
      </div>
    </div>

    {item.description && (
      <p className="mt-4 line-clamp-3 flex-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
        {item.description}
      </p>
    )}

    <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-700">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {formatFileSize(item.fileSize)}
      </span>
      <a
        className="aura-button aura-button-primary min-h-0 px-4 py-2 text-sm font-semibold !no-underline"
        href={getDocumentDownloadUrl(item.id)}
      >
        <span className="material-symbols-outlined text-lg">download</span>
        Tải về
      </a>
    </div>
  </article>
);
