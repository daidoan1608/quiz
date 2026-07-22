import React from "react";
import { Col, Row, Statistic, Typography } from "antd";
import { ControlOutlined } from "@ant-design/icons";
import { AdminFormActions } from "../../../components/common/forms/AdminFormActions";

const { Text } = Typography;

export function ExamQuestionConfigHeader({
  loading,
  modeControl,
  onCancel,
  onSubmit,
  saveText = "Lưu",
  total,
}) {
  return (
    <Row
      align="middle"
      className="exam-question-config-header"
      gutter={16}
      justify="space-between"
    >
      <Col className="exam-question-config-header__title-col">
        <Text className="exam-question-config-header__title" strong>
          <ControlOutlined /> Cấu hình câu hỏi
        </Text>
      </Col>
      <Col className="exam-question-config-header__mode" flex="auto">
        {modeControl}
      </Col>
      <Col className="exam-question-config-header__actions">
        <div className="exam-question-config-header__actions-inner">
          <div className="exam-question-config-header__total">
            <Text>Tổng:</Text>
            <Statistic value={total} />
          </div>
          <AdminFormActions
            className="admin-form-actions--inline"
            loading={loading}
            onCancel={onCancel}
            onSubmit={onSubmit}
            saveText={saveText}
          />
        </div>
      </Col>
    </Row>
  );
}
