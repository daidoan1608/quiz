import React from "react";
import { Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";

export const ADMIN_FILTER_WIDTH = 220;
export const ADMIN_FILTER_HEIGHT = 40;

const getControlSize = (width, fullWidth) => {
  const controlWidth = fullWidth ? "100%" : width;
  const fixedWidth = typeof width === "number" ? `${width}px` : width;

  return {
    width: controlWidth,
    height: ADMIN_FILTER_HEIGHT,
    minHeight: ADMIN_FILTER_HEIGHT,
    minWidth: fullWidth ? 0 : controlWidth,
    maxWidth: fullWidth ? "100%" : controlWidth,
    flex: fullWidth ? "1 1 100%" : `0 0 ${fixedWidth}`,
  };
};

export const AdminSearchInput = ({
  width = ADMIN_FILTER_WIDTH,
  fullWidth = false,
  style,
  className,
  ...props
}) => (
  <Input
    allowClear
    prefix={<SearchOutlined />}
    className={["management-filter-control", className].filter(Boolean).join(" ")}
    style={{ ...getControlSize(width, fullWidth), ...style }}
    {...props}
  />
);

export const AdminFilterSelect = ({
  width = ADMIN_FILTER_WIDTH,
  fullWidth = false,
  style,
  className,
  ...props
}) => (
  <Select
    allowClear
    className={["management-filter-control", className].filter(Boolean).join(" ")}
    style={{ ...getControlSize(width, fullWidth), ...style }}
    {...props}
  />
);

export const AdminFilterBar = ({ filters, statusSwitch }) => (
  <div style={{ width: "100%" }}>
    {filters && (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "flex-start",
          justifyContent: "flex-start",
          width: "100%",
        }}
      >
        {filters}
      </div>
    )}
    {statusSwitch && (
      <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 12 }}>
        {statusSwitch}
      </div>
    )}
  </div>
);
