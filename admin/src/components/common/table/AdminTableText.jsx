import React from 'react';
import { Tooltip, Typography } from 'antd';

const { Text } = Typography;

export default function AdminTableText({
  children,
  strong = false,
  type,
  code = false,
  copyable = false,
  empty = '-',
}) {
  const value = children ?? '';
  const displayValue = value === '' ? empty : value;
  const isEmpty = value === '';

  return (
    <Tooltip title={isEmpty ? '' : String(value)}>
      <Text
        className="admin-table-text"
        strong={strong}
        type={isEmpty ? 'secondary' : type}
        code={code}
        copyable={copyable}
        ellipsis
      >
        {displayValue}
      </Text>
    </Tooltip>
  );
}
