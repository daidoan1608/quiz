import ScoreChart from '../ScoreChart';
import ExamAttemptCard from './ExamAttemptCard';

export default function ExamSubjectHistory({
  exams,
  isExpanded,
  onShowDetail,
  onToggle,
  subject,
  texts,
}) {
  return (
    <div className="flex flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-sm">
      <button
        onClick={onToggle}
        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors select-none"
        type="button"
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">
            folder_open
          </span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {subject}
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({exams.length} {texts?.examAttemptUnit || 'bài'})
            </span>
          </h3>
        </div>

        <span
          className={`material-symbols-outlined text-gray-500 transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        >
          expand_more
        </span>
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 animation-slide-down">
          <div className="mb-6">
            <ScoreChart data={exams} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((exam, index) => (
              <ExamAttemptCard
                exam={exam}
                key={exam.userExamDto?.userExamId || `${exam.examId}-${index}`}
                onShowDetail={onShowDetail}
                texts={texts}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
