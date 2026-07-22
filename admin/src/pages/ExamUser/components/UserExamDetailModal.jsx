import React, { useMemo } from 'react';
import {
  Avatar,
  Card,
  Col,
  Modal,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
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
import AdminEmptyState from '../../../components/common/states/AdminEmptyState';
import AdminLoadingState from '../../../components/common/states/AdminLoadingState';
import { useUserExamDetailModal } from '../hooks/useUserExamDetailModal';

const { Text, Title } = Typography;

export default function UserExamDetailModal({ isModalOpen, onCancel, userExamId }) {
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

  const getAnswerState = (isUserAnswer, isCorrect) => {
    if (isUserAnswer && isCorrect) {
      return 'correct';
    }
    if (isUserAnswer && !isCorrect) {
      return 'wrong';
    }
    if (!isUserAnswer && isCorrect) {
      return 'missed-correct';
    }
    return 'neutral';
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
      {loading ? (
        <AdminLoadingState text="Đang tải chi tiết bài làm..." />
      ) : !examDetail ? (
          <div className="detail-modal-scroll">
            <AdminEmptyState description="Không có dữ liệu bài làm" />
          </div>
      ) : (
          <div className="detail-modal-scroll">
            <div className="detail-modal-hero">
              <Space direction="vertical" size={4}>
                <Text className="detail-modal-kicker">Chi tiết bài làm</Text>
                <Title className="detail-modal-title" level={3}>
                  {examDetail.title}
                </Title>
                <Text type="secondary">{examDetail.subjectName}</Text>
              </Space>
            </div>

            <Row className="detail-summary-row" gutter={[14, 14]}>
              <Col xs={24} md={8}>
                <Card variant="borderless" className="modern-card detail-summary-card">
                  <Statistic
                    title="Điểm số"
                    value={userExamDto.score}
                    suffix="/ 100"
                    prefix={<TrophyOutlined />}
                    className={`detail-score-value ${isPassed ? 'detail-score-value--passed' : 'detail-score-value--failed'}`}
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
                  <Title className="detail-summary-value" level={4}>
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
                    <Avatar className="detail-user-avatar" icon={<UserOutlined />} />
                    <div>
                      <Text strong>{userInfo?.fullName || 'Unknown'}</Text>
                      <br />
                      <Text type="secondary">@{userInfo?.username || 'unknown'}</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>

            <Space className="detail-question-stack" direction="vertical" size={14}>
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
                    <MarkdownLatex className="detail-question-content" content={question.content} />
                    <Space className="detail-answer-stack" direction="vertical" size={10}>
                      {(question.answers || []).map((answer, answerIndex) => {
                        const isUserAnswer = userAnswerIds.has(answer.optionId);
                        const isCorrect = Boolean(answer.isCorrect);

                        return (
                          <div
                            key={answer.optionId}
                            className={`detail-answer-row detail-answer-row--${getAnswerState(isUserAnswer, isCorrect)}`}
                          >
                            <span className="detail-answer-content">
                              <strong>{String.fromCharCode(65 + answerIndex)}.</strong>
                              <MarkdownLatex content={answer.content} as="span" />
                            </span>
                            {isUserAnswer && isCorrect ? (
                              <CheckCircleFilled className="detail-answer-icon--success" />
                            ) : null}
                            {isUserAnswer && !isCorrect ? (
                              <CloseCircleFilled className="detail-answer-icon--error" />
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
    </Modal>
  );
}
