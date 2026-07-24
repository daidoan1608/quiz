import InProgressAttemptCard, {
  getInProgressAttemptKey,
} from 'pages/Subject/components/InProgressAttemptCard';
import { formatRemainingTime } from 'pages/Home/utils/attemptFormatters';

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
                attempt={attempt}
                key={getInProgressAttemptKey(attempt)}
                labels={{
                  continue: t('home.inProgress.continue'),
                  examFallback: t('home.examInProgressFallback'),
                  questionUnit: t('exam.questions', 'câu'),
                  status: t('home.inProgress.doing'),
                  subjectFallback: t('home.subjectFallback'),
                  trailingInfo: formatRemainingTime(attempt.remainingTime, t),
                }}
                onContinue={onContinueAttempt}
                showAnsweredSummary
                variant="compact"
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
