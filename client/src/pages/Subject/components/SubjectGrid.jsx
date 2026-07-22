import React from 'react';
import { Pagination } from 'antd';
import { PageEmptyState } from 'components/common/PageState';
import { SubjectCard } from './SubjectCard';

export const SubjectGrid = ({
  canToggleFavorite,
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
  <section className="flex min-w-0 flex-1 flex-col lg:row-start-2">
    {paginatedSubjects.length > 0 ? (
      <section className="grid min-h-[2040px] grid-cols-1 content-start gap-6 md:min-h-[1008px] md:grid-cols-2 xl:min-h-[664px] xl:grid-cols-3">
        {paginatedSubjects.map((subject, index) => (
          <SubjectCard
            canToggleFavorite={canToggleFavorite}
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
      <PageEmptyState
        action={
          <button
            onClick={clearFilters}
            className="aura-button aura-button-primary mt-5 px-5 text-sm"
            type="button"
          >
            {texts.viewAllSubjects || 'Xem tất cả môn học'}
          </button>
        }
        className="py-16"
        description={
          texts.noSubjectsSuggestion ||
          'Thử đổi từ khóa tìm kiếm hoặc chọn khoa khác để xem thêm môn học.'
        }
        icon="search_off"
        title={texts.noSubjectsFound || 'Không tìm thấy môn học'}
      />
    )}

    <div className="flex min-h-14 items-start justify-center pt-8">
      {filteredSubjects.length > pageSize && (
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredSubjects.length}
          onChange={handlePageChange}
          showSizeChanger={false}
          className="aura-pagination"
        />
      )}
    </div>
  </section>
);
