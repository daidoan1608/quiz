import React from "react";
import { Table } from "antd";

export function AdminWidgetTable({ columns, dataSource, rowKey }) {
  return (
    <Table
      className="dashboard-widget-table"
      size="small"
      pagination={false}
      scroll={{ x: true }}
      columns={columns}
      dataSource={dataSource}
      rowKey={rowKey}
    />
  );
}
