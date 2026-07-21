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
  Spin,
  Statistic,
  Tag,
  Typography,
  theme,
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
import MarkdownLatex from "../../../components/common/MarkdownLatex";
import { useUserExamDetailPage } from "../hooks/useUserExamDetailPage";

const { Title, Text } = Typography;

export default function UserExamDetailPageView() {
  const { token } = theme.useToken();
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
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <Spin size="large">
          <span>Đang tải kết quả...</span>
        </Spin>
      </div>
    );
  }

  if (!examDetail) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: 20 }}>
          <Title level={4}>Không tìm thấy dữ liệu bài thi</Title>
          <Button onClick={onBack}>Quay lại</Button>
        </div>
      </Card>
    );
  }

  const { subjectName, title, userExamDto } = examDetail;
  const isPassed = userExamDto.score >= 50;

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
        background: "transparent",
        border: `1px dashed ${token.colorSuccess}`,
        color: token.colorSuccess,
      };
    }
    return {
      background: token.colorBgContainer,
      border: `1px solid ${token.colorBorder}`,
      color: token.colorText,
    };
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 40 }}>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          style={{ paddingLeft: 0, fontSize: 16 }}
        >
          Quay lại danh sách
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card
            variant="borderless"
            className="c-shadow"
            style={{ height: "100%", textAlign: "center" }}
          >
            <Statistic
              title="Điểm số đạt được"
              value={userExamDto.score}
              valueStyle={{
                color: isPassed ? token.colorSuccess : token.colorError,
                fontSize: 40,
              }}
              prefix={<TrophyOutlined />}
              suffix="/ 100"
            />
            <Tag
              color={isPassed ? "success" : "error"}
              style={{ marginTop: 10, fontSize: 16, padding: "5px 20px" }}
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
            className="c-shadow"
            style={{ height: "100%" }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
            className="c-shadow"
            style={{ height: "100%" }}
          >
            <div style={{ textAlign: "center", marginBottom: 10 }}>
              <Avatar
                size={64}
                icon={<UserOutlined />}
                style={{ backgroundColor: token.colorPrimary }}
              />
            </div>
            <div style={{ textAlign: "center" }}>
              <Title level={5} style={{ margin: 0 }}>
                {userInfo?.fullName || "Unknown"}
              </Title>
              <Text type="secondary">@{userInfo?.username}</Text>
              <div style={{ marginTop: 10 }}>
                <Tag icon={<CalendarOutlined />}>
                  Nộp bài: {new Date(userExamDto.endTime).toLocaleString()}
                </Tag>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Divider orientation="left">
        <Title level={4} style={{ margin: 0 }}>
          Chi tiết bài làm
        </Title>
      </Divider>

      <Space direction="vertical" size="large" style={{ width: "100%" }}>
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
              className="c-shadow"
            >
              <MarkdownLatex
                content={question.content}
                style={{ fontSize: 16, marginBottom: 20 }}
              />

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {(question.answers || []).map((answer) => {
                  const isUserAnswer = userAnswerIds.has(answer.optionId);
                  const isCorrect = answer.isCorrect;
                  const style = getAnswerStyle(isUserAnswer, isCorrect);

                  return (
                    <div
                      key={answer.optionId}
                      style={{
                        padding: "12px 16px",
                        borderRadius: 8,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "all 0.3s",
                        ...style,
                      }}
                    >
                      <span>
                        <strong style={{ marginRight: 8 }}>
                          {String.fromCharCode(
                            65 + question.answers.indexOf(answer)
                          )}
                          .
                        </strong>
                        <MarkdownLatex content={answer.content} as="span" />
                      </span>

                      <span>
                        {isUserAnswer && isCorrect && (
                          <CheckCircleFilled
                            style={{ fontSize: 20, color: token.colorSuccess }}
                          />
                        )}
                        {isUserAnswer && !isCorrect && (
                          <CloseCircleFilled
                            style={{ fontSize: 20, color: token.colorError }}
                          />
                        )}
                        {!isUserAnswer && isCorrect && (
                          <Text type="success" style={{ fontSize: 12 }}>
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
