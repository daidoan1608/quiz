import React from "react";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

const MainBackButton = ({ children = "Quay lại", onClick, topOffset }) => (
  <div
    className="main-back-button"
    style={topOffset ? { "--main-back-button-top": `${topOffset}px` } : undefined}
  >
    <Button icon={<ArrowLeftOutlined />} onClick={onClick}>
      {children}
    </Button>
  </div>
);

export default MainBackButton;
