import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  CloseCircleFilled,
  FileTextOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import AdminEmptyState from "../../../components/common/states/AdminEmptyState";
import AdminLoadingState from "../../../components/common/states/AdminLoadingState";
import MarkdownLatex from "../../../components/common/MarkdownLatex";
import { useUserExamDetailPage } from "../hooks/useUserExamDetailPage";

const { Title, Text } = Typography;

export default function UserExamDetailPageView() {
  const { userExamId } = useParams();
  const navigate = useNavigate();
  const {
    examDetail,
    examQuestions,
    userInfo,
    userAnswersByQuestion,
    loading,
  } = useUserExamDetailPage(userExamId);
  const onBack = () => navigate(-1);

  if (loading) {
    return (
      <AdminLoadingState className="detail-page-loading" size="large" text="Đang tải kết quả..." />
    );
  }

  if (!examDetail) {
    return (
      <AdminEmptyState
        actionText="Quay lại"
        card
        className="detail-page-empty"
        description="Không có dữ liệu để hiển thị"
        onAction={onBack}
        title="Không tìm thấy dữ liệu bài thi"
      />
    );
  }

  const { subjectName, title, userExamDto } = examDetail;
  const isPassed = userExamDto.score >= 50;

  const getAnswerState = (isUserAnswer, isCorrect) => {
    if (isUserAnswer && isCorrect) {
      return "correct";
    }
    if (isUserAnswer && !isCorrect) {
      return "wrong";
    }
    if (!isUserAnswer && isCorrect) {
      return "missed-correct";
    }
    return "neutral";
  };

  return (
    <div className="detail-page">
      <div className="detail-page-back">
        <Button
          className="detail-page-back-button"
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
        >
          Quay lại danh sách
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card
            variant="borderless"
            className="c-shadow detail-page-score-card"
          >
            <Statistic
              className={`detail-page-score ${isPassed ? "detail-score-value--passed" : "detail-score-value--failed"}`}
              title="Điểm số đạt được"
              value={userExamDto.score}
              prefix={<TrophyOutlined />}
              suffix="/ 100"
            />
            <Tag
              className="detail-page-score-tag"
              color={isPassed ? "success" : "error"}
            >
              {isPassed ? "ĐẠT (PASSED)" : "CHƯA ĐẠT (FAILED)"}
            </Tag>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            title={
              <>
                <FileTextOutlined /> Thông tin bài thi
              </>
            }
            variant="borderless"
            className="c-shadow detail-summary-card"
          >
            <div className="detail-page-info-list">
              <div>
                <Text type="secondary">Môn học:</Text>{" "}
                <div>
                  <Text strong>{subjectName}</Text>
                </div>
              </div>
              <div>
                <Text type="secondary">Đề thi:</Text>{" "}
                <div>
                  <Text strong>{title}</Text>
                </div>
              </div>
              <div>
                <Text type="secondary">
                  <ClockCircleOutlined /> Thời gian làm bài:
                </Text>
                <div>
                  {(
                    (new Date(userExamDto.endTime) -
                      new Date(userExamDto.startTime)) /
                    60000
                  ).toFixed(1)}{" "}
                  phút
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            title={
              <>
                <UserOutlined /> Thông tin thí sinh
              </>
            }
            variant="borderless"
            className="c-shadow detail-summary-card"
          >
            <div className="detail-page-avatar-wrap">
              <Avatar
                size={64}
                icon={<UserOutlined />}
                className="detail-user-avatar"
              />
            </div>
            <div className="detail-page-user-info">
              <Title className="detail-section-title" level={5}>
                {userInfo?.fullName || "Unknown"}
              </Title>
              <Text type="secondary">@{userInfo?.username}</Text>
              <div className="detail-page-submit-time">
                <Tag icon={<CalendarOutlined />}>
                  Nộp bài: {new Date(userExamDto.endTime).toLocaleString()}
                </Tag>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Divider orientation="left">
        <Title className="detail-section-title" level={4}>
          Chi tiết bài làm
        </Title>
      </Divider>

      <Space className="detail-question-stack" direction="vertical" size="large">
        {examQuestions.length === 0 && (
          <Card variant="borderless" className="c-shadow">
            <Text type="secondary">Chưa có dữ liệu câu hỏi cho bài làm này.</Text>
          </Card>
        )}
        {examQuestions.map((question, index) => {
          const userAnswerIds =
            userAnswersByQuestion.get(question.questionId) || new Set();

          return (
            <Card
              key={question.questionId}
              title={<Text strong>Câu {index + 1}</Text>}
              variant="borderless"
              className="c-shadow detail-question-card"
            >
              <MarkdownLatex
                className="detail-question-content detail-page-question-content"
                content={question.content}
              />

              <div className="detail-answer-stack detail-page-answer-stack">
                {(question.answers || []).map((answer) => {
                  const isUserAnswer = userAnswerIds.has(answer.optionId);
                  const isCorrect = answer.isCorrect;

                  return (
                    <div
                      key={answer.optionId}
                      className={`detail-answer-row detail-answer-row--${getAnswerState(isUserAnswer, isCorrect)}`}
                    >
                      <span className="detail-answer-content">
                        <strong>
                          {String.fromCharCode(
                            65 + question.answers.indexOf(answer)
                          )}
                          .
                        </strong>
                        <MarkdownLatex content={answer.content} as="span" />
                      </span>

                      <span>
                        {isUserAnswer && isCorrect && (
                          <CheckCircleFilled className="detail-answer-icon--success detail-page-answer-icon" />
                        )}
                        {isUserAnswer && !isCorrect && (
                          <CloseCircleFilled className="detail-answer-icon--error detail-page-answer-icon" />
                        )}
                        {!isUserAnswer && isCorrect && (
                          <Text className="detail-answer-note" type="success">
                            (Đáp án đúng)
                          </Text>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </Space>
    </div>
  );
}
