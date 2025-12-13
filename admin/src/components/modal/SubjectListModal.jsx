import React, { useState, useEffect, useCallback } from 'react';
import {
    Modal, Spin, Table, Input, Typography, Space, message, theme, Button, Tag,
} from 'antd';
import {
    BookOutlined, SearchOutlined, ReloadOutlined,
} from '@ant-design/icons';
import { authAxios } from "../../api/axiosConfig"; // Giả định đường dẫn API đúng

const { Title, Text } = Typography;

/**
 * Modal hiển thị danh sách tất cả các môn học.
 * Có thể dùng cho mục đích xem hoặc chọn.
 * @param {boolean} isModalOpen - Trạng thái mở/đóng Modal.
 * @param {function} onCancel - Hàm đóng Modal.
 * @param {function} onSelect - Hàm xử lý khi chọn môn học (chỉ dùng nếu muốn chọn).
 * @param {boolean} selectionMode - Bật/tắt chế độ chọn môn học.
 */
const SubjectListModal = ({
    isModalOpen,
    onCancel,
    onSelect,
    selectionMode = false, // Mặc định chỉ xem
}) => {
    const { token } = theme.useToken();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Dùng cho chế độ chọn

    // --- FETCH DATA ---
    const fetchSubjects = useCallback(async () => {
        setLoading(true);
        try {
            // Thay thế bằng endpoint thực tế của bạn
            const response = await authAxios.get(`/admin/subjects`);
            setSubjects(response.data.data);
            message.success('Tải danh sách môn học thành công!');
        } catch (error) {
            console.error("Lỗi tải môn học:", error);
            message.error("Không thể tải danh sách môn học.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isModalOpen) {
            fetchSubjects();
        } else {
            // Reset trạng thái khi đóng
            setSearchText('');
            setSelectedRowKeys([]);
        }
    }, [isModalOpen, fetchSubjects]);

    // --- FILTER & SEARCH ---
    const getFilteredData = () => {
        if (!searchText) return subjects;
        const lowerSearch = searchText.toLowerCase();
        return subjects.filter(
            (item) =>
                item.subjectName?.toLowerCase().includes(lowerSearch) ||
                item.subjectCode?.toLowerCase().includes(lowerSearch) || // Giả định có subjectCode
                item.description?.toLowerCase().includes(lowerSearch)
        );
    };

    // --- TABLE CONFIG ---
    const columns = [
        {
            title: 'Mã Môn',
            dataIndex: 'subjectCode',
            key: 'subjectCode',
            width: 120,
            sorter: (a, b) => a.subjectCode.localeCompare(b.subjectCode),
            render: (text) => <Text strong style={{ color: token.colorPrimary }}>{text || 'N/A'}</Text>
        },
        {
            title: 'Tên Môn học',
            dataIndex: 'subjectName',
            key: 'subjectName',
            render: (text) => (
                <Space>
                    <BookOutlined />
                    {text}
                </Space>
            ),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            responsive: ['md'],
            render: (text) => text || <Text type="secondary" italic>Không có mô tả</Text>
        },
    ];

    // --- SELECTION CONFIG (Nếu bật chế độ chọn) ---
    const rowSelection = {
        selectedRowKeys,
        onChange: (keys) => {
            setSelectedRowKeys(keys);
        },
        type: 'radio', // Có thể đổi thành 'checkbox' nếu muốn chọn nhiều
    };

    // --- HANDLER CHO NÚT CHỌN ---
    const handleConfirmSelection = () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Vui lòng chọn ít nhất một môn học.');
            return;
        }

        // Lấy thông tin chi tiết của môn học được chọn
        const selectedSubject = subjects.find(s => s.subjectId === selectedRowKeys[0]);

        if (onSelect && selectedSubject) {
            onSelect(selectedSubject); // Gửi đối tượng môn học được chọn
        }
        onCancel(); // Đóng modal
    };

    // --- RENDER FOOTER ---
    const modalFooter = selectionMode ? [
        <Button key="back" onClick={onCancel}>
            Hủy
        </Button>,
        <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleConfirmSelection}
            disabled={selectedRowKeys.length === 0}
        >
            Xác nhận Chọn ({selectedRowKeys.length})
        </Button>,
    ] : [];

    // --- MAIN RENDER ---
    return (
        <Modal
            title={
                <Title level={4} style={{ margin: 0 }}>
                    <BookOutlined style={{ marginRight: 8 }} />
                    {selectionMode ? "Chọn Môn học" : "Danh sách Môn học"}
                </Title>
            }
            open={isModalOpen}
            onCancel={onCancel}
            footer={modalFooter}
            width={800}
            centered
        >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {/* Thanh tìm kiếm và Tải lại */}
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Input
                        placeholder="Tìm kiếm theo Mã hoặc Tên Môn học"
                        prefix={<SearchOutlined />}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                        allowClear
                    />
                    <Button icon={<ReloadOutlined />} onClick={fetchSubjects} loading={loading}>
                        Tải lại
                    </Button>
                </Space>

                {/* Bảng danh sách môn học */}
                <Spin spinning={loading} tip="Đang tải môn học...">
                    <Table
                        columns={columns}
                        dataSource={getFilteredData()}
                        rowKey={(record) => record.subjectId} // Giả định key là subjectId
                        loading={loading}
                        rowSelection={selectionMode ? rowSelection : undefined}
                        pagination={{ pageSize: 5 }}
                        scroll={{ y: 350 }}
                        size="middle"
                    />
                </Spin>
            </Space>
        </Modal>
    );
};

export default SubjectListModal;