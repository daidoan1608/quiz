import React from "react";
import { Spin } from "antd";

export default function PageLoading() {
  return (
    <div className="admin-page-loading">
      <Spin>
        <span>Đang tải...</span>
      </Spin>
    </div>
  );
}
