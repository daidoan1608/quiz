import {
  formatRemainingTime,
  getAttemptKey,
  getAttemptProgress,
} from 'pages/Home/utils/attemptFormatters';
import { progressValueStyle } from 'utils/styleVariables';

export default function InProgressSidebar({
  attempts,
  isLoggedIn,
  t,
  onContinueAttempt,
}) {
  return (
    <aside className="lg:col-span-1">
      <div className="sticky top-24 rounded-xl">
        <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] pb-4 pt-2 text-gray-900 dark:text-white">
          {t('home.inProgress.title')}
        </h2>
        <div className="flex flex-col gap-4">
          {isLoggedIn && attempts.length > 0 ? (
            attempts.map((attempt) => (
              <InProgressAttemptCard
                key={getAttemptKey(attempt)}
                attempt={attempt}
                t={t}
                onContinue={() => onContinueAttempt(attempt)}
              />
            ))
          ) : (
            <EmptyAttemptsMessage isLoggedIn={isLoggedIn} t={t} />
          )}
        </div>
      </div>
    </aside>
  );
}

function InProgressAttemptCard({ attempt, t, onContinue }) {
  const progress = getAttemptProgress(attempt);

  return (
    <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-amber-100 dark:border-amber-900/40 shadow-sm">
      <div className="flex justify-between items-start gap-3 mb-2">
        <p className="font-bold text-gray-800 dark:text-white line-clamp-2">
          {attempt.title || t('home.examInProgressFallback')}
        </p>
        <span className="shrink-0 text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
          {t('home.inProgress.doing')}
        </span>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        {attempt.subjectName || t('home.subjectFallback')} •{' '}
        {formatRemainingTime(attempt.remainingTime, t)}
      </p>
      <div className="aura-progress mb-3 h-2 w-full">
        <div
          className="aura-progress__bar aura-progress__bar--warning"
          style={progressValueStyle(progress)}
        />
      </div>
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {attempt.answeredCount || 0}/{attempt.totalQuestions || 0}{' '}
          {t('exam.questions', 'câu')} • {progress}%
        </p>
        <button
          type="button"
          onClick={onContinue}
          className="text-sm font-bold text-blue-600 hover:underline"
        >
          {t('home.inProgress.continue')}
        </button>
      </div>
    </div>
  );
}

function EmptyAttemptsMessage({ isLoggedIn, t }) {
  return (
    <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 text-center shadow-sm">
      <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">
        history_edu
      </span>
      <p className="font-bold text-gray-800 dark:text-white">
        {isLoggedIn
          ? t('home.inProgress.emptyLoggedIn')
          : t('home.inProgress.emptyGuest')}
      </p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {t('home.inProgress.emptyDescription')}
      </p>
    </div>
  );
}
