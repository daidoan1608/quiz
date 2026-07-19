import React from 'react';
import { Pagination } from 'antd';
import { SubjectCard } from './SubjectCard';

export const SubjectGrid = ({
  clearFilters,
  currentPage,
  favorites,
  filteredSubjects,
  getProgress,
  getStatus,
  handleOpenSubject,
  handlePageChange,
  pageSize,
  paginatedSubjects,
  texts,
  toggleFavorite,
}) => (
  <section className="flex min-w-0 flex-1 flex-col gap-8 lg:row-start-2">
    {paginatedSubjects.length > 0 ? (
      <section className="grid grid-cols-1 content-start gap-6 md:min-h-[840px] md:grid-cols-2 xl:min-h-[560px] xl:grid-cols-3">
        {paginatedSubjects.map((subject, index) => (
          <SubjectCard
            key={subject.subjectId}
            favorites={favorites}
            getProgress={getProgress}
            getStatus={getStatus}
            index={index}
            onOpen={handleOpenSubject}
            subject={subject}
            texts={texts}
            toggleFavorite={toggleFavorite}
          />
        ))}
      </section>
    ) : (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center dark:border-gray-700 dark:bg-gray-800">
        <span className="material-symbols-outlined mb-4 text-6xl text-gray-300">
          search_off
        </span>
        <h3 className="mb-2 text-xl font-black text-gray-950 dark:text-white">
          {texts.noSubjectsFound || 'Không tìm thấy môn học'}
        </h3>
        <p className="mb-5 max-w-sm text-gray-500 dark:text-gray-400">
          {texts.noSubjectsSuggestion ||
            'Thử đổi từ khóa tìm kiếm hoặc chọn khoa khác để xem thêm môn học.'}
        </p>
        <button
          onClick={clearFilters}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white transition-all hover:shadow-lg active:scale-95"
        >
          {texts.viewAllSubjects || 'Xem tất cả môn học'}
        </button>
      </div>
    )}

    {filteredSubjects.length > pageSize && (
      <div className="flex justify-center pt-2">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredSubjects.length}
          onChange={handlePageChange}
          showSizeChanger={false}
          className="aura-pagination"
        />
      </div>
    )}
  </section>
);
