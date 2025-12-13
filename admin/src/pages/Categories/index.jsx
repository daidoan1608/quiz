import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAxios } from "../../api/axiosConfig";
import {
    Table,
    Button,
    Space,
    Tooltip,
    Popconfirm,
    message,
    Input,
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    AppstoreOutlined,
    SearchOutlined,
    UnorderedListOutlined,
    ReloadOutlined,
} from "@ant-design/icons";

// --- IMPORT LAYOUT CHUNG ---
import ManagementPageLayout from '../../layouts/ManagementPageLayout';

// --- IMPORT CÁC MODAL ĐÃ TÁCH ---
import AddCategoryModal from "../../components/modal/AddCategoryModal";
import UpdateCategoryModal from "../../components/modal/UpdateCategoryModal";
import SubjectListModal from "../../components/modal/SubjectListModal"; // <-- ĐÃ THÊM MODAL MÔN HỌC

export default function CategoryManager() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const navigate = useNavigate();

    // --- STATES QUẢN LÝ MODAL ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);

    // --- STATES MỚI CHO MODAL XEM MÔN HỌC ---
    const [isSubjectListModalOpen, setIsSubjectListModalOpen] = useState(false);
    const [categoryIdToViewSubjects, setCategoryIdToViewSubjects] = useState(null);
    const [categoryNameToViewSubjects, setCategoryNameToViewSubjects] = useState(null);

    // Kiểm tra quyền
    const currentUserRole = localStorage.getItem("role");
    const isAdmin = currentUserRole === "ADMIN";

    useEffect(() => {
        fetchCategories();
    }, []);

    // --- 1. LẤY DỮ LIỆU ---
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await authAxios.get("/public/categories");
            const data = Array.isArray(response.data.data)
                ? response.data.data
                : [response.data.data];
            setCategories(Array.isArray(data[0]) ? data[0] : data);
        } catch (error) {
            console.error("Error fetching categories:", error);
            message.error("Không thể tải danh sách khoa!");
        } finally {
            setLoading(false);
        }
    };

    // --- 2. XỬ LÝ HÀNH ĐỘNG ---

    const handleDelete = async (categoryId) => {
        if (!isAdmin) {
            message.warning("Bạn không có quyền xóa khoa!");
            return;
        }
        try {
            await authAxios.delete(`/admin/categories/${categoryId}`);
            message.success("Xóa khoa thành công!");
            setCategories((prev) => prev.filter((c) => c.categoryId !== categoryId));
        } catch (error) {
            message.error("Không thể xóa khoa này (có thể do ràng buộc dữ liệu)");
        }
    };

    const handleOpenUpdateModal = (categoryId) => {
        setSelectedCategoryId(categoryId);
        setIsUpdateModalOpen(true);
    };

    // Hàm MỚI: Mở Modal Xem Môn học
    const handleOpenSubjectListModal = (categoryId, categoryName) => {
        setCategoryIdToViewSubjects(categoryId);
        setCategoryNameToViewSubjects(categoryName);
        setIsSubjectListModalOpen(true);
    };

    // Hàm Đóng Modal CHUNG (Đã cập nhật reset state của Subject Modal)
    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setIsUpdateModalOpen(false);
        setSelectedCategoryId(null);
        // Reset states của Subject Modal
        setIsSubjectListModalOpen(false);
        setCategoryIdToViewSubjects(null);
        setCategoryNameToViewSubjects(null);
    };

    // Hàm lọc dữ liệu (Giữ nguyên)
    const getFilteredData = () => {
        if (!searchText) return categories;
        const lowerSearch = searchText.toLowerCase();
        return categories.filter(
            (item) =>
                item.categoryName?.toLowerCase().includes(lowerSearch) ||
                item.categoryDescription?.toLowerCase().includes(lowerSearch)
        );
    };

    // --- 3. CẤU HÌNH CỘT (Cập nhật Hành động để mở Modal) ---
    const columns = [
        { title: "ID", dataIndex: "categoryId", key: "categoryId", width: 100, sorter: (a, b) => a.categoryId - b.categoryId },
        { title: "Tên Khoa", dataIndex: "categoryName", key: "categoryName", render: (text) => <strong>{text}</strong> },
        {
            title: "Mô tả", dataIndex: "categoryDescription", key: "categoryDescription",
            render: (text) => text || <i style={{ color: "#999" }}>Không có mô tả</i>,
        },
        {
            title: "Hành động", key: "action", width: 180,
            render: (_, record) => (
                <Space>
                    {/* THAY THẾ navigate BẰNG việc mở Modal SubjectListModal */}
                    <Tooltip title="Xem danh sách môn học">
                        <Button
                            icon={<UnorderedListOutlined />}
                            // GỌI HÀM MỞ MODAL
                            onClick={() => handleOpenSubjectListModal(record.categoryId, record.categoryName)}
                            style={{ color: "#faad14", borderColor: "#faad14" }}
                        />
                    </Tooltip>

                    {/* Nút Sửa (Chỉ Admin) */}
                    <Tooltip title={!isAdmin ? "Chỉ Admin mới được sửa" : "Sửa thông tin"}>
                        <Button
                            type="primary"
                            ghost
                            icon={<EditOutlined />}
                            disabled={!isAdmin}
                            onClick={() => handleOpenUpdateModal(record.categoryId)}
                        />
                    </Tooltip>

                    {/* Nút Xóa (Chỉ Admin) */}
                    <Tooltip title={!isAdmin ? "Chỉ Admin mới được xóa" : "Xóa khoa"}>
                        <Popconfirm
                            title="Xóa khoa này?"
                            description="Hành động này không thể hoàn tác!"
                            onConfirm={() => handleDelete(record.categoryId)}
                            okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}
                            disabled={!isAdmin}
                        >
                            <Button danger icon={<DeleteOutlined />} disabled={!isAdmin} />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // --- ĐỊNH NGHĨA COMPONENTS CON CHO LAYOUT ---

    const pageTitle = (
        <Space>
            <AppstoreOutlined /> Quản lý Khoa
        </Space>
    );

    const categoryFilters = (
        <Input
            placeholder="Tìm tên khoa..."
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ maxWidth: 300 }}
        />
    );

    const categoryTable = (
        <Table
            columns={columns}
            dataSource={getFilteredData()}
            rowKey="categoryId"
            loading={loading}
            pagination={{ pageSize: 7}}
            scroll={{ x: 600 }}
        />
    );

    return (
        <>
            {/* SỬ DỤNG MANAGEMENTPAGELAYOUT */}
            <ManagementPageLayout
                title={pageTitle}
                filters={categoryFilters}
                table={categoryTable}
                onReload={fetchCategories}
                onAdd={isAdmin ? () => setIsAddModalOpen(true) : undefined}
            />

            {/* --- MODAL THÊM KHOA --- */}
            <AddCategoryModal
                isModalOpen={isAddModalOpen}
                onCancel={handleCloseModal}
                onSuccess={() => {
                    fetchCategories();
                    handleCloseModal();
                }}
            />

            {/* --- MODAL CẬP NHẬT KHOA --- */}
            {selectedCategoryId && (
                <UpdateCategoryModal
                    isModalOpen={isUpdateModalOpen}
                    onCancel={handleCloseModal}
                    onSuccess={() => {
                        fetchCategories();
                        handleCloseModal();
                    }}
                    categoryId={selectedCategoryId}
                />
            )}

            {/* --- MODAL XEM DANH SÁCH MÔN HỌC --- */}
            {categoryIdToViewSubjects && (
                <SubjectListModal
                    isModalOpen={isSubjectListModalOpen}
                    onCancel={handleCloseModal}
                    // Truyền props để Modal biết lấy môn học theo khoa nào
                    categoryId={categoryIdToViewSubjects}
                    categoryName={categoryNameToViewSubjects}
                    selectionMode={false}
                />
            )}
        </>
    );
}