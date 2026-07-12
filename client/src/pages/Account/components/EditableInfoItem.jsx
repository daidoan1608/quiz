const EditableInfoItem = ({ label, value, onChange, type = "text", placeholder, required = false }) => (
  <label className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {label}
    </span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
    />
  </label>
);

export default EditableInfoItem;
