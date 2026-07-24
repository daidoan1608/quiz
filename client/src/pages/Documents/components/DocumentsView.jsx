import React from 'react';
import { PageEmptyState, PageLoadingState } from 'components/common/PageState';
import { PageContainer } from 'components/common/PageContainer';
import { DocumentCard } from './DocumentCard';
import { DocumentsHero } from './DocumentsHero';

export const DocumentsView = ({ documents, error, loading, stats }) => (
  <main className="flex-1 bg-background-light text-gray-900 transition-colors duration-300 dark:bg-background-dark dark:text-gray-100">
    <DocumentsHero stats={stats} />

    <PageContainer as="section" className="pt-0">
      {loading && (
        <PageLoadingState
          label="Đang tải tài liệu..."
          minHeightClassName="min-h-72"
        />
      )}

      {!loading && error && (
        <div className="aura-alert-error p-5">{error}</div>
      )}

      {!loading && !error && documents.length === 0 && (
        <PageEmptyState
          className="p-10"
          description="Khi admin đăng tài liệu mới, danh sách sẽ hiển thị tại đây."
          icon="folder_open"
          title="Chưa có tài liệu"
        />
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
