import React from 'react';
import { Card, Space } from 'antd';
import {
  AdminAddButton,
  AdminReloadButton,
} from '../components/common/buttons/AdminButtons';
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
      <div className={styles.managementHeader}>
        <h2 className={styles.pageTitle}>{title}</h2>
        {renderActionButtons()}
      </div>
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
