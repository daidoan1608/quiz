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
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    BookOutlined,
    SearchOutlined,
    UnorderedListOutlined,
} from "@ant-design/icons";

// --- IMPORT LAYOUT CHUNG ---
import ManagementPageLayout from '../../layouts/ManagementPageLayout';

// --- IMPORT CÁC MODAL ĐÃ TÁCH ---
import AddChapterModal from "../../components/modal/AddChapterModal";
import UpdateChapterModal from "../../components/modal/UpdateChapterModal";
import ChapterQuestionModal from "../../components/modal/ChapterQuestionModal";

const { Text } = Typography;

export default function ChapterManager() {
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");

    // --- STATES QUẢN LÝ MODAL ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [chapterIdToUpdate, setChapterIdToUpdate] = useState(null);

    // --- STATES MỚI: QUẢN LÝ MODAL XEM CÂU HỎI ---
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    const [chapterIdToView, setChapterIdToView] = useState(null);

    useEffect(() => {
        fetchChapters();
    }, []);

    // --- 1. LẤY DỮ LIỆU (Giữ nguyên) ---
    const fetchChapters = async () => {
        setLoading(true);
        try {
            const response = await authAxios.get("/public/chapters");
            const data = Array.isArray(response.data.data) ? response.data.data : [];
            setChapters(data);
        } catch (error) {
            console.error("Lỗi API:", error);
            message.error("Không thể lấy danh sách chương!");
        } finally {
            setLoading(false);
        }
    };

    // --- 2. HÀNH ĐỘNG (Giữ nguyên) ---
    const deleteChapter = async (chapterId) => {
        try {
            await authAxios.delete(`/admin/chapters/${chapterId}`);
            setChapters((prev) =>
                prev.filter((chapter) => chapter.chapterId !== chapterId)
            );
            message.success("Xóa chương thành công!");
        } catch (error) {
            message.error("Không thể xóa chương (có thể đang chứa câu hỏi)!");
        }
    };

    const handleOpenUpdateModal = (chapterId) => {
        setChapterIdToUpdate(chapterId);
        setIsUpdateModalOpen(true);
    };

    const handleOpenQuestionModal = (chapterId) => {
        setChapterIdToView(chapterId);
        setIsQuestionModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setIsUpdateModalOpen(false);
        setChapterIdToUpdate(null);
        setIsQuestionModalOpen(false);
        setChapterIdToView(null);
    };

    const handleUpdateSuccess = () => {
        fetchChapters(); // Làm mới dữ liệu sau khi cập nhật thành công
        handleCloseModal();
    };

    // Hàm lọc dữ liệu (Giữ nguyên)
    const getFilteredData = () => {
        if (!searchText) return chapters;
        const lowerSearch = searchText.toLowerCase();
        return chapters.filter(
            (item) =>
                item.name?.toLowerCase().includes(lowerSearch) ||
                item.subjectId?.toString().includes(lowerSearch) ||
                item.chapterId?.toString().includes(lowerSearch)
        );
    };

    // --- 3. CẤU HÌNH CỘT (Giữ nguyên) ---
    const columns = [
        {
            title: "ID", dataIndex: "chapterId", key: "chapterId", width: 100,
            sorter: (a, b) => a.chapterId - b.chapterId, render: (text) => <Text type="secondary">{text}</Text>,
        },
        {
            title: "Tên chương", dataIndex: "name", key: "name",
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: "Subject ID", dataIndex: "subjectId", key: "subjectId", width: 120,
            render: (text) => <Text code>{text}</Text>,
        },
        {
            title: "Chương", dataIndex: "chapterNumber", key: "chapterNumber", width: 120,
            sorter: (a, b) => a.chapterNumber - b.chapterNumber, render: (num) => <Text>{num}</Text>,
        },
        {
            title: "Hành động", key: "action", width: 180,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem câu hỏi">
                        <Button
                            icon={<UnorderedListOutlined />}
                            onClick={() => handleOpenQuestionModal(record.chapterId)}
                            style={{ color: "#faad14", borderColor: "#faad14" }}
                        />
                    </Tooltip>

                    <Tooltip title="Sửa chương">
                        <Button
                            type="primary"
                            ghost
                            icon={<EditOutlined />}
                            onClick={() => handleOpenUpdateModal(record.chapterId)}
                        />
                    </Tooltip>

                    <Tooltip title="Xóa chương">
                        <Popconfirm
                            title="Xóa chương này?"
                            description="Hành động này không thể hoàn tác!"
                            onConfirm={() => deleteChapter(record.chapterId)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
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
            <BookOutlined /> Quản lý Chương
        </Space>
    );

    // 2. Bộ lọc/Tìm kiếm (Filters) - Chỉ gồm Input Search
    const chapterFilters = (
        <Input
            placeholder="Tìm tên chương, mã môn..."
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ maxWidth: 300 }}
        />
    );

    // 3. Bảng Dữ liệu (Table)
    const chapterTable = (
        <Table
            columns={columns}
            dataSource={getFilteredData()}
            rowKey="chapterId"
            loading={loading}
            // Tích hợp phân trang vào Table
            pagination={{
                pageSize: 7,
            }}
            scroll={{ x: 700 }}
        />
    );


    return (
        <>
            {/* SỬ DỤNG MANAGEMENTPAGELAYOUT THAY CHO CARD VÀ ROW/COL CŨ */}
            <ManagementPageLayout
                title={pageTitle}
                filters={chapterFilters}
                table={chapterTable}
                // Nút tải lại
                onReload={fetchChapters}
                // Nút thêm mới
                onAdd={() => setIsAddModalOpen(true)}
            />

            {/* --- MODAL THÊM CHƯƠNG --- */}
            <AddChapterModal
                isModalOpen={isAddModalOpen}
                onCancel={handleCloseModal}
                onSuccess={handleUpdateSuccess}
            />

            {/* --- MODAL CẬP NHẬT CHƯƠNG --- */}
            {chapterIdToUpdate && (
                <UpdateChapterModal
                    isModalOpen={isUpdateModalOpen}
                    onCancel={handleCloseModal}
                    onSuccess={handleUpdateSuccess}
                    chapterId={chapterIdToUpdate}
                />
            )}

            {/* --- MODAL XEM CÂU HỎI --- */}
            {isQuestionModalOpen && chapterIdToView && (
                <ChapterQuestionModal
                    isModalOpen={isQuestionModalOpen}
                    onCancel={handleCloseModal}
                    chapterId={chapterIdToView}
                />
            )}
        </>
    );
}