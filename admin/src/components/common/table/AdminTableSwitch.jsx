import React from "react";
import { Switch } from "antd";

const AdminTableSwitch = ({
  "aria-label": ariaLabel = "Bật/tắt trạng thái",
  size = "small",
  title,
  ...props
}) => (
  <Switch
    aria-label={ariaLabel}
    size={size}
    title={title || ariaLabel}
    {...props}
  />
);

export default AdminTableSwitch;
