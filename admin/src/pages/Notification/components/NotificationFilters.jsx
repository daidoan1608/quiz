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
          <Form.Item name="keyword" style={{ marginBottom: 0 }}>
            <AdminSearchInput placeholder="Tìm tiêu đề/nội dung" />
          </Form.Item>
          <Form.Item name="sendType" style={{ marginBottom: 0 }}>
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
            <Form.Item name="createdBy" style={{ marginBottom: 0 }}>
              <Input allowClear placeholder="User ID người tạo" style={{ width: 220 }} />
            </Form.Item>
          )}
          <Form.Item name="dateRange" style={{ marginBottom: 0 }}>
            <RangePicker
              format="DD/MM/YYYY"
              allowClear
              style={{ width: 220 }}
              placeholder={["Từ ngày", "Đến ngày"]}
            />
          </Form.Item>
        </>
      }
    />
  </Form>
);
