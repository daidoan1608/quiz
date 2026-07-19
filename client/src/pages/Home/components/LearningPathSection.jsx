import RoadmapSuggestions from 'pages/Account/components/roadmap/RoadmapSuggestions';
import SubjectProgressSection from 'pages/Account/components/roadmap/SubjectProgressSection';

export default function LearningPathSection({ learningStats }) {
  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <SubjectProgressSection
        subjectProgress={learningStats?.subjectProgress || []}
      />
      <RoadmapSuggestions roadmap={learningStats?.roadmap || []} />
    </section>
  );
}
