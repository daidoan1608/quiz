import { useState } from "react";

export const useTableSort = () => {
  const [tableSort, setTableSort] = useState({});

  const handleTableChange = (_, __, sorter) => {
    setTableSort(
      sorter?.order
        ? { sortBy: sorter.columnKey || sorter.field, sortDir: sorter.order }
        : {}
    );
  };

  const getSortOrder = (key) =>
    tableSort.sortBy === key ? tableSort.sortDir : null;

  return { tableSort, handleTableChange, getSortOrder };
};
