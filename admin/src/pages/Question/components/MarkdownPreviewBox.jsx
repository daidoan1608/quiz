import React from "react";
import { theme } from "antd";
import { parseMarkdown } from "../../../utils/parseMarkdown";

export const MarkdownPreviewBox = ({
  content,
  label,
  compact = false,
  style,
}) => {
  const { token } = theme.useToken();

  if (!content) return null;

  return (
    <div
      style={{
        marginTop: compact ? 4 : -12,
        marginBottom: compact ? 0 : 16,
        padding: compact ? "4px 8px" : "8px 12px",
        border: `1px dashed ${token.colorBorder}`,
        borderRadius: compact ? 4 : 6,
        background: token.colorFillQuaternary,
        color: token.colorText,
        fontSize: compact ? 13 : undefined,
        maxHeight: compact ? undefined : 120,
        overflowY: compact ? undefined : "auto",
        ...style,
      }}
    >
      <span
        style={{
          color: token.colorTextSecondary,
          fontSize: compact ? undefined : 11,
          marginRight: compact ? 8 : undefined,
          marginBottom: compact ? undefined : 4,
          display: compact ? undefined : "block",
        }}
      >
        {label}
      </span>
      <span dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }} />
    </div>
  );
};
