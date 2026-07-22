import { MetricCard } from 'components/common/MetricCard';
import { formatScore } from './roadmapFormatters';

export default function LearningStatsSection({ learningStats }) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
          <span className="material-symbols-outlined text-primary">
            monitoring
          </span>
          Thống kê cá nhân
        </h3>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          icon="workspace_premium"
          label="Điểm trung bình"
          value={formatScore(learningStats?.averageScore)}
        />
        <MetricCard
          icon="local_fire_department"
          label="Streak học tập"
          value={`${learningStats?.streak || 0} ngày`}
        />
        <MetricCard
          icon="assignment_turned_in"
          label="Bài đã nộp"
          value={learningStats?.totalAttempts || 0}
        />
      </div>
    </section>
  );
}
