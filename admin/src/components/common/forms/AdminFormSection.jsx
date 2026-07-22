import React from "react";
import { Card } from "antd";

export default function AdminFormSection({
  children,
  className,
  size = "small",
  title,
  ...props
}) {
  return (
    <Card
      className={["admin-form-section", className].filter(Boolean).join(" ")}
      size={size}
      title={title}
      variant="borderless"
      {...props}
    >
      {children}
    </Card>
  );
}
