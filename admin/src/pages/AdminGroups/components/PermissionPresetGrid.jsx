import React from "react";
import { Card, Checkbox, Typography } from "antd";

const { Text } = Typography;

export function PermissionPresetGrid({ presets }) {
  return (
    <div className="permission-preset-grid">
      {presets.map((preset) => (
        <Card key={preset.key} size="small">
          <Checkbox value={preset.key}>
            <Text strong>{preset.label}</Text>
          </Checkbox>
        </Card>
      ))}
    </div>
  );
}
