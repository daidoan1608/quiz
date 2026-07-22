import React from 'react';
import { Card, Space } from 'antd';
import {
  AdminAddButton,
  AdminReloadButton,
} from '../components/common/buttons/AdminButtons';
import AdminPageHeader from '../components/common/layout/AdminPageHeader';
import styles from '../styles/layouts/ManagementPageLayout.module.css';

const ManagementPageLayout = ({
  title,
  extra,
  filters,
  table,
  onReload,
  onAdd,
  showReloadButton = true,
}) => {
  // --- Logic hiển thị nút bấm ---
  const renderActionButtons = () => {
    return (
      <Space>
        {/* Extra buttons/actions */}
        {extra}

        {showReloadButton && typeof onReload === 'function' && (
          <AdminReloadButton onClick={onReload} />
        )}

        {typeof onAdd === 'function' && (
          <AdminAddButton onClick={onAdd} />
        )}
      </Space>
    );
  };

  return (
    <div className={styles.managementPageContainer}>
      <AdminPageHeader title={title} actions={renderActionButtons()} />
      {filters && (
        <Card className={styles.managementFilters} variant="borderless">
          {filters}
        </Card>
      )}

      {/* 3. Phần Bảng Dữ Liệu (Table) */}
      <Card className={styles.managementContent} variant="borderless">
        {table}
      </Card>
    </div>
  );
};

export default ManagementPageLayout;
