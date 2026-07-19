import React from 'react';
import { progressValueStyle } from 'utils/styleVariables';
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
    <article
      onClick={() => onOpen(subject)}
      className="subject-card group flex min-h-[260px] cursor-pointer flex-col gap-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <span className="material-symbols-outlined text-[32px]">
            {subjectIcons[index % subjectIcons.length]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${status.className}`}>
            {status.text}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(subject.subjectId, subject.name);
            }}
            disabled={!localStorage.getItem('userId')}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-700"
            title={texts.favorite || 'Yêu thích'}
            >
            <span
              className={`material-symbols-outlined text-xl ${isFavorited ? 'aura-material-filled text-red-500' : 'aura-material-outlined'}`}
            >
              favorite
            </span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="line-clamp-2 text-2xl font-bold leading-tight text-gray-950 transition-colors group-hover:text-primary dark:text-white">
          {subject.name}
        </h3>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {subject.totalChapters || 0} {texts.chapters || 'chương'} •{' '}
          {subject.totalQuestions || 0} {texts.questions || 'câu hỏi'} •{' '}
          {subject.totalExams || 0} {texts.examsCount || 'đề thi'}
        </p>
      </div>

      <div className="mt-auto space-y-3">
        <div className="flex items-end justify-between">
          <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
            {texts.readiness || 'Mức độ sẵn sàng'}
          </span>
          <span className="text-sm font-bold text-primary">{progress}%</span>
        </div>
        <div className="aura-progress h-2 w-full">
          <div
            className="aura-progress__bar aura-progress__bar--primary group-hover:brightness-110"
            style={progressValueStyle(progress)}
          />
        </div>
      </div>
    </article>
  );
};
