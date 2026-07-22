import React from "react";
import { parseMarkdown } from "../../../utils/parseMarkdown";

export const MarkdownPreviewBox = ({
  content,
  label,
  compact = false,
  style,
}) => {
  if (!content) return null;

  return (
    <div
      className={`markdown-preview-box${compact ? " markdown-preview-box--compact" : ""}`}
      style={style}
    >
      <span className="markdown-preview-box__label">
        {label}
      </span>
      <span dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }} />
    </div>
  );
};
