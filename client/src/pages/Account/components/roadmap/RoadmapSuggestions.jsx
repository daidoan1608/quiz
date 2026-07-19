export default function RoadmapSuggestions({ roadmap = [] }) {
  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-5 shadow-sm dark:border-blue-900/40 dark:bg-blue-900/10">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
        <span className="material-symbols-outlined text-blue-500">route</span>
        Gợi ý lộ trình
      </h3>
      <div className="space-y-3">
        {roadmap.map((item, index) => (
          <div
            key={item}
            className="flex gap-3 rounded-lg bg-white p-3 text-sm text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-200"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
              {index + 1}
            </span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
