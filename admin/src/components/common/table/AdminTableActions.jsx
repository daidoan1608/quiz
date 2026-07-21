import React, { forwardRef } from "react";
import { Button, Popconfirm, Space, Tooltip } from "antd";

const VARIANT_CLASS = {
  default: "",
  primary: "is-primary",
  danger: "is-danger",
  success: "is-success",
  warning: "is-warning",
  info: "is-info",
  accent: "is-accent",
  neutral: "is-neutral",
};

const getActionButtonClassName = (variant, className) =>
  ["action-btn", VARIANT_CLASS[variant], className].filter(Boolean).join(" ");

export const AdminActionButton = forwardRef(({
  title,
  variant = "default",
  className,
  disabled,
  ...buttonProps
}, ref) => {
  const button = (
    <Button
      ref={ref}
      className={getActionButtonClassName(variant, className)}
      disabled={disabled}
      {...buttonProps}
    />
  );

  if (!title) return button;

  return <Tooltip title={title}>{button}</Tooltip>;
});

AdminActionButton.displayName = "AdminActionButton";

export const AdminConfirmAction = ({
  buttonTitle,
  confirmTitle,
  description,
  okText,
  cancelText = "Hủy",
  danger,
  disabled,
  onConfirm,
  variant = danger ? "danger" : "default",
  className,
  ...buttonProps
}) => (
  <Popconfirm
    title={confirmTitle}
    description={description}
    onConfirm={onConfirm}
    okText={okText}
    cancelText={cancelText}
    okButtonProps={danger ? { danger: true } : undefined}
    disabled={disabled}
  >
    <Button
      aria-label={buttonTitle}
      title={buttonTitle}
      className={getActionButtonClassName(variant, className)}
      disabled={disabled}
      {...buttonProps}
    />
  </Popconfirm>
);

export const AdminTableActions = ({ children }) => <Space>{children}</Space>;
