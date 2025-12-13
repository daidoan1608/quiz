import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authAxios } from "../../api/axiosConfig";
import {
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Tag,
  Spin,
  Button,
  Divider,
  theme,
  message,
  Space,
  Avatar,
} from "antd";
import {
  ArrowLeftOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  CalendarOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function GetUserExambyId() {
  const { userExamId } = useParams();
  const navigate = useNavigate();
  const { token } = theme.useToken(); // Lấy token màu để style động

  const [examDetail, setExamDetail] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch dữ liệu tối ưu
  const fetchExamDetail = useCallback(async () => {
    try {
      setLoading(true);
      // 1. Lấy chi tiết bài thi UserExam
      const response = await authAxios.get(`/user/userexams/${userExamId}`);
      const detail = response.data.data;
      setExamDetail(detail);

      // 2. Lấy thông tin Đề thi gốc và User song song (Promise.all)
      const examId = detail.userExamDto.examId;
      const userId = detail.userExamDto.userId;

      const [questionRes, userRes] = await Promise.all([
        authAxios.get(`/public/exams/${examId}`),
        authAxios.get(`/user/${userId}`),
      ]);

      setExamQuestions(questionRes.data.data.questions || []);
      setUserInfo(userRes.data.data || {});
    } catch (error) {
      console.error("Lỗi:", error);
      message.error("Không thể tải chi tiết bài thi.");
    } finally {
      setLoading(false);
    }
  }, [userExamId]);

  useEffect(() => {
    fetchExamDetail();
  }, [fetchExamDetail]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <Spin size="large" tip="Đang tải kết quả..." />
      </div>
    );
  }

  if (!examDetail) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: 20 }}>
          <Title level={4}>Không tìm thấy dữ liệu bài thi</Title>
          <Button onClick={() => navigate(-1)}>Quay lại</Button>
        </div>
      </Card>
    );
  }

  const { subjectName, title, userExamDto, userAnswerDtos } = examDetail;
  const isPassed = userExamDto.score >= 50; // Logic đậu/rớt

  // Helper: Tìm đáp án user đã chọn
  const getUserAnswerForQuestion = (questionId) => {
    return userAnswerDtos.find((ans) => ans.questionId === questionId)
      ?.answerId;
  };

  // Helper: Style cho từng đáp án
  const getAnswerStyle = (isUserAnswer, isCorrect) => {
    // 1. User chọn ĐÚNG
    if (isUserAnswer && isCorrect) {
      return {
        background: token.colorSuccessBg,
        border: `1px solid ${token.colorSuccess}`,
        color: token.colorSuccessText,
      };
    }
    // 2. User chọn SAI
    if (isUserAnswer && !isCorrect) {
      return {
        background: token.colorErrorBg,
        border: `1px solid ${token.colorError}`,
        color: token.colorErrorText,
      };
    }
    // 3. Đáp án ĐÚNG (mà user KHÔNG chọn) -> Highlight để user biết
    if (!isUserAnswer && isCorrect) {
      return {
        background: "transparent",
        border: `1px dashed ${token.colorSuccess}`,
        color: token.colorSuccess,
      };
    }
    // 4. Các đáp án thường
    return {
      background: token.colorBgContainer,
      border: `1px solid ${token.colorBorder}`,
      color: token.colorText,
    };
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 40 }}>
      {/* HEADER + BACK BUTTON */}
      <div style={{ marginBottom: 16 }}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ paddingLeft: 0, fontSize: 16 }}
        >
          Quay lại danh sách
        </Button>
      </div>

      {/* KHỐI TỔNG QUAN (SUMMARY) */}
      <Row gutter={[16, 16]}>
        {/* Cột 1: Điểm số */}
        <Col xs={24} md={8}>
          <Card
            bordered={false}
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

        {/* Cột 2: Thông tin đề thi */}
        <Col xs={24} md={8}>
          <Card
            title={
              <>
                <FileTextOutlined /> Thông tin bài thi
              </>
            }
            bordered={false}
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

        {/* Cột 3: Thông tin User */}
        <Col xs={24} md={8}>
          <Card
            title={
              <>
                <UserOutlined /> Thông tin thí sinh
              </>
            }
            bordered={false}
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

      {/* DANH SÁCH CÂU HỎI */}
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {examQuestions.map((question, index) => {
          const userAnswerId = getUserAnswerForQuestion(question.questionId);

          return (
            <Card
              key={question.questionId}
              title={<Text strong>Câu {index + 1}</Text>}
              bordered={false}
              className="c-shadow"
            >
              <div style={{ fontSize: 16, marginBottom: 20 }}>
                {question.content}
              </div>

              {/* Danh sách đáp án */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {question.answers.map((ans) => {
                  const isUserAnswer = ans.optionId === userAnswerId;
                  const isCorrect = ans.isCorrect;
                  const style = getAnswerStyle(isUserAnswer, isCorrect);

                  return (
                    <div
                      key={ans.optionId}
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
                      {/* Nội dung đáp án */}
                      <span>
                        <strong style={{ marginRight: 8 }}>
                          {String.fromCharCode(
                            65 + question.answers.indexOf(ans)
                          )}
                          .
                        </strong>
                        {ans.content}
                      </span>

                      {/* Icon trạng thái */}
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
