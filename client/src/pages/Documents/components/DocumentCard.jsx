import React from 'react';
import { getDocumentDownloadUrl } from 'api/services/documentApi';
import { formatFileSize, getFileType } from '../utils/documentFormatters';

export const DocumentCard = ({ item }) => (
  <article className="flex min-h-56 flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-slate-900">
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700 dark:bg-blue-400/10 dark:text-blue-200">
        {getFileType(item.originalFilename)}
      </div>
      <div className="min-w-0">
        <h2 className="line-clamp-2 text-lg font-bold text-slate-950 dark:text-white">
          {item.title}
        </h2>
        <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
          {item.originalFilename}
        </p>
      </div>
    </div>

    {item.description && (
      <p className="mt-4 line-clamp-3 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {item.description}
      </p>
    )}

    <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-white/10">
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {formatFileSize(item.fileSize)}
      </span>
      <a
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white !no-underline shadow-sm transition hover:bg-blue-700"
        href={getDocumentDownloadUrl(item.id)}
      >
        <span className="material-symbols-outlined text-lg">download</span>
        Tải về
      </a>
    </div>
  </article>
);
