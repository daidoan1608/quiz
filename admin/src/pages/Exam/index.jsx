import React, { useCallback, useEffect, useState } from "react";
import { Button, Input, Popconfirm, Segmented, Space, Table, Tag, Tooltip, Typography, message } from "antd";
import {
  ClockCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
  SearchOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { examApi } from "../../api/services";
import ManagementPageLayout from "../../layouts/ManagementPageLayout";
import AddExamModal from "../../components/Modal/AddExamModal";
import ExamViewModal from "../../components/Modal/ExamViewModal";

const { Text } = Typography;

export default function ExamManager() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState("active");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState(null);

  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const data = viewMode === "deleted" ? await examApi.getDeleted() : await examApi.getAll();
      setExams(data);
    } catch (error) {
      message.error(error.response?.data?.message || "Không thể tải danh sách đề thi.");
    } finally {
      setLoading(false);
    }
  }, [viewMode]);

  useEffect(() => {
    fetchExams();
  }, [viewMode, fetchExams]);

  const filteredExams = exams.filter((item) => {
    if (!searchText) return true;
    const q = searchText.toLowerCase();
    return item.title?.toLowerCase().includes(q) || item.subjectId?.toString().includes(q) || item.description?.toLowerCase().includes(q);
  });

  const handleDelete = async (examId) => {
    try {
      await examApi.remove(examId);
      message.success("Đã chuyển đề thi vào thùng rác.");
      fetchExams();
    } catch (error) {
      message.error(error.response?.data?.message || "Không thể xóa đề thi.");
    }
  };

  const handleRestore = async (examId) => {
    try {
      await examApi.restore(examId);
      message.success("Khôi phục đề thi thành công.");
      fetchExams();
    } catch (error) {
      message.error(error.response?.data?.message || "Cần khôi phục môn cha trước.");
    }
  };

  const columns = [
    { title: "Mã môn", dataIndex: "subjectId", key: "subjectId", width: 120, render: (text) => <Text strong>{text}</Text>, sorter: (a, b) => a.subjectId - b.subjectId },
    { title: "Tên đề thi", dataIndex: "title", key: "title", render: (text) => <Space><FileTextOutlined /> <Text strong>{text}</Text></Space> },
    { title: "Mô tả", dataIndex: "description", key: "description", responsive: ["md"], render: (text) => text || <Text type="secondary">Không có</Text> },
    { title: "Thời gian", dataIndex: "duration", key: "duration", width: 120, render: (duration) => <Tag icon={<ClockCircleOutlined />} color="blue">{duration} phút</Tag> },
    { title: "Số câu", dataIndex: "questionCount", key: "questionCount", width: 100, render: (count, record) => <Tag>{count ?? record.questions?.length ?? 0} câu</Tag> },
    ...(viewMode === "deleted"
      ? [
          { title: "Xóa lúc", dataIndex: "deletedAt", key: "deletedAt", width: 180, render: (value) => value || "-" },
          { title: "Nguồn xóa", dataIndex: "deleteOriginType", key: "deleteOriginType", width: 120, render: (value) => value || "-" },
        ]
      : []),
    {
      title: "Hành động",
      key: "action",
      width: viewMode === "active" ? 130 : 90,
      fixed: "right",
      render: (_, record) =>
        viewMode === "active" ? (
          <Space>
            <Tooltip title="Xem đề thi">
              <Button className="action-btn" icon={<EyeOutlined />} onClick={() => { setSelectedExamId(record.examId); setIsViewModalOpen(true); }} />
            </Tooltip>
            <Popconfirm
              title="Chuyển đề thi vào thùng rác?"
              description="Lịch sử bài làm và attempt đang làm vẫn được giữ."
              onConfirm={() => handleDelete(record.examId)}
              okText="Chuyển vào thùng rác"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button className="action-btn is-danger" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ) : (
          <Popconfirm title="Khôi phục đề thi?" onConfirm={() => handleRestore(record.examId)} okText="Khôi phục" cancelText="Hủy">
            <Button className="action-btn is-success" icon={<UndoOutlined />} />
          </Popconfirm>
        ),
    },
  ];

  const filters = (
    <Space wrap>
      <Segmented value={viewMode} onChange={setViewMode} options={[{ label: "Đang hoạt động", value: "active" }, { label: "Thùng rác", value: "deleted" }]} />
      <Input placeholder="Tìm tên đề, mã môn..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} allowClear style={{ width: 300 }} />
    </Space>
  );

  return (
    <>
      <ManagementPageLayout
        title={<Space><FileTextOutlined /> Quản lý đề thi</Space>}
        filters={filters}
        table={<Table columns={columns} dataSource={filteredExams} rowKey="examId" loading={loading} pagination={{ pageSize: 7 }} scroll={{ x: 1000 }} />}
        onReload={fetchExams}
        onAdd={viewMode === "active" ? () => setIsAddModalOpen(true) : undefined}
      />

      <AddExamModal isModalOpen={isAddModalOpen} onCancel={() => setIsAddModalOpen(false)} onSuccess={fetchExams} />
      <ExamViewModal isModalOpen={isViewModalOpen} onCancel={() => { setIsViewModalOpen(false); setSelectedExamId(null); }} examId={selectedExamId} />
    </>
  );
}
