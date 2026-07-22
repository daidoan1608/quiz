import React from "react";
import { Divider, Modal } from "antd";
import AdminLoadingState from "../states/AdminLoadingState";
import AdminModalTitle from "./AdminModalTitle";

export default function AdminModalFormShell({
  children,
  icon,
  loading = false,
  loadingRows = 4,
  title,
  ...modalProps
}) {
  return (
    <Modal
      title={<AdminModalTitle icon={icon}>{title}</AdminModalTitle>}
      {...modalProps}
    >
      <Divider className="admin-modal-divider" />
      {loading ? (
        <AdminLoadingState skeleton rows={loadingRows} />
      ) : (
        children
      )}
    </Modal>
  );
}
