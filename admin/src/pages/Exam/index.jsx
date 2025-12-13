import React, { useEffect, useState } from "react";
import { authAxios } from "../../api/axiosConfig";
import {
    Table,
    Input,
    Typography,
    Tag,
    message,
    Space,
    Button,
    Tooltip
} from "antd";
import {
    SearchOutlined,
    FileTextOutlined,
    ClockCircleOutlined,
    EyeOutlined, // Import icon Xem
} from "@ant-design/icons";

// --- IMPORT LAYOUT CHUNG ---
import ManagementPageLayout from '../../layouts/ManagementPageLayout';

// --- IMPORT MODAL ĐÃ TÁCH ---
import AddExamModal from "../../components/modal/AddExamModal";
import ExamViewModal from "../../components/modal/ExamViewModal"; // IMPORT MODAL MỚI

const { Text } = Typography;

export default function ExamManager() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");

    // --- STATE QUẢN LÝ MODAL ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    // THÊM STATE CHO MODAL XEM CHI TIẾT
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedExamId, setSelectedExamId] = useState(null);

    // --- API FETCH DỮ LIỆU ---
    const getAllExams = async () => {
        setLoading(true);
        try {
            const response = await authAxios.get("/admin/exams");
            setExams(response.data.data);
        } catch (error) {
            console.error("Error fetching exams: ", error);
            message.error("Không thể tải danh sách bài thi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAllExams();
    }, []);

    // Hàm lọc dữ liệu theo từ khóa tìm kiếm
    const getFilteredData = () => {
        if (!searchText) return exams;
        const lowerSearch = searchText.toLowerCase();
        return exams.filter(
            (item) =>
                item.title?.toLowerCase().includes(lowerSearch) ||
                item.subjectId?.toString().toLowerCase().includes(lowerSearch) ||
                item.description?.toLowerCase().includes(lowerSearch)
        );
    };

    // --- HANDLERS MODAL THÊM MỚI ---
    const handleOpenAddModal = () => {
        setIsAddModalOpen(true);
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
    };

    // --- HANDLERS MODAL XEM CHI TIẾT ---
    const handleViewExam = (examId) => {
        setSelectedExamId(examId);
        setIsViewModalOpen(true);
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setSelectedExamId(null);
    };

    // Cấu hình cột cho bảng
    const columns = [
        {
            title: "Subject ID", dataIndex: "subjectId", key: "subjectId", width: 130,
            render: (text) => <Text strong>{text}</Text>, sorter: (a, b) => a.subjectId - b.subjectId,
        },
        {
            title: "Tên đề thi", dataIndex: "title", key: "title",
            render: (text) => (
                <Space>
                    <FileTextOutlined style={{ color: "#1890ff" }} />
                    <Text strong>{text}</Text>
                </Space>
            ),
        },
        {
            title: "Mô tả", dataIndex: "description", key: "description",
            render: (text) =>
                text ? (
                    text
                ) : (
                    <Text type="secondary" italic>
                        Không có
                    </Text>
                ),
            responsive: ["md"],
        },
        {
            title: "Thời gian", dataIndex: "duration", key: "duration", width: 120,
            sorter: (a, b) => a.duration - b.duration,
            render: (duration) => (
                <Tag icon={<ClockCircleOutlined />} color="blue">
                    {duration} phút
                </Tag>
            ),
        },
        {
            title: "Số câu hỏi", key: "questions", width: 120,
            render: (_, record) => (
                <Tag color={record.questions?.length > 0 ? "geekblue" : "default"}>
                    {record.questions?.length || 0} câu
                </Tag>
            ),
        },
        // CỘT HÀNH ĐỘNG
        {
            title: "Hành động",
            width: 120,
            fixed: 'right', // Cố định cột hành động khi scroll ngang
            render: (_, record) => (
        <Space size="middle">
          {record.sendType !== 'GLOBAL' && (
            <Tooltip title="Xem người nhận">
              <Button icon={<EyeOutlined /> } onClick={() => handleViewExam(record.examId)} />
            </Tooltip>
          )}
        </Space>
            ),
        },
    ];

    // --- ĐỊNH NGHĨA COMPONENTS CON CHO LAYOUT ---

    // 1. Tiêu đề chính
    const pageTitle = (
        <Space>
            <FileTextOutlined /> Quản lý đề thi
        </Space>
    );

    // 2. Bộ lọc/Tìm kiếm (Filters)
    const examFilters = (
        <Input
            placeholder="Tìm tên đề, mã môn..."
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 300 }}
            allowClear
        />
    );

    // 3. Bảng Dữ liệu (Table)
    const examTable = (
        <Table
            columns={columns}
            dataSource={getFilteredData()}
            rowKey={(record) => record.examId || Math.random()}
            loading={loading}
            // Tích hợp phân trang vào Table
            pagination={{
                pageSize: 7,
            }}
            scroll={{ x: 900 }} // Điều chỉnh scroll x để chứa cột Action
        />
    );


    return (
        <>
            {/* SỬ DỤNG MANAGEMENTPAGELAYOUT */}
            <ManagementPageLayout
                title={pageTitle}
                filters={examFilters}
                table={examTable}
                onReload={getAllExams}
                onAdd={handleOpenAddModal}
            />

            {/* --- MODAL TẠO ĐỀ THI --- */}
            <AddExamModal
                isModalOpen={isAddModalOpen}
                onCancel={handleCloseAddModal}
                onSuccess={getAllExams}
            />

            {/* --- MODAL XEM CHI TIẾT ĐỀ THI --- */}
            <ExamViewModal
                isModalOpen={isViewModalOpen}
                onCancel={handleCloseViewModal}
                examId={selectedExamId} // Truyền ID của đề thi được chọn
            />
        </>
    );
}