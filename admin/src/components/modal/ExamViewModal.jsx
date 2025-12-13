import React, { useState, useEffect, useCallback } from 'react';
import {
    Modal, Spin, Card, Typography, Space, Divider, Row, Col, theme, message,Statistic,
} from 'antd';
import {
    FileTextOutlined, ClockCircleOutlined, ControlOutlined,CheckCircleFilled
} from '@ant-design/icons';
import { authAxios } from "../../api/axiosConfig"; // Giả định đường dẫn API đúng

const { Title, Text } = Typography;

/**
 * Modal hiển thị chi tiết đề thi (Exam) và danh sách câu hỏi.
 * Không hiển thị kết quả, đáp án đúng/sai, hay đáp án của người dùng.
 */
const ExamViewModal = ({ isModalOpen, onCancel, examId }) => {
    const { token } = theme.useToken();
    const [examDetail, setExamDetail] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);

    // --- FETCH DATA ---
    const fetchExamData = useCallback(async () => {
        if (!examId) return;

        setLoading(true);
        try {
            // Lấy thông tin đề thi và câu hỏi từ API public
            const response = await authAxios.get(`/public/exams/${examId}`);
            const data = response.data.data;

            setExamDetail(data);
            setQuestions(data.questions || []);

        } catch (error) {
            console.error("Lỗi tải đề thi:", error);
            message.error("Không thể tải chi tiết đề thi.");
        } finally {
            setLoading(false);
        }
    }, [examId]);

    useEffect(() => {
        if (isModalOpen && examId) {
            fetchExamData();
        } else {
            // Reset state khi Modal đóng
            setExamDetail(null);
            setQuestions([]);
        }
    }, [isModalOpen, examId, fetchExamData]);


    // --- RENDER ANSWERS (Chỉ hiển thị nội dung, không có style đúng/sai) ---
const renderAnswerItem = (ans, index, question) => {
    // 1. Lấy trạng thái đúng
    const isCorrect = ans.isCorrect;

    // 2. Thiết lập Style (Base Style)
    let finalStyle = {
        padding: "12px 16px",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        transition: "all 0.3s",
    };

    // 3. Áp dụng style cho Đáp án Đúng
    if (isCorrect) {
        finalStyle = {
            ...finalStyle,
            background: token.colorSuccessBg, // Nền màu xanh nhạt
            border: `1px solid ${token.colorSuccess}`, // Viền màu xanh đậm
            color: token.colorSuccessText, // Chữ màu xanh đậm
        };
    } else {
        // Style cơ bản cho đáp án sai/thường
        finalStyle = {
            ...finalStyle,
            border: `1px solid ${token.colorBorder}`, // Viền xám nhạt
            background: token.colorBgContainer, // Nền trắng
            color: token.colorText,
        };
    }

    return (
        <div
            key={ans.optionId}
            style={finalStyle} // Áp dụng style đã tính toán
        >
            <span style={{ flexGrow: 1 }}>
                <strong style={{ marginRight: 8 }}>
                    {String.fromCharCode(
                        65 + question.answers.indexOf(ans)
                    )}
                    .
                </strong>
                {ans.content}
            </span>

            {/* THÊM ICON HOẶC TEXT CHỈ THỊ ĐÁP ÁN ĐÚNG */}
            {isCorrect && (
                <CheckCircleFilled
                    style={{ fontSize: 18, color: token.colorSuccess }}
                />
            )}
        </div>
    );
};

    // --- MAIN RENDER ---
    return (
        <Modal
            title={
                <Title level={4} style={{ margin: 0 }}>
                    <FileTextOutlined style={{ marginRight: 8 }} /> Xem chi tiết Đề thi
                </Title>
            }
            open={isModalOpen}
            onCancel={onCancel}
            footer={null} // Không cần footer
            width={800}
            centered
        >
            <Spin spinning={loading} tip="Đang tải đề thi...">
                {examDetail ? (
                    <div style={{ padding: '0 0 16px 0' }}>
                        {/* 1. THÔNG TIN CHUNG (HEADER) */}
                        <Card bordered={false} style={{ marginBottom: 16 }}>
                            <Row gutter={16}>
                                <Col span={24}>
                                    <Title level={5} style={{ marginTop: 0 }}>
                                        {examDetail.title}
                                    </Title>
                                    <Text type="secondary">{examDetail.subjectName}</Text>
                                </Col>
                            </Row>
                            <Divider style={{ margin: '12px 0' }} />
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

                        {/* 2. CHI TIẾT CÂU HỎI */}
                        <Divider orientation="left">
                            <Title level={5} style={{ margin: 0 }}>
                                Nội dung các Câu hỏi
                            </Title>
                        </Divider>

                        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                            {questions.map((question, index) => (
                                <Card
                                    key={question.questionId}
                                    title={<Text strong>Câu {index + 1}</Text>}
                                    style={{ border: `1px solid ${token.colorBorderSecondary}` }}
                                >
                                    {/* Nội dung câu hỏi */}
                                    <div style={{ fontSize: 15, marginBottom: 15 }}>
                                        {question.content}
                                    </div>

                                    {/* Danh sách đáp án (CHỈ HIỂN THỊ, KHÔNG CÓ ĐÁP ÁN ĐÚNG/SAI) */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        {question.answers.map((ans) =>
                                            renderAnswerItem(ans, question.answers.indexOf(ans), question)
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </Space>
                    </div>
                ) : (
                    <Text type="secondary">Không có dữ liệu đề thi để hiển thị.</Text>
                )}
            </Spin>
        </Modal>
    );
};

export default ExamViewModal;