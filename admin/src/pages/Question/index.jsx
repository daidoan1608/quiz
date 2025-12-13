import React, { useEffect, useState } from "react";
import { authAxios } from "../../api/axiosConfig";
import {
    Table,
    Button,
    Typography,
    Space,
    Tooltip,
    Popconfirm,
    message,
    Input,
    Tag,
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    QuestionCircleOutlined,
    SearchOutlined,
    ImportOutlined,
} from "@ant-design/icons";

// --- IMPORT LAYOUT CHUNG ---
import ManagementPageLayout from '../../layouts/ManagementPageLayout'; // <-- Đảm bảo đường dẫn đúng

// --- IMPORT CÁC MODAL ĐÃ TÁCH ---
import AddQuestionModal from "../../components/modal/AddQuestionModal";
import UpdateQuestionModal from "../../components/modal/UpdateQuestionModal";
import ImportModal from "../../components/modal/ImportModal"; // Giả sử path đúng

const { Text } = Typography;

export default function QuestionManager() {
    // Đổi tên component
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");

    // --- STATES QUẢN LÝ MODAL ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [questionIdToUpdate, setQuestionIdToUpdate] = useState(null);

    useEffect(() => {
        getAllQuestions();
    }, []);

    // --- 1. LẤY DỮ LIỆU (Giữ nguyên) ---
    const getAllQuestions = async () => {
        setLoading(true);
        try {
            const response = await authAxios.get("/admin/questions");
            const data = Array.isArray(response.data.data) ? response.data.data : [];
            setQuestions(data);
        } catch (error) {
            console.error("Error fetching questions:", error);
            message.error("Không thể tải danh sách câu hỏi!");
        } finally {
            setLoading(false);
        }
    };

    // --- 2. HÀNH ĐỘNG (Giữ nguyên) ---
    const handleDelete = async (questionId) => {
        try {
            await authAxios.delete(`/admin/questions/${questionId}`);
            message.success("Xóa câu hỏi thành công!");
            setQuestions((prev) => prev.filter((q) => q.questionId !== questionId));
        } catch (error) {
            message.error("Không thể xóa câu hỏi!");
        }
    };

    const handleOpenUpdateModal = (questionId) => {
        setQuestionIdToUpdate(questionId);
        setIsUpdateModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setIsUpdateModalOpen(false);
        setIsImportModalOpen(false);
        setQuestionIdToUpdate(null);
    };

    const handleSuccess = () => {
        getAllQuestions(); // Làm mới dữ liệu sau khi thành công
        handleCloseModal();
    };

    // Hàm lọc dữ liệu (Giữ nguyên)
    const getFilteredData = () => {
        if (!searchText) return questions;
        const lowerSearch = searchText.toLowerCase();
        return questions.filter(
            (item) =>
                item.content?.toLowerCase().includes(lowerSearch) ||
                item.chapterName?.toLowerCase().includes(lowerSearch) ||
                item.questionId?.toString().includes(lowerSearch)
        );
    };

    // Hàm helper để render nội dung đáp án với tooltip và cắt dòng (Giữ nguyên)
    const renderAnswerContent = (answers, index) => {
        const answer = answers && answers[index];
        if (!answer) return <Text type="secondary">-</Text>;

        const color = answer.isCorrect ? "success" : "default";

        return (
            <Tooltip title={answer.content}>
                <Text type={color} style={{ width: 150 }} ellipsis>
                    {answer.content}
                </Text>
            </Tooltip>
        );
    };

    // Cấu hình cột (Giữ nguyên)
    const columns = [
        {
            title: "ID", dataIndex: "questionId", key: "questionId", width: 60, fixed: "left",
        },
        {
            title: "Nội dung câu hỏi", dataIndex: "content", key: "content", width: 250,
            render: (text) => (
                <Tooltip title={text}>
                    <Text style={{ width: 230 }} ellipsis strong>{text}</Text>
                </Tooltip>
            ),
        },
        {
            title: "Mức độ", dataIndex: "difficulty", key: "difficulty", width: 100,
            render: (diff) => {
                let color = "blue";
                if (diff === "EASY" || diff === 1) color = "green";
                if (diff === "HARD" || diff === 3) color = "red";
                return <Tag color={color}>{diff}</Tag>;
            },
        },
        {
            title: "Chương", dataIndex: "chapterName", key: "chapterName", width: 150,
            render: (text) => <Text>{text}</Text>,
        },
        {
            title: "Đáp án A", key: "ansA", width: 150,
            render: (_, record) => renderAnswerContent(record.answers, 0),
        },
        {
            title: "Đáp án B", key: "ansB", width: 150,
            render: (_, record) => renderAnswerContent(record.answers, 1),
        },
        {
            title: "Đáp án C", key: "ansC", width: 150,
            render: (_, record) => renderAnswerContent(record.answers, 2),
        },
        {
            title: "Đáp án D", key: "ansD", width: 150,
            render: (_, record) => renderAnswerContent(record.answers, 3),
        },
        {
            title: "Hành động", key: "action", width: 120, fixed: "right",
            render: (_, record) => (
                <Space>
                    <Tooltip title="Sửa câu hỏi">
                        <Button
                            type="primary"
                            ghost
                            icon={<EditOutlined />}
                            onClick={() => handleOpenUpdateModal(record.questionId)}
                        />
                    </Tooltip>

                    <Tooltip title="Xóa câu hỏi">
                        <Popconfirm
                            title="Xóa câu hỏi này?"
                            description="Hành động này không thể hoàn tác!"
                            onConfirm={() => handleDelete(record.questionId)}
                            okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}
                        >
                            <Button danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // --- ĐỊNH NGHĨA COMPONENTS CON CHO LAYOUT ---

    // 1. Tiêu đề chính
    const pageTitle = (
        <Space>
            <QuestionCircleOutlined /> Quản lý câu hỏi
        </Space>
    );

    // 2. Bộ lọc/Tìm kiếm (Filters) - Chỉ gồm Input Search
    const questionFilters = (
        <Input
            placeholder="Tìm nội dung, chương..."
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ maxWidth: 300 }}
        />
    );

    // 3. Nút chức năng phụ (Import)
    const extraActions = (
        <Button
            icon={<ImportOutlined />}
            onClick={() => setIsImportModalOpen(true)} // MỞ MODAL IMPORT
        >
            Import
        </Button>
    );

    // 4. Bảng Dữ liệu (Table)
    const questionTable = (
        <Table
            columns={columns}
            dataSource={getFilteredData()}
            rowKey="questionId"
            loading={loading}
            pagination={{pageSize: 7, showSizeChanger: false}}
            scroll={{ x: 1500 }}
        />
    );

    return (
        <>
            {/* SỬ DỤNG MANAGEMENTPAGELAYOUT THAY CHO CARD VÀ ROW/COL CŨ */}
            <ManagementPageLayout
                title={pageTitle}
                filters={questionFilters}
                extra={extraActions} // Truyền nút Import vào phần extra
                table={questionTable}
                // Nút tải lại
                onReload={getAllQuestions}
                // Nút thêm mới
                onAdd={() => setIsAddModalOpen(true)}
            />

            {/* --- MODAL THÊM CÂU HỎI --- */}
            <AddQuestionModal
                isModalOpen={isAddModalOpen}
                onCancel={handleCloseModal}
                onSuccess={handleSuccess}
            />

            {/* --- MODAL CẬP NHẬT CÂU HỎI --- */}
            {questionIdToUpdate && (
                <UpdateQuestionModal
                    isModalOpen={isUpdateModalOpen}
                    onCancel={handleCloseModal}
                    onSuccess={handleSuccess}
                    questionId={questionIdToUpdate}
                />
            )}

            {/* --- MODAL IMPORT CÂU HỎI --- */}
            <ImportModal
                isModalOpen={isImportModalOpen}
                onCancel={handleCloseModal}
                onSuccess={handleSuccess}
            />
        </>
    );
}