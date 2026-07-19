import React from 'react';
import { getDocumentDownloadUrl } from 'api/services/documentApi';
import { formatFileSize, getFileType } from '../utils/documentFormatters';

export const DocumentCard = ({ item }) => (
  <article className="flex min-h-56 flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
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
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white !no-underline shadow-sm transition hover:brightness-110"
        href={getDocumentDownloadUrl(item.id)}
      >
        <span className="material-symbols-outlined text-lg">download</span>
        Tải về
      </a>
    </div>
  </article>
);
