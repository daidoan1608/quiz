const InfoItem = ({ label, value, texts }) => (
  <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {label}
    </p>
    <p className="mt-1 break-words text-sm font-medium text-gray-900 dark:text-white">
      {value || texts?.notUpdated || 'Chưa cập nhật'}
    </p>
  </div>
);

export default InfoItem;
