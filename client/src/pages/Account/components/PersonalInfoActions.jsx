const PersonalInfoActions = ({
  isEditing,
  onCancel,
  onEdit,
  saving,
  texts,
}) => {
  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={onEdit}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary/90"
      >
        {texts.edit || 'Chỉnh sửa'}
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-100 disabled:opacity-60 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        {texts.cancel || 'Hủy'}
      </button>
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary/90 disabled:opacity-60"
      >
        {saving ? texts.saving || 'Đang lưu...' : texts.save || 'Lưu'}
      </button>
    </div>
  );
};

export default PersonalInfoActions;
