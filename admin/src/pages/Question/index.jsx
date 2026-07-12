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
    Modal,
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    QuestionCircleOutlined,
    SearchOutlined,
    ImportOutlined,
    UndoOutlined,
} from "@ant-design/icons";

// --- IMPORT LAYOUT CHUNG ---
import ManagementPageLayout from '../../layouts/ManagementPageLayout'; // <-- Đảm bảo đường dẫn đúng

// --- IMPORT CÁC MODAL ĐÃ TÁCH ---
import AddQuestionModal from "../../components/Modal/AddQuestionModal";
import UpdateQuestionModal from "../../components/Modal/UpdateQuestionModal";
import ImportModal from "../../components/Modal/ImportModal"; // Giả sử path đúng

import MarkdownLatex from "../../components/common/MarkdownLatex";

const { Text } = Typography;

export default function QuestionManager() {
    // Đổi tên component
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [deletedQuestions, setDeletedQuestions] = useState([]);
    const [deletedLoading, setDeletedLoading] = useState(false);
    const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);

    // --- STATES QUẢN LÝ MODAL ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [questionIdToUpdate, setQuestionIdToUpdate] = useState(null);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            getAllQuestions(searchText);
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [searchText]);

    // --- 1. LẤY DỮ LIỆU (Giữ nguyên) ---
    const getAllQuestions = async (keyword = "") => {
        setLoading(true);
        try {
            const trimmedKeyword = keyword.trim();
            const response = trimmedKeyword
                ? await authAxios.get("/admin/questions/search", { params: { q: trimmedKeyword } })
                : await authAxios.get("/admin/questions");
            const data = Array.isArray(response.data.data) ? response.data.data : [];
            setQuestions(data);
        } catch (error) {
            console.error("Error fetching questions:", error);
            message.error("Không thể tải danh sách câu hỏi!");
        } finally {
            setLoading(false);
        }
    };

    const getDeletedQuestions = async () => {
        setDeletedLoading(true);
        try {
            const response = await authAxios.get("/admin/questions/deleted");
            const data = Array.isArray(response.data.data) ? response.data.data : [];
            setDeletedQuestions(data);
        } catch (error) {
            console.error("Error fetching deleted questions:", error);
            message.error("Không thể tải thùng rác câu hỏi!");
        } finally {
            setDeletedLoading(false);
        }
    };

    const handleOpenTrashModal = () => {
        setIsTrashModalOpen(true);
        getDeletedQuestions();
    };

    // --- 2. HÀNH ĐỘNG (Giữ nguyên) ---
    const handleDelete = async (questionId) => {
        try {
            await authAxios.delete(`/admin/questions/${questionId}`);
            message.success("Xóa câu hỏi thành công!");
            setDeletedQuestions((prev) => prev.filter((q) => q.questionId !== questionId));
            getAllQuestions(searchText);
        } catch (error) {
            message.error("Không thể xóa câu hỏi!");
        }
    };

    const handleRestore = async (questionId) => {
        try {
            await authAxios.patch(`/admin/questions/${questionId}/restore`);
            message.success("Khôi phục câu hỏi thành công!");
            setDeletedQuestions((prev) => prev.filter((q) => q.questionId !== questionId));
            getAllQuestions(searchText);
        } catch (error) {
            message.error("Không thể khôi phục câu hỏi!");
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

    // Search dùng endpoint BE /admin/questions/search?q=...
    const getFilteredData = () => questions;

    const renderAnswerContent = (answers, index) => {
        const answer = answers && answers[index];
        if (!answer) return <Text type="secondary">-</Text>;

        const isCorrect = answer.isCorrect;

        return (
            <Tooltip
                title={
                    <MarkdownLatex
                        content={answer.content}
                        style={{ maxWidth: 300 }}
                    />
                }
                overlayStyle={{ maxWidth: 320 }}
            >
                <MarkdownLatex
                    content={answer.content}
                    style={{
                        maxWidth: 150,
                        overflow: 'hidden',
                        maxHeight: 60,
                        color: isCorrect ? '#52c41a' : undefined,
                        fontWeight: isCorrect ? 'bold' : undefined,
                    }}
                />
            </Tooltip>
        );
    };

    // Cấu hình cột (Giữ nguyên)
    const columns = [
        {
            title: "ID", dataIndex: "questionId", key: "questionId", width: 60, fixed: "left",
        },
        {
            title: "Nội dung câu hỏi", dataIndex: "content", key: "content", width: 260,
            render: (text) => (
                <Tooltip
                    title={
                        <MarkdownLatex
                            content={text}
                            style={{ maxWidth: 450, maxHeight: 300, overflowY: 'auto' }}
                        />
                    }
                    overlayStyle={{ maxWidth: 480 }}
                >
                    <MarkdownLatex
                        content={text}
                        style={{
                            maxWidth: 240,
                            maxHeight: 80,
                            overflow: 'hidden',
                            fontWeight: 'bold',
                            cursor: 'help',
                        }}
                    />
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
                            description="Câu hỏi sẽ được chuyển vào danh sách đã xóa và có thể khôi phục."
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
        <Space wrap>
            <Input
                placeholder="Tìm nội dung, chương..."
                prefix={<SearchOutlined />}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ maxWidth: 300 }}
            />
            <Tooltip title="Xem thùng rác câu hỏi">
                <Button danger icon={<DeleteOutlined />} onClick={handleOpenTrashModal}>
                    Thùng rác
                </Button>
            </Tooltip>
        </Space>
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
                onReload={() => getAllQuestions(searchText)}
                // Nút thêm mới
                onAdd={() => setIsAddModalOpen(true)}
            />

            <Modal
                title={<Space><DeleteOutlined /> Thùng rác câu hỏi</Space>}
                open={isTrashModalOpen}
                onCancel={() => setIsTrashModalOpen(false)}
                footer={null}
                width={1200}
            >
                <Table
                    columns={columns.map((column) =>
                        column.key === "action"
                            ? {
                                ...column,
                                render: (_, record) => (
                                    <Tooltip title="Khôi phục câu hỏi">
                                        <Popconfirm
                                            title="Khôi phục câu hỏi này?"
                                            onConfirm={() => handleRestore(record.questionId)}
                                            okText="Khôi phục"
                                            cancelText="Hủy"
                                        >
                                            <Button type="primary" ghost icon={<UndoOutlined />} />
                                        </Popconfirm>
                                    </Tooltip>
                                ),
                            }
                            : column
                    )}
                    dataSource={deletedQuestions}
                    rowKey="questionId"
                    loading={deletedLoading}
                    pagination={{ pageSize: 5, showSizeChanger: false }}
                    scroll={{ x: 1500 }}
                />
            </Modal>

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