import React from "react";
import { Switch } from "antd";

const AdminTableSwitch = ({ size = "small", ...props }) => (
  <Switch size={size} {...props} />
);

export default AdminTableSwitch;
