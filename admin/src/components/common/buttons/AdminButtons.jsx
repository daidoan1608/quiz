import React from "react";
import { Button } from "antd";
import {
  CloudUploadOutlined,
  DownloadOutlined,
  FileSearchOutlined,
  ImportOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
} from "@ant-design/icons";

const buttonClassName = (...classNames) =>
  classNames.filter(Boolean).join(" ");

export const AdminToolbarButton = ({
  children,
  className,
  icon,
  variant = "primary",
  ...props
}) => (
  <Button
    className={buttonClassName("toolbar-btn", `admin-btn--${variant}`, className)}
    icon={icon}
    {...props}
  >
    {children}
  </Button>
);

export const AdminReloadButton = ({ children = "Tải lại", ...props }) => (
  <AdminToolbarButton variant="neutral" icon={<ReloadOutlined />} {...props}>
    {children}
  </AdminToolbarButton>
);

export const AdminAddButton = ({ children = "Thêm mới", ...props }) => (
  <AdminToolbarButton variant="primary" icon={<PlusOutlined />} {...props}>
    {children}
  </AdminToolbarButton>
);

export const AdminExportButton = ({ children = "Export CSV", ...props }) => (
  <AdminToolbarButton variant="info" icon={<DownloadOutlined />} {...props}>
    {children}
  </AdminToolbarButton>
);

export const AdminImportButton = ({ children = "Import", ...props }) => (
  <AdminToolbarButton variant="accent" icon={<ImportOutlined />} {...props}>
    {children}
  </AdminToolbarButton>
);

export const AdminUploadButton = ({ children = "Upload", ...props }) => (
  <AdminToolbarButton variant="accent" icon={<CloudUploadOutlined />} {...props}>
    {children}
  </AdminToolbarButton>
);

export const AdminCheckButton = ({ children = "Kiểm tra", ...props }) => (
  <AdminToolbarButton variant="warning" icon={<FileSearchOutlined />} {...props}>
    {children}
  </AdminToolbarButton>
);

export const AdminResetButton = ({ children = "Làm mới", className, ...props }) => (
  <AdminToolbarButton
    variant="warning"
    className={buttonClassName("admin-form-btn", className)}
    icon={<ReloadOutlined />}
    {...props}
  >
    {children}
  </AdminToolbarButton>
);

export const AdminSaveButton = ({
  children = "Lưu",
  icon = <SaveOutlined />,
  className,
  ...props
}) => (
  <Button
    type="primary"
    className={buttonClassName("admin-form-btn", "admin-btn--solid-success", className)}
    icon={icon}
    {...props}
  >
    {children}
  </Button>
);

export const AdminCancelButton = ({ children = "Hủy", className, ...props }) => (
  <Button
    className={buttonClassName("admin-form-btn", "admin-btn--danger", className)}
    {...props}
  >
    {children}
  </Button>
);
