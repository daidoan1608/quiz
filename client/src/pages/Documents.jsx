import React, { useEffect, useMemo, useState } from 'react';
import { documentApi, getDocumentDownloadUrl } from 'api/documentApi';

const formatFileSize = (size = 0) => {
  if (!size) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(
    Math.floor(Math.log(size) / Math.log(1024)),
    units.length - 1
  );
  return `${(size / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const getFileType = (filename = '') => filename.split('.').pop()?.toUpperCase() || 'FILE';

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    documentApi
      .getAll()
      .then((items) => {
        if (active) setDocuments(Array.isArray(items) ? items : []);
      })
      .catch(() => {
        if (active) {
          setError('Không thể tải danh sách tài liệu. Vui lòng thử lại sau.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const totalSize = documents.reduce((sum, item) => sum + (item.fileSize || 0), 0);
    return { count: documents.length, totalSize: formatFileSize(totalSize) };
  }, [documents]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <section className="border-b border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">
              Thư viện chia sẻ
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white sm:text-4xl">
              Tài liệu học tập
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
              Xem và tải xuống các tài liệu được quản trị viên chia sẻ cho sinh viên.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-72">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm text-slate-500 dark:text-slate-400">Số tài liệu</p>
              <p className="mt-1 text-2xl font-bold">{stats.count}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm text-slate-500 dark:text-slate-400">Dung lượng</p>
              <p className="mt-1 text-2xl font-bold">{stats.totalSize}</p>
            </div>
          </div>
        </div>
      </section>

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
              <article
                key={item.id}
                className="flex min-h-56 flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-slate-900"
              >
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
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
