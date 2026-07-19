import ExamHistoryList from './ExamHistoryList';
import InProgressAttemptsSection from './roadmap/InProgressAttemptsSection';
import LearningStatsSection from './roadmap/LearningStatsSection';
import RoadmapSuggestions from './roadmap/RoadmapSuggestions';
import SubjectProgressSection from './roadmap/SubjectProgressSection';

const Roadmap = ({
  groupedExams,
  inProgressAttempts,
  learningStats,
  texts,
  onContinueAttempt,
}) => {
  const attemptedSubjects = Object.keys(groupedExams);

  return (
    <div className="space-y-8">
      <LearningStatsSection learningStats={learningStats} />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SubjectProgressSection
          subjectProgress={learningStats?.subjectProgress || []}
        />
        <RoadmapSuggestions roadmap={learningStats?.roadmap || []} />
      </section>

      <InProgressAttemptsSection
        inProgressAttempts={inProgressAttempts}
        onContinueAttempt={onContinueAttempt}
        texts={texts}
      />

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <span className="material-symbols-outlined text-primary">
              school
            </span>
            {texts.attemptedSubjects || 'Môn đã thi'}
          </h3>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            {attemptedSubjects.length} {texts.subjectUnit || 'môn'}
          </span>
        </div>
        <ExamHistoryList groupedExams={groupedExams} texts={texts} />
      </section>
    </div>
  );
};

export default Roadmap;
