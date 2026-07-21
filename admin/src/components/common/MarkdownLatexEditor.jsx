import React, { useRef } from "react";
import { Button, Input, Space, Tooltip, theme } from "antd";
import {
  BoldOutlined,
  CodeOutlined,
  FunctionOutlined,
  ItalicOutlined,
  LinkOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import MarkdownLatex from "./MarkdownLatex";

const { TextArea } = Input;

const EDITOR_ACTIONS = [
  { key: "bold", icon: <BoldOutlined />, title: "Bold", before: "**", after: "**" },
  { key: "italic", icon: <ItalicOutlined />, title: "Italic", before: "*", after: "*" },
  { key: "inlineMath", icon: <FunctionOutlined />, title: "Inline LaTeX", before: "$", after: "$" },
  { key: "blockMath", icon: <FunctionOutlined />, title: "Block LaTeX", before: "$$\n", after: "\n$$" },
  { key: "code", icon: <CodeOutlined />, title: "Code", before: "`", after: "`" },
  { key: "list", icon: <UnorderedListOutlined />, title: "Bullet list", before: "- ", after: "" },
  { key: "orderedList", icon: <OrderedListOutlined />, title: "Numbered list", before: "1. ", after: "" },
  { key: "link", icon: <LinkOutlined />, title: "Link", before: "[", after: "](https://)" },
];

const MarkdownLatexEditor = ({
  value = "",
  onChange,
  placeholder,
  minRows = 4,
  maxRows = 12,
  compact = false,
  className,
  style,
}) => {
  const inputRef = useRef(null);
  const { token } = theme.useToken();

  const updateValue = (nextValue) => {
    onChange?.(nextValue);
  };

  const insertMarkup = ({ before, after }) => {
    const textArea = inputRef.current?.resizableTextArea?.textArea;
    const current = value || "";
    const start = textArea?.selectionStart ?? current.length;
    const end = textArea?.selectionEnd ?? current.length;
    const selected = current.slice(start, end);
    const nextValue = `${current.slice(0, start)}${before}${selected}${after}${current.slice(end)}`;
    updateValue(nextValue);

    window.requestAnimationFrame(() => {
      textArea?.focus();
      const cursor = start + before.length + selected.length;
      textArea?.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className={className} style={style}>
      <Space size={4} wrap style={{ marginBottom: 8 }}>
        {EDITOR_ACTIONS.map((action) => (
          <Tooltip key={action.key} title={action.title}>
            <Button
              type="text"
              size="small"
              icon={action.icon}
              onClick={() => insertMarkup(action)}
            />
          </Tooltip>
        ))}
      </Space>
      <TextArea
        ref={inputRef}
        value={value}
        onChange={(event) => updateValue(event.target.value)}
        placeholder={placeholder}
        autoSize={{ minRows, maxRows }}
      />
      {value ? (
        <div
          style={{
            marginTop: 8,
            padding: compact ? "6px 8px" : "10px 12px",
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: 6,
            background: token.colorFillQuaternary,
            maxHeight: compact ? 120 : 260,
            overflowY: "auto",
          }}
        >
          <MarkdownLatex content={value} />
        </div>
      ) : null}
    </div>
  );
};

export default MarkdownLatexEditor;
