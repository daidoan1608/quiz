import React from "react";
import {
  Card,
  Col,
  Divider,
  Modal,
  Row,
  Space,
  Statistic,
  Typography,
} from "antd";
import {
  CheckCircleFilled,
  ClockCircleOutlined,
  ControlOutlined,
} from "@ant-design/icons";
import MarkdownLatex from "../../../components/common/MarkdownLatex";
import AdminEmptyState from "../../../components/common/states/AdminEmptyState";
import AdminLoadingState from "../../../components/common/states/AdminLoadingState";
import { resolveMediaUrl } from "../../../utils/mediaUrl";
import { useExamDetail } from "../hooks/useExamDetail";

const { Title, Text } = Typography;

export const ExamDetailModal = ({ open, onCancel, examId }) => {
  const { examDetail, questions, loading } = useExamDetail({ examId, open });

  const renderAnswerItem = (answer, question) => {
    const isCorrect = answer.isCorrect;

    return (
      <div
        key={answer.optionId}
        className={`detail-answer-row ${isCorrect ? "detail-answer-row--correct" : "detail-answer-row--neutral"}`}
      >
        <span className="detail-answer-content">
          <strong>
            {String.fromCharCode(65 + question.answers.indexOf(answer))}.
          </strong>
          <MarkdownLatex content={answer.content} as="span" />
        </span>

        {isCorrect && <CheckCircleFilled className="detail-answer-icon--success" />}
      </div>
    );
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={980}
      centered
      destroyOnHidden
      className="detail-modal"
    >
      {loading ? (
        <AdminLoadingState text="Đang tải chi tiết đề thi..." />
      ) : examDetail ? (
          <div className="detail-modal-scroll">
            <div className="detail-modal-hero">
              <Space direction="vertical" size={4}>
                <Title className="detail-modal-title" level={3}>
                  {examDetail.title}
                </Title>
                <Text type="secondary">{examDetail.subjectName}</Text>
                <Text type="secondary">Mã đề: {examDetail.examCode}</Text>
              </Space>
            </div>

            <Card variant="borderless" className="modern-card detail-spaced-card">
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Thời gian làm bài"
                    value={examDetail.duration}
                    suffix="phút"
                    prefix={<ClockCircleOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Tổng số câu hỏi"
                    value={questions.length}
                    prefix={<ControlOutlined />}
                  />
                </Col>
              </Row>
            </Card>

            <Divider orientation="left">
              <Title className="detail-section-title" level={5}>
                Nội dung các Câu hỏi
              </Title>
            </Divider>

            <Space className="detail-question-stack" direction="vertical" size="middle">
              {questions.map((question, index) => (
                <Card
                  key={question.questionId}
                  title={<Text strong>Câu {index + 1}</Text>}
                  variant="borderless"
                  className="modern-card detail-question-card"
                >
                  <MarkdownLatex className="detail-question-content" content={question.content} />
                  {question.imageUrl ? (
                    <img
                      className="detail-question-image"
                      src={resolveMediaUrl(question.imageUrl)}
                      alt={`Câu ${index + 1}`}
                    />
                  ) : null}

                  <div className="detail-answer-stack">
                    {question.answers.map((answer) =>
                      renderAnswerItem(answer, question)
                    )}
                  </div>
                </Card>
              ))}
            </Space>
          </div>
      ) : (
        <AdminEmptyState description="Không có dữ liệu đề thi để hiển thị." />
      )}
    </Modal>
  );
};
