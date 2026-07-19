import React from 'react';
import { PageContainer } from 'components/common/PageContainer';
import { DocumentCard } from './DocumentCard';
import { DocumentsHero } from './DocumentsHero';

export const DocumentsView = ({ documents, error, loading, stats }) => (
  <main className="flex-1 bg-background-light text-gray-900 transition-colors duration-300 dark:bg-background-dark dark:text-gray-100">
    <DocumentsHero stats={stats} />

    <PageContainer as="section" className="pt-0">
      {loading && (
        <div className="flex min-h-72 items-center justify-center text-gray-500 dark:text-gray-300">
          Đang tải tài liệu...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && documents.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <span className="material-symbols-outlined text-5xl text-gray-400">
            folder_open
          </span>
          <h2 className="mt-3 text-xl font-semibold">Chưa có tài liệu</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Khi admin đăng tài liệu mới, danh sách sẽ hiển thị tại đây.
          </p>
        </div>
      )}

      {!loading && !error && documents.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {documents.map((item) => (
            <DocumentCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </PageContainer>
  </main>
);
