import { formatExamDate } from './examHistoryFormatters';

export default function ExamAttemptCard({ exam, onShowDetail, texts }) {
  return (
    <div className="group flex flex-col p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50 transition-all bg-gray-50 dark:bg-gray-800/50 hover:shadow-md">
      <div className="flex justify-between items-start mb-3 gap-2">
        <h4
          className="font-semibold text-gray-800 dark:text-white line-clamp-2 text-sm"
          title={exam.title}
        >
          {exam.title}
        </h4>
        <span
          className={`shrink-0 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap ${
            exam.score >= 50
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {exam.score.toFixed(1)} {texts?.score || 'đ'}
        </span>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mb-4 flex-1">
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">
            calendar_today
          </span>
          {formatExamDate(exam.startTime)}
        </div>
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">
            check_circle
          </span>
          {exam.userExamDto?.correctAnswers ?? 0}/
          {exam.userExamDto?.totalQuestions ?? 0}{' '}
          {texts?.correctUnit || 'câu đúng'}
        </div>
      </div>

      <button
        onClick={(event) => {
          event.stopPropagation();
          onShowDetail(exam);
        }}
        className="mt-auto w-full py-2 rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-sm"
        type="button"
      >
        {texts?.showDetail || 'Xem chi tiết'}
      </button>
    </div>
  );
}
