export default function RoadmapSuggestions({ roadmap = [] }) {
  return (
    <div className="aura-info-note p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
        <span className="material-symbols-outlined text-primary">route</span>
        Gợi ý lộ trình
      </h3>
      <div className="space-y-3">
        {roadmap.map((item, index) => (
          <div
            key={item}
            className="flex gap-3 rounded-lg bg-white p-3 text-sm text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-200"
          >
            <span className="aura-index-badge size-7 rounded-full text-xs">
              {index + 1}
            </span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
