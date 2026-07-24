import React from 'react';
import { Form, Input } from 'antd';

const inputComponents = {
  password: Input.Password,
  text: Input,
};

export function AuthFormField({
  className,
  dependencies,
  icon,
  inputClassName = 'rounded-lg py-2.5',
  name,
  placeholder,
  rules,
  type = 'text',
}) {
  const FieldInput = inputComponents[type] || Input;

  return (
    <Form.Item
      className={className}
      dependencies={dependencies}
      name={name}
      rules={rules}
    >
      <FieldInput
        className={inputClassName}
        placeholder={placeholder}
        prefix={icon}
      />
    </Form.Item>
  );
}
