export const getNoWrapHeaderColumns = (columns) =>
  columns.map((column) => ({
    ...column,
    onHeaderCell: (headerColumn) => ({
      style: {
        ...headerColumn.style,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    }),
  }));
