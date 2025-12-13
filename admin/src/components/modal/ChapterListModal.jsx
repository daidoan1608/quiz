import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authAxios } from "../../api/axiosConfig";
import {
    Table,
    Button,
    Typography,
    Space,
    Tooltip,
    message,
    Modal,
    Spin,
    Card, // Thêm Card để bao bọc nội dung
    Input, // Thêm Input cho Tìm kiếm
    Row, Col, // Thêm Row/Col cho Header/Search
} from "antd";
import {
    UnorderedListOutlined,
    BookOutlined,
    ReloadOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import ChapterQuestionModal from '../../components/modal/ChapterQuestionModal'; // Điều chỉnh đường dẫn thực tế

const { Title, Text } = Typography;

const ChapterListModal = ({ isModalOpen, onCancel, subjectId, subjectName }) => {
    const navigate = useNavigate();

    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState(""); // Thêm state tìm kiếm

    // --- STATES MODAL CON ---
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    const [chapterIdForQuestions, setChapterIdForQuestions] = useState(null);


    const fetchChapters = useCallback(async (id) => {
        if (!id || !isModalOpen) return;

        setLoading(true);
        try {
            const response = await authAxios.get(`/public/subjects/${id}`);
            if (response.data.status === "success") {
                const data = response.data.data;
                setChapters(data.chapters || []);
            } else {
                setChapters([]);
                message.warning("Không tìm thấy dữ liệu chương!");
            }
        } catch (error) {
            console.error("Lỗi:", error);
            message.error("Không thể lấy danh sách chương!");
        } finally {
            setLoading(false);
        }
    }, [isModalOpen]);

    useEffect(() => {
        if (subjectId && isModalOpen) {
            fetchChapters(subjectId);
        }
        // Reset tìm kiếm khi modal mở/đóng
        if (!isModalOpen) {
            setSearchText("");
        }
    }, [subjectId, isModalOpen, fetchChapters]);

    // --- HÀNH ĐỘNG MỚI: MỞ MODAL CON ---
    const handleViewQuestions = (chapterId) => {
        setChapterIdForQuestions(chapterId);
        setIsQuestionModalOpen(true);
    };

    // Hàm đóng Modal con
    const handleCloseQuestionModal = () => {
        setIsQuestionModalOpen(false);
        setChapterIdForQuestions(null);
    };

    // Hàm lọc dữ liệu (Mới)
    const getFilteredData = () => {
        if (!searchText) return chapters;
        const lowerSearch = searchText.toLowerCase();
        return chapters.filter(
            (item) =>
                item.name?.toLowerCase().includes(lowerSearch) ||
                item.chapterId?.toString().includes(lowerSearch) ||
                item.chapterNumber?.toString().includes(lowerSearch)
        );
    };

    // Cấu hình cột
    const columns = [
        {
            title: "Id", dataIndex: "chapterId", key: "chapterId", width: 100,
        },
        {
            title: "Chương", dataIndex: "chapterNumber", key: "chapterNumber", width: 100,
            sorter: (a, b) => a.chapterNumber - b.chapterNumber, render: (num) => <Text strong> {num}</Text>,
        },
        {
            title: "Tên chương", dataIndex: "name", key: "name",
            render: (text) => <Text style={{ fontSize: 15 }}>{text}</Text>,
        },
        {
            title: "Quản lý", key: "action", width: 150,
            render: (_, record) => (
                <Tooltip title="Quản lý câu hỏi trong chương này">
                    <Button
                        icon={<UnorderedListOutlined />}
                        onClick={() => handleViewQuestions(record.chapterId)}
                        type="primary"
                        ghost
                    >
                        Xem Câu hỏi
                    </Button>
                </Tooltip>
            ),
        },
    ];

    return (
        <>
            <Modal
                title={
                    <Title level={4} style={{ margin: 0 }}>
                        <BookOutlined style={{ marginRight: 8 }} /> Chương học của môn: {subjectName || "..."}
                    </Title>
                }
                open={isModalOpen}
                onCancel={onCancel}
                footer={null}
                width={800} // Giảm width để đồng bộ với Modal con (ChapterQuestionModal là 1300)
                centered
            >
                {/* THAY THẾ DIV ĐƠN GIẢN BẰNG CARD CÓ THANH CÔNG CỤ */}
                <Card bordered={false} style={{ marginTop: 16 }}>
                    {/* Thanh Header/Tìm kiếm/Làm mới (Đồng bộ với ChapterQuestionModal) */}
                    <div style={{ marginBottom: 16 }}>
                        <Row justify="space-between" align="middle" gutter={[16, 16]}>
                            <Col>
                                <Text type="secondary">
                                    Tổng số {chapters.length} chương được tìm thấy.
                                </Text>
                            </Col>
                            <Col>
                                <Space>
                                    <Button icon={<ReloadOutlined />} onClick={() => fetchChapters(subjectId)}>Làm mới</Button>
                                    <Input
                                        placeholder="Tìm tên chương, mã môn..."
                                        prefix={<SearchOutlined />}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        allowClear
                                        style={{ width: 200 }}
                                    />
                                </Space>
                            </Col>
                        </Row>
                    </div>

                    {/* Bảng dữ liệu */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px 0' }}>
                            <Spin tip="Đang tải danh sách chương..." />
                        </div>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={getFilteredData()} // Dùng data đã lọc
                            rowKey="chapterId"
                            pagination={{
                                pageSize: 5
                            }}
                        />
                    )}
                </Card>
            </Modal>

            {/* --- MODAL CON (ChapterQuestionModal) --- */}
            {chapterIdForQuestions && (
                <ChapterQuestionModal
                    isModalOpen={isQuestionModalOpen}
                    onCancel={handleCloseQuestionModal}
                    chapterId={chapterIdForQuestions}
                />
            )}
        </>
    );
};

export default ChapterListModal;