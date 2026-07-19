import { SubjectSummaryCard } from 'components/common/SubjectSummaryCard';

export default function SubjectsSection({ subjects, t, onSelectSubject }) {
  return (
    <section>
      <div className="flex items-center justify-between px-2 pb-5 pt-2">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          {t('home.subjectsTitle')}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {subjects.length > 0 ? (
          subjects.map((subject, index) => (
            <SubjectCard
              key={subject.subjectId || subject.name || index}
              subject={subject}
              t={t}
              onClick={() => onSelectSubject(subject.subjectId)}
            />
          ))
        ) : (
          <EmptySubjectsMessage t={t} />
        )}
      </div>
    </section>
  );
}

function SubjectCard({ subject, t, onClick }) {
  return (
    <SubjectSummaryCard
      minHeightClassName="min-h-[180px]"
      onClick={onClick}
      subjectName={subject.name}
      subtitle={t('home.questionCount', { count: subject.totalQuestions })}
    />
  );
}

function EmptySubjectsMessage({ t }) {
  return (
    <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
      {t('home.noSubjects')}
    </div>
  );
}
