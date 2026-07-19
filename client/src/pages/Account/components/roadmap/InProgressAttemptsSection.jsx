import InProgressAttemptCard from './InProgressAttemptCard';

export default function InProgressAttemptsSection({
  inProgressAttempts,
  onContinueAttempt,
  texts,
}) {
  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900/40 dark:bg-amber-900/10">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
          <span className="material-symbols-outlined text-amber-500">
            pending_actions
          </span>
          {texts.inProgressExams || 'Bài đang làm dở'}
        </h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-amber-700 shadow-sm dark:bg-gray-800 dark:text-amber-300">
          {inProgressAttempts.length} {texts.examAttemptUnit || 'bài'}
        </span>
      </div>

      {inProgressAttempts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {inProgressAttempts.map((attempt) => (
            <InProgressAttemptCard
              attempt={attempt}
              key={attempt.attemptId || attempt.userExamId || attempt.examId}
              onContinue={onContinueAttempt}
              texts={texts}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-amber-200 bg-white p-6 text-center text-gray-500 dark:border-amber-900/30 dark:bg-gray-800 dark:text-gray-400">
          {texts.noInProgressExams || 'Không có bài thi nào đang làm dở.'}
        </div>
      )}
    </section>
  );
}
