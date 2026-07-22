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
        className="aura-button aura-button-primary min-h-0 px-4 py-2 text-sm"
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
        className="aura-button aura-button-subtle min-h-0 px-4 py-2 text-sm"
      >
        {texts.cancel || 'Hủy'}
      </button>
      <button
        type="submit"
        disabled={saving}
        className="aura-button aura-button-primary min-h-0 px-4 py-2 text-sm"
      >
        {saving ? texts.saving || 'Đang lưu...' : texts.save || 'Lưu'}
      </button>
    </div>
  );
};

export default PersonalInfoActions;
