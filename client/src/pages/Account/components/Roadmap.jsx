import ExamHistoryList from "./ExamHistoryList";
import { getAttemptProgress } from "pages/Account/utils/accountUtils";

const InProgressAttemptCard = ({ attempt, texts, onContinue }) => {
  const progress = getAttemptProgress(attempt);

  return (
    <div className="rounded-xl border border-amber-100 bg-white p-4 shadow-sm dark:border-amber-900/30 dark:bg-gray-800">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h4 className="line-clamp-2 font-bold text-gray-900 dark:text-white">
            {attempt.title || texts.inProgressExamFallback || "Bài thi đang làm"}
          </h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {attempt.subjectName || texts.unknownSubject || "Chưa xác định môn học"}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          {progress}%
        </span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
        <div className="h-full rounded-full bg-amber-500" style={{ width: `${progress}%` }} />
      </div>
      <button onClick={() => onContinue(attempt)} className="w-full rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-600 active:scale-95">
        {texts.continueExam || "Tiếp tục làm bài"}
      </button>
    </div>
  );
};

const Roadmap = ({ groupedExams, inProgressAttempts, texts, onContinueAttempt }) => {
  const attemptedSubjects = Object.keys(groupedExams);

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900/40 dark:bg-amber-900/10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <span className="material-symbols-outlined text-amber-500">pending_actions</span>
            {texts.inProgressExams || "Bài đang làm dở"}
          </h3>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-amber-700 shadow-sm dark:bg-gray-800 dark:text-amber-300">
            {inProgressAttempts.length} {texts.examAttemptUnit || "bài"}
          </span>
        </div>

        {inProgressAttempts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {inProgressAttempts.map((attempt) => (
              <InProgressAttemptCard
                key={attempt.attemptId || attempt.userExamId || attempt.examId}
                attempt={attempt}
                texts={texts}
                onContinue={onContinueAttempt}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-amber-200 bg-white p-6 text-center text-gray-500 dark:border-amber-900/30 dark:bg-gray-800 dark:text-gray-400">
            {texts.noInProgressExams || "Không có bài thi nào đang làm dở."}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <span className="material-symbols-outlined text-primary">school</span>
            {texts.attemptedSubjects || "Môn đã thi"}
          </h3>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            {attemptedSubjects.length} {texts.subjectUnit || "môn"}
          </span>
        </div>
        <ExamHistoryList groupedExams={groupedExams} texts={texts} />
      </section>
    </div>
  );
};

export default Roadmap;
