import React from "react";
import { Form, Input } from "antd";

export default function AdminReadonlyField({
  label = "ID",
  name,
  placeholder,
}) {
  return (
    <Form.Item label={label} name={name}>
      <Input disabled placeholder={placeholder} />
    </Form.Item>
  );
}
