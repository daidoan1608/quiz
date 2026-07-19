import React from "react";
import { Button, DatePicker, Form, Input, Select, Space } from "antd";
import { ClearOutlined, SearchOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;

export const NotificationFilters = ({
  filterForm,
  isMod,
  canSendGlobal,
  canSendSubject,
  canSendPersonal,
  handleFilter,
  clearFilters,
}) => (
  <Form form={filterForm} layout="inline" onFinish={handleFilter}>
    <Form.Item name="keyword">
      <Input
        allowClear
        placeholder="Tìm tiêu đề/nội dung"
        prefix={<SearchOutlined />}
      />
    </Form.Item>
    <Form.Item name="sendType">
      <Select allowClear placeholder="Loại gửi" style={{ width: 180 }}>
        {canSendGlobal && (
          <Select.Option value="GLOBAL">Toàn hệ thống</Select.Option>
        )}
        {canSendPersonal && <Select.Option value="PERSONAL">Cá nhân</Select.Option>}
        {canSendPersonal && <Select.Option value="BATCH">Danh sách</Select.Option>}
        {canSendSubject && (
          <Select.Option value="SUBJECT_ID">Theo môn học</Select.Option>
        )}
      </Select>
    </Form.Item>
    {!isMod && (
      <Form.Item name="createdBy">
        <Input allowClear placeholder="User ID người tạo" style={{ width: 240 }} />
      </Form.Item>
    )}
    <Form.Item name="dateRange">
      <RangePicker format="DD/MM/YYYY" />
    </Form.Item>
    <Form.Item>
      <Space>
        <Button htmlType="submit" icon={<SearchOutlined />}>
          Lọc
        </Button>
        <Button icon={<ClearOutlined />} onClick={clearFilters}>
          Xóa lọc
        </Button>
      </Space>
    </Form.Item>
  </Form>
);
