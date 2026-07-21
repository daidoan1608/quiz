import React, { useMemo } from 'react';
import {
  Avatar,
  Card,
  Col,
  Empty,
  Modal,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
  theme,
} from 'antd';
import {
  CalendarOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  CloseCircleFilled,
  FileTextOutlined,
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import MarkdownLatex from '../../../components/common/MarkdownLatex';
import { useUserExamDetailModal } from '../hooks/useUserExamDetailModal';

const { Text, Title } = Typography;

export default function UserExamDetailModal({ isModalOpen, onCancel, userExamId }) {
  const { token } = theme.useToken();
  const { examDetail, examQuestions, loading, userInfo } = useUserExamDetailModal({
    isModalOpen,
    userExamId,
  });

  const userExamDto = examDetail?.userExamDto || {};
  const isPassed = (userExamDto.score || 0) >= 50;

  const userAnswersByQuestion = useMemo(() => {
    const userAnswerDtos = examDetail?.userAnswerDtos || [];
    return userAnswerDtos.reduce((map, answer) => {
      if (!map.has(answer.questionId)) {
        map.set(answer.questionId, new Set());
      }
      map.get(answer.questionId).add(answer.answerId);
      return map;
    }, new Map());
  }, [examDetail]);

  const getAnswerStyle = (isUserAnswer, isCorrect) => {
    if (isUserAnswer && isCorrect) {
      return {
        background: token.colorSuccessBg,
        border: `1px solid ${token.colorSuccess}`,
        color: token.colorSuccessText,
      };
    }
    if (isUserAnswer && !isCorrect) {
      return {
        background: token.colorErrorBg,
        border: `1px solid ${token.colorError}`,
        color: token.colorErrorText,
      };
    }
    if (!isUserAnswer && isCorrect) {
      return {
        background: token.colorFillTertiary,
        border: `1px dashed ${token.colorSuccess}`,
        color: token.colorSuccess,
      };
    }
    return {
      background: token.colorBgContainer,
      border: `1px solid ${token.colorBorderSecondary}`,
      color: token.colorText,
    };
  };

  const durationMinutes = userExamDto.startTime && userExamDto.endTime
    ? ((new Date(userExamDto.endTime) - new Date(userExamDto.startTime)) / 60000).toFixed(1)
    : '-';

  return (
    <Modal
      title={null}
      open={isModalOpen}
      onCancel={onCancel}
      footer={null}
      width={1080}
      centered
      destroyOnHidden
      className="detail-modal"
    >
      <Spin spinning={loading}>
        {!examDetail ? (
          <div className="detail-modal-scroll">
            <Empty description="Không có dữ liệu bài làm" />
          </div>
        ) : (
          <div className="detail-modal-scroll">
            <div className="detail-modal-hero">
              <Space direction="vertical" size={4}>
                <Text className="detail-modal-kicker">Chi tiết bài làm</Text>
                <Title level={3} style={{ margin: 0 }}>
                  {examDetail.title}
                </Title>
                <Text type="secondary">{examDetail.subjectName}</Text>
              </Space>
            </div>

            <Row gutter={[14, 14]} style={{ marginBottom: 18 }}>
              <Col xs={24} md={8}>
                <Card variant="borderless" className="modern-card detail-summary-card">
                  <Statistic
                    title="Điểm số"
                    value={userExamDto.score}
                    suffix="/ 100"
                    prefix={<TrophyOutlined />}
                    valueStyle={{ color: isPassed ? token.colorSuccess : token.colorError }}
                  />
                  <Tag color={isPassed ? 'success' : 'error'}>
                    {isPassed ? 'Đạt' : 'Chưa đạt'}
                  </Tag>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card variant="borderless" className="modern-card detail-summary-card">
                  <Text type="secondary">
                    <ClockCircleOutlined /> Thời gian làm bài
                  </Text>
                  <Title level={4} style={{ margin: '8px 0 0' }}>
                    {durationMinutes} phút
                  </Title>
                  <Tag icon={<CalendarOutlined />}>
                    {userExamDto.endTime ? new Date(userExamDto.endTime).toLocaleString() : '-'}
                  </Tag>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card variant="borderless" className="modern-card detail-summary-card">
                  <Space>
                    <Avatar icon={<UserOutlined />} style={{ background: token.colorPrimary }} />
                    <div>
                      <Text strong>{userInfo?.fullName || 'Unknown'}</Text>
                      <br />
                      <Text type="secondary">@{userInfo?.username || 'unknown'}</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>

            <Space direction="vertical" size={14} style={{ width: '100%' }}>
              {examQuestions.map((question, index) => {
                const userAnswerIds = userAnswersByQuestion.get(question.questionId) || new Set();

                return (
                  <Card
                    key={question.questionId}
                    variant="borderless"
                    className="modern-card detail-question-card"
                    title={
                      <Space>
                        <FileTextOutlined />
                        <Text strong>Câu {index + 1}</Text>
                      </Space>
                    }
                  >
                    <MarkdownLatex content={question.content} style={{ marginBottom: 14 }} />
                    <Space direction="vertical" size={10} style={{ width: '100%' }}>
                      {(question.answers || []).map((answer, answerIndex) => {
                        const isUserAnswer = userAnswerIds.has(answer.optionId);
                        const isCorrect = Boolean(answer.isCorrect);

                        return (
                          <div
                            key={answer.optionId}
                            className="detail-answer-row"
                            style={getAnswerStyle(isUserAnswer, isCorrect)}
                          >
                            <span className="detail-answer-content">
                              <strong>{String.fromCharCode(65 + answerIndex)}.</strong>
                              <MarkdownLatex content={answer.content} as="span" />
                            </span>
                            {isUserAnswer && isCorrect ? (
                              <CheckCircleFilled style={{ color: token.colorSuccess }} />
                            ) : null}
                            {isUserAnswer && !isCorrect ? (
                              <CloseCircleFilled style={{ color: token.colorError }} />
                            ) : null}
                            {!isUserAnswer && isCorrect ? (
                              <Text type="success">Đáp án đúng</Text>
                            ) : null}
                          </div>
                        );
                      })}
                    </Space>
                  </Card>
                );
              })}
            </Space>
          </div>
        )}
      </Spin>
    </Modal>
  );
}
