import React from 'react';
import { SubjectSummaryCard } from 'components/common/SubjectSummaryCard';
import { subjectIcons } from '../constants/subjectIcons';
import {
  getSubjectChapterCount,
  getSubjectExamCount,
  getSubjectQuestionCount,
} from '../utils/subjectPresentation';

export const SubjectCard = ({
  canToggleFavorite,
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
  const chapterCount = getSubjectChapterCount(subject);
  const examCount = getSubjectExamCount(subject);
  const questionCount = getSubjectQuestionCount(subject);
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
          disabled={!canToggleFavorite}
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
      minHeightClassName="h-[320px]"
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
        <span>
          {chapterCount} {texts.chapters || 'chương'} • {questionCount}{' '}
          {texts.questions || 'câu hỏi'} • {examCount}{' '}
          {texts.examsCount || 'đề thi'}
        </span>
      }
    />
  );
};
