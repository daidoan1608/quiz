import { getAttemptProgress } from 'pages/Account/utils/accountUtils';
import { progressValueStyle } from 'utils/styleVariables';

export default function InProgressAttemptCard({ attempt, texts, onContinue }) {
  const progress = getAttemptProgress(attempt);

  return (
    <div className="rounded-xl border border-amber-100 bg-white p-4 shadow-sm dark:border-amber-900/30 dark:bg-gray-800">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h4 className="line-clamp-2 font-bold text-gray-900 dark:text-white">
            {attempt.title ||
              texts.inProgressExamFallback ||
              'Bài thi đang làm'}
          </h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {attempt.subjectName ||
              texts.unknownSubject ||
              'Chưa xác định môn học'}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          {progress}%
        </span>
      </div>
      <div className="aura-progress mb-4 h-2">
        <div
          className="aura-progress__bar aura-progress__bar--warning"
          style={progressValueStyle(progress)}
        />
      </div>
      <button
        onClick={() => onContinue(attempt)}
        className="w-full rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-600 active:scale-95"
        type="button"
      >
        {texts.continueExam || 'Tiếp tục làm bài'}
      </button>
    </div>
  );
}
