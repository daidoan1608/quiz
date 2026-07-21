import React from "react";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

const MainBackButton = ({ children = "Quay lại", onClick, style }) => (
  <div
    style={{
      position: "sticky",
      top: 96,
      zIndex: 9,
      width: "fit-content",
      marginBottom: 16,
      ...style,
    }}
  >
    <Button icon={<ArrowLeftOutlined />} onClick={onClick}>
      {children}
    </Button>
  </div>
);

export default MainBackButton;
