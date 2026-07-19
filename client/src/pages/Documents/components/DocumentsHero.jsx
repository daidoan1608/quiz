import React from 'react';

export const DocumentsHero = ({ stats }) => (
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
);
