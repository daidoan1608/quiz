export default function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <p className="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black text-gray-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}
