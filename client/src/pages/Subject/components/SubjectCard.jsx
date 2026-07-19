import React from 'react';
import { SubjectSummaryCard } from 'components/common/SubjectSummaryCard';
import { subjectIcons } from '../constants/subjectIcons';

export const SubjectCard = ({
  favorites,
  getProgress,
  getStatus,
  index,
  onOpen,
  subject,
  texts,
  toggleFavorite,
}) => {
  const progress = getProgress(subject);
  const status = getStatus(subject);
  const isFavorited = favorites.some(
    (fav) => fav.subjectId === subject.subjectId
  );

  return (
    <SubjectSummaryCard
      actions={
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(subject.subjectId, subject.name);
          }}
          disabled={!localStorage.getItem('userId')}
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-700"
          title={texts.favorite || 'Yêu thích'}
          type="button"
        >
          <span
            className={`material-symbols-outlined text-xl ${isFavorited ? 'aura-material-filled text-red-500' : 'aura-material-outlined'}`}
          >
            favorite
          </span>
        </button>
      }
      icon={
        <span className="material-symbols-outlined text-[32px]">
          {subjectIcons[index % subjectIcons.length]}
        </span>
      }
      onClick={() => onOpen(subject)}
      progress={{ value: progress }}
      progressLabel={texts.readiness || 'Mức độ sẵn sàng'}
      status={
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${status.className}`}>
          {status.text}
        </span>
      }
      subjectName={subject.name}
      subtitle={
        <>
          {subject.description && (
            <span className="mb-2 block line-clamp-2 leading-5">
              {subject.description}
            </span>
          )}
          <span>
            {subject.totalChapters || 0} {texts.chapters || 'chương'} •{' '}
            {subject.totalQuestions || 0} {texts.questions || 'câu hỏi'} •{' '}
            {subject.totalExams || 0} {texts.examsCount || 'đề thi'}
          </span>
        </>
      }
    />
  );
};
