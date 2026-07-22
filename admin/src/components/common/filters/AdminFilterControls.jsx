import React from "react";
import { Input, Segmented, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";

export const ADMIN_FILTER_WIDTH = 220;
export const ADMIN_FILTER_HEIGHT = 40;

const getControlSize = (width, fullWidth) => {
  const controlWidth = fullWidth ? "100%" : width;
  const fixedWidth = typeof width === "number" ? `${width}px` : width;

  return {
    width: controlWidth,
    height: ADMIN_FILTER_HEIGHT,
    minHeight: ADMIN_FILTER_HEIGHT,
    minWidth: fullWidth ? 0 : controlWidth,
    maxWidth: fullWidth ? "100%" : controlWidth,
    flex: fullWidth ? "1 1 100%" : `0 0 ${fixedWidth}`,
  };
};

export const AdminSearchInput = ({
  width = ADMIN_FILTER_WIDTH,
  fullWidth = false,
  style,
  className,
  ...props
}) => (
  <Input
    allowClear
    prefix={<SearchOutlined />}
    className={["management-filter-control", className].filter(Boolean).join(" ")}
    style={{ ...getControlSize(width, fullWidth), ...style }}
    {...props}
  />
);

export const AdminFilterSelect = ({
  width = ADMIN_FILTER_WIDTH,
  fullWidth = false,
  style,
  className,
  ...props
}) => (
  <Select
    allowClear
    className={["management-filter-control", className].filter(Boolean).join(" ")}
    style={{ ...getControlSize(width, fullWidth), ...style }}
    {...props}
  />
);

export const AdminFilterBar = ({ filters, statusSwitch }) => (
  <div className="admin-filter-bar">
    {filters && (
      <div className="admin-filter-bar__controls">
        {filters}
      </div>
    )}
    {statusSwitch && (
      <div className="admin-filter-bar__status">
        {statusSwitch}
      </div>
    )}
  </div>
);

export const AdminStatusSegmented = ({
  activeLabel = "Đang hoạt động",
  deletedLabel = "Thùng rác",
  disabled,
  onChange,
  value,
}) => (
  <Segmented
    value={value}
    onChange={onChange}
    disabled={disabled}
    options={[
      { label: activeLabel, value: "active" },
      { label: deletedLabel, value: "deleted" },
    ]}
  />
);

export const AdminEntityFilterSet = ({
  categories,
  categoryValue,
  chapters,
  chapterValue,
  creators,
  creatorValue,
  hideCategory = false,
  hideChapter = false,
  hideCreator = true,
  hideSubject = false,
  onCategoryChange,
  onChapterChange,
  onCreatorChange,
  onSubjectChange,
  subjects,
  subjectValue,
}) => (
  <>
    {!hideCategory && (
      <AdminFilterSelect
        placeholder="Khoa"
        value={categoryValue}
        onChange={onCategoryChange}
        showSearch
        optionFilterProp="label"
        options={(categories || []).map((category) => ({
          value: category.categoryId,
          label: category.categoryName,
        }))}
      />
    )}
    {!hideSubject && (
      <AdminFilterSelect
        placeholder="Môn học"
        value={subjectValue}
        onChange={onSubjectChange}
        showSearch
        optionFilterProp="label"
        options={(subjects || []).map((subject) => ({
          value: subject.subjectId,
          label: subject.name,
        }))}
      />
    )}
    {!hideChapter && (
      <AdminFilterSelect
        placeholder="Chương"
        value={chapterValue}
        onChange={onChapterChange}
        showSearch
        optionFilterProp="label"
        options={(chapters || []).map((chapter) => ({
          value: chapter.chapterId,
          label: chapter.name,
        }))}
      />
    )}
    {!hideCreator && (
      <AdminFilterSelect
        placeholder="Người tạo"
        value={creatorValue}
        onChange={onCreatorChange}
        showSearch
        optionFilterProp="label"
        options={(creators || []).map((user) => ({
          value: user.userId,
          label: user.username,
        }))}
      />
    )}
  </>
);
