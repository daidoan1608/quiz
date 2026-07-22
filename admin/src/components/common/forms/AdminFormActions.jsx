import React from "react";
import {
  AdminCancelButton,
  AdminSaveButton,
} from "../buttons/AdminButtons";

export function AdminFormActions({
  cancelText,
  className,
  disabled,
  extra,
  loading,
  onCancel,
  onSubmit,
  saveClassName,
  saveIcon,
  saveText = "Lưu",
  sticky = false,
}) {
  return (
    <div
      className={[
        "admin-form-actions",
        sticky && "admin-form-actions--sticky",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {extra}
      <AdminCancelButton onClick={onCancel}>{cancelText}</AdminCancelButton>
      <AdminSaveButton
        className={saveClassName}
        icon={saveIcon}
        loading={loading}
        disabled={disabled}
        onClick={onSubmit}
      >
        {saveText}
      </AdminSaveButton>
    </div>
  );
}

export function buildAdminModalFooter({
  cancelText,
  disabled,
  extra,
  loading,
  onCancel,
  onSubmit,
  saveClassName,
  saveIcon,
  saveText = "Lưu",
}) {
  return [
    extra,
    <AdminCancelButton key="cancel" onClick={onCancel}>
      {cancelText}
    </AdminCancelButton>,
    <AdminSaveButton
      key="submit"
      className={saveClassName}
      icon={saveIcon}
      loading={loading}
      disabled={disabled}
      onClick={onSubmit}
    >
      {saveText}
    </AdminSaveButton>,
  ].filter(Boolean);
}
