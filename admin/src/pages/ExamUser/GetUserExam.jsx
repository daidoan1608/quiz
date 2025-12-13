import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAxios } from "../../api/axiosConfig";
import {
  Table,
  Typography,
  Tag,
  Button,
  Tooltip,
  Input,
  message,
  Space,
} from "antd";
import { EyeOutlined, SearchOutlined, ReadOutlined } from "@ant-design/icons";
import ManagementPageLayout from '../../layouts/ManagementPageLayout'; // <-- IMPORT LAYOUT CHUNG

const { Text } = Typography;

/**
 * Helper function: Đảm bảo tiêu đề cột không xuống dòng. (Giữ nguyên)
 * @param {Array} columns - Mảng cấu hình cột gốc
 * @returns {Array} Mảng columns đã được xử lý
 */
const getNoWrapHeaderColumns = (columns) => {
  return columns.map((col) => ({
    ...col,
    onHeaderCell: (column) => ({
      ...column,
      style: {
        ...column.style,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    }),
  }));
};

export default function GetUserExam() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 7, total: 0 });
  const navigate = useNavigate();

  // Thêm hàm handleReload để đồng bộ với Layout
  const handleReload = () => {
    // Luôn tải lại từ trang 1 khi nhấn nút Tải lại
    fetchData(1);
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  const fetchData = async (page = pagination.current) => {
    setLoading(true);
    try {
      const examResponse = await authAxios.get("/admin/userexams", {
        params: { page: page - 1, size: pagination.pageSize } // Thêm tham số phân trang
      });
      const exams = examResponse.data.data || [];
      const totalElements = examResponse.data.totalElements || 0; // Giả định API trả về totalElements

      // 2-5. Logic lấy user và Gộp dữ liệu (Giữ nguyên)
      const uniqueUserIds = [...new Set(exams.map((item) => item.userExamDto.userId))];

      const userPromises = uniqueUserIds.map(
        (id) =>
          authAxios.get(`/user/${id}`).catch(() => ({ data: { data: null } }))
      );

      const userResponses = await Promise.all(userPromises);

      const userMap = {};
      userResponses.forEach((res, index) => {
        const userId = uniqueUserIds[index];
        const userData = res.data?.data;
        userMap[userId] = userData || {
          username: "Unknown",
          fullName: "Unknown",
        };
      });

      const mergedData = exams.map((item, index) => {
        const exam = item.userExamDto;
        const user = userMap[exam.userId];
        return {
          key: exam.userExamId || index,
          ...item,
          ...exam,
          username: user.username,
          fullName: user.fullName,
        };
      });

      setData(mergedData);
      setPagination(prev => ({ ...prev, current: page, total: totalElements })); // Cập nhật tổng số phần tử

    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
      message.error("Không thể tải danh sách bài thi!");
    } finally {
      setLoading(false);
    }
  };

  // Hàm lọc dữ liệu theo từ khóa tìm kiếm
  const getFilteredData = () => {
    // Vì tìm kiếm được thực hiện trên client-side sau khi load dữ liệu trang hiện tại,
    // ta giữ nguyên logic này.
    if (!searchText) return data;
    const lowerSearch = searchText.toLowerCase();
    return data.filter(
      (item) =>
        item.subjectName?.toLowerCase().includes(lowerSearch) ||
        item.title?.toLowerCase().includes(lowerSearch) ||
        item.username?.toLowerCase().includes(lowerSearch) ||
        item.fullName?.toLowerCase().includes(lowerSearch)
    );
  };

  // Cấu hình cột GỐC (Giữ nguyên)
  const columns = [
    { title: "Môn học", dataIndex: "subjectName", key: "subjectName", render: (text) => <Text strong>{text}</Text>, width: 150 },
    { title: "Đề thi", dataIndex: "title", key: "title", width: 200 },
    {
      title: "Người làm bài", key: "user", width: 180,
      render: (_, record) => (
        <div>
          <Text strong>{record.fullName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            @{record.username}
          </Text>
        </div>
      ),
    },
    {
      title: "Điểm số", dataIndex: "score", key: "score", width: 100,
      sorter: (a, b) => a.score - b.score,
      render: (score) => {
        let color = score >= 80 ? "success" : score >= 50 ? "warning" : "error";
        return (<Tag color={color} style={{ fontWeight: "bold" }}>{score}</Tag>);
      },
    },
    {
      title: "Thời gian", key: "time", width: 250,
      render: (_, record) => (
        <div style={{ fontSize: 13 }}>
          <div>Bắt đầu: {new Date(record.startTime).toLocaleString()}</div>
          <div>Kết thúc: {new Date(record.endTime).toLocaleString()}</div>
        </div>
      ),
    },
    {
      title: "UUID", dataIndex: "userId", key: "userId", width: 100,
      render: (text) => (
        <Tooltip title={text}>
          <Text style={{ width: 80, cursor: "pointer" }} ellipsis copyable>
            {text}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Hành động", key: "action", fixed: "right", width: 120,
      render: (_, record) => (
        <Tooltip title="Xem chi tiết bài làm">
          <Button
            icon={<EyeOutlined />}
            onClick={() => navigate(`/userexam/${record.userExamId}`)}
          />
        </Tooltip>
      ),
    },
  ];

  const finalColumns = getNoWrapHeaderColumns(columns);

  // --- ĐỊNH NGHĨA COMPONENTS CON CHO LAYOUT ---

  // 1. Bộ lọc/Tìm kiếm (Filters)
  const examFilters = (
    <Input
      placeholder="Tìm theo tên, môn học, user..."
      prefix={<SearchOutlined />}
      onChange={(e) => setSearchText(e.target.value)}
      onPressEnter={() => { /* Có thể trigger tìm kiếm API tại đây nếu muốn */ }}
      style={{ maxWidth: 400 }}
      allowClear
    />
  );

  // 2. Bảng Dữ liệu (Table)
  const examTable = (
    <Table
      columns={finalColumns}
      dataSource={getFilteredData()}
      loading={loading}
      pagination={{
        ...pagination, // Gộp cả current, pageSize, total
        onChange: (page) => {
            setPagination(prev => ({ ...prev, current: page }));
            fetchData(page); // Gọi API với trang mới
        },
        showSizeChanger: false, // Tùy chọn
      }}
      scroll={{ x: 1000 }}
    />
  );

  // 3. Tiêu đề chính
  const pageTitle = (
    <Space>
      <ReadOutlined /> Quản lý bài thi người dùng
    </Space>
  );

  return (
    // SỬ DỤNG MANAGEMENTPAGELAYOUT THAY CHO CARD CŨ
    <ManagementPageLayout
      title={pageTitle}
      filters={examFilters}
      table={examTable}
      // Không cần truyền 'pagination' riêng biệt vì đã tích hợp vào 'table' (Cách 1)
      onReload={handleReload}
      // Không có nút 'Thêm mới' trong trang này, nên không truyền onAdd
    />
  );
}