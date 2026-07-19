import React from "react";
import { Col } from "antd";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function SortableWidget({ id, children, colProps }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <Col
      ref={setNodeRef}
      {...colProps}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 2 : undefined,
      }}
    >
      {children({
        dragHandleProps: {
          ...attributes,
          ...listeners,
        },
        isDragging,
      })}
    </Col>
  );
}
