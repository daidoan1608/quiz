import { formatScore } from './roadmapFormatters';
import { ProgressBar } from 'components/common/ProgressBar';

export default function SubjectProgressSection({ subjectProgress = [] }) {
  return (
    <div className="aura-surface-panel p-5">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
        <span className="material-symbols-outlined text-red-500">
          troubleshoot
        </span>
        Môn cần củng cố
      </h3>
      {subjectProgress.length ? (
        <div className="space-y-3">
          {subjectProgress.slice(0, 4).map((subject) => (
            <div key={subject.subjectName}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-bold text-gray-800 dark:text-gray-100">
                  {subject.subjectName}
                </span>
                <span className="text-gray-500">
                  {formatScore(subject.averageScore)}
                </span>
              </div>
              <ProgressBar
                className="h-2"
                tone={subject.averageScore < 70 ? 'danger' : 'success'}
                value={Math.min(100, subject.averageScore)}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Chưa có dữ liệu bài làm để phân tích.
        </p>
      )}
    </div>
  );
}
