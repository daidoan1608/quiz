import React from "react";
import { DatePicker, Form, Input, Select } from "antd";
import {
  AdminFilterBar,
  AdminFilterSelect,
  AdminSearchInput,
} from "../../../components/common/filters/AdminFilterControls";

const { RangePicker } = DatePicker;

export const NotificationFilters = ({
  filterForm,
  isMod,
  canSendGlobal,
  canSendSubject,
  canSendPersonal,
  handleFilter,
}) => (
  <Form
    form={filterForm}
    onValuesChange={() => handleFilter(filterForm.getFieldsValue())}
  >
    <AdminFilterBar
      filters={
        <>
          <Form.Item className="admin-filter-form-item" name="keyword">
            <AdminSearchInput placeholder="Tìm tiêu đề/nội dung" />
          </Form.Item>
          <Form.Item className="admin-filter-form-item" name="sendType">
            <AdminFilterSelect placeholder="Loại gửi">
              {canSendGlobal && (
                <Select.Option value="GLOBAL">Toàn hệ thống</Select.Option>
              )}
              {canSendPersonal && (
                <Select.Option value="PERSONAL">Cá nhân</Select.Option>
              )}
              {canSendPersonal && (
                <Select.Option value="BATCH">Danh sách</Select.Option>
              )}
              {canSendSubject && (
                <Select.Option value="SUBJECT_ID">Theo môn học</Select.Option>
              )}
            </AdminFilterSelect>
          </Form.Item>
          {!isMod && (
            <Form.Item className="admin-filter-form-item" name="createdBy">
              <Input className="management-filter-control" allowClear placeholder="User ID người tạo" />
            </Form.Item>
          )}
          <Form.Item className="admin-filter-form-item" name="dateRange">
            <RangePicker
              className="management-filter-control"
              format="DD/MM/YYYY"
              allowClear
              placeholder={["Từ ngày", "Đến ngày"]}
            />
          </Form.Item>
        </>
      }
    />
  </Form>
);
