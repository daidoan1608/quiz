import React from 'react';
import { DocumentCard } from './DocumentCard';
import { DocumentsHero } from './DocumentsHero';

export const DocumentsView = ({ documents, error, loading, stats }) => (
  <main className="flex-1 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <DocumentsHero stats={stats} />

    <section className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
      {loading && (
        <div className="flex min-h-72 items-center justify-center text-slate-500 dark:text-slate-300">
          Đang tải tài liệu...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && documents.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center dark:border-white/15 dark:bg-white/5">
          <span className="material-symbols-outlined text-5xl text-slate-400">
            folder_open
          </span>
          <h2 className="mt-3 text-xl font-semibold">Chưa có tài liệu</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Khi admin đăng tài liệu mới, danh sách sẽ hiển thị tại đây.
          </p>
        </div>
      )}

      {!loading && !error && documents.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {documents.map((item) => (
            <DocumentCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  </main>
);
