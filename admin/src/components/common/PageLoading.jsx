import React from "react";
import { Spin } from "antd";

export default function PageLoading() {
  return (
    <div style={{ minHeight: 320, display: "grid", placeItems: "center" }}>
      <Spin>
        <span>Đang tải...</span>
      </Spin>
    </div>
  );
}
