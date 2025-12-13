import React from 'react';
import { Card, Space, Button } from 'antd';
import { ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import styles from './ManagementPageLayout.module.css';

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
          <Button icon={<ReloadOutlined />} onClick={onReload}>
            Tải lại
          </Button>
        )}

        {typeof onAdd === 'function' && (
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            Thêm mới
          </Button>
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
          <Card className={styles.managementFilters} bordered={false}>
              {filters}
          </Card>
      )}

      {/* 3. Phần Bảng Dữ Liệu (Table) */}
      <Card className={styles.managementContent} bordered={false}>
        {table}
      </Card>

    </div>
  );
};

export default ManagementPageLayout;