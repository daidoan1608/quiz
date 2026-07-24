const EditableInfoItem = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
}) => (
  <label className="aura-soft-panel block p-4 shadow-sm">
    <span className="aura-form-label">
      {label}
    </span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="aura-input w-full px-3 py-2 text-sm font-medium"
    />
  </label>
);

export default EditableInfoItem;
