import React from 'react';
import { PageContainer } from 'components/common/PageContainer';
import { MetricCard } from 'components/common/MetricCard';

export const DocumentsHero = ({ stats }) => (
  <section>
    <PageContainer className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-wide text-primary">
          Thư viện chia sẻ
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-gray-950 dark:text-white sm:text-4xl">
          Tài liệu học tập
        </h1>
        <p className="mt-3 text-base leading-7 text-gray-600 dark:text-gray-300">
          Xem và tải xuống các tài liệu được quản trị viên chia sẻ cho sinh viên.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:min-w-72">
        <MetricCard label="Số tài liệu" value={stats.count} />
        <MetricCard label="Dung lượng" value={stats.totalSize} />
      </div>
    </PageContainer>
  </section>
);
