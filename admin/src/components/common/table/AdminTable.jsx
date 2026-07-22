import React from "react";
import { Table } from "antd";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const normalizePagination = (pagination) => {
  if (pagination === false) return false;

  const pageSize = Number(pagination?.pageSize);
  const pageSizeOptions = [...DEFAULT_PAGE_SIZE_OPTIONS];
  if (pageSize && !pageSizeOptions.includes(pageSize)) {
    pageSizeOptions.unshift(pageSize);
  }

  return {
    position: ["bottomLeft"],
    showSizeChanger: true,
    pageSizeOptions,
    showTotal: (total, range) => `${range[1]} / ${total}`,
    ...pagination,
  };
};

const normalizeScroll = (scroll) => {
  if (!scroll) return { x: "max-content" };
  if (!scroll?.x || typeof scroll.x !== "number") return scroll;
  return {
    ...scroll,
    x: "max-content",
  };
};

const normalizeColumns = (columns) =>
  columns?.map((column) => ({
    ...column,
    align: column.align,
    children: normalizeColumns(column.children),
  }));

const AdminTable = ({
  className,
  columns,
  pagination,
  rowKey = "id",
  scroll,
  tableLayout = "auto",
  size = "middle",
  ...props
}) => (
  <Table
    className={["admin-table", className].filter(Boolean).join(" ")}
    rowKey={rowKey}
    tableLayout={tableLayout}
    size={size}
    columns={normalizeColumns(columns)}
    pagination={normalizePagination(pagination)}
    scroll={normalizeScroll(scroll)}
    {...props}
  />
);

export default AdminTable;
