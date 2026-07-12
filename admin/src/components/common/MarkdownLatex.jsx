import React, { useEffect, useRef } from "react";
import { parseMarkdown } from "../../utils/parseMarkdown";
import { typesetMath } from "../../utils/typesetMath";

/**
 * Render nội dung câu hỏi/đáp án có Markdown + LaTeX.
 * - parseMarkdown xử lý Markdown cơ bản và giữ nguyên công thức $...$/$$...$$.
 * - MathJax typeset lại ngay trong container này, kể cả nội dung nằm trong Tooltip/Modal.
 */
const MarkdownLatex = ({ content, as: Component = "div", style, className }) => {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!rootRef.current) return;
    typesetMath(rootRef.current);
  }, [content]);

  return (
    <Component
      ref={rootRef}
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content || "") }}
    />
  );
};

export default MarkdownLatex;
