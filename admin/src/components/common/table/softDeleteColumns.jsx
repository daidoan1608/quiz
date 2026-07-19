import React from "react";
import AdminTableText from "./AdminTableText";

export const buildSoftDeleteColumns = (getSortOrder) => [
  {
    title: "Xóa lúc",
    dataIndex: "deletedAt",
    key: "deletedAt",
    width: 180,
    sorter: true,
    sortOrder: getSortOrder("deletedAt"),
    render: (value) => value || "-",
  },
  {
    title: "Nguồn xóa",
    dataIndex: "deleteOriginType",
    key: "deleteOriginType",
    width: 120,
    ellipsis: true,
    render: (value) => <AdminTableText>{value}</AdminTableText>,
  },
];
