import React, { useCallback, useMemo } from "react";
import { Col, DatePicker, Result, Row, Select, Space, Statistic, Typography } from "antd";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import {
  BarChartOutlined,
  FileTextOutlined,
  LineChartOutlined,
  PieChartOutlined,
  QuestionCircleOutlined,
  ReadOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  DifficultyPieChart,
  OverviewBarChart,
} from "./StatisticsChart";
import { DEFAULT_WIDGET_ORDER, LIMIT_OPTIONS } from "../constants";
import { AdminWidgetTable } from "./AdminWidgetTable";
import { DashboardCard } from "./DashboardCard";
import { SortableWidget } from "./SortableWidget";
import {
  AdminReloadButton,
  AdminResetButton,
} from "../../../components/common/buttons/AdminButtons";
import AdminPageHeader from "../../../components/common/layout/AdminPageHeader";

const { Text } = Typography;
const { RangePicker } = DatePicker;

const formatPercent = (value) => `${Number(value || 0).toFixed(2)}%`;
const formatScore = (value) => Number(value || 0).toFixed(2);
const renderScoreValue = (value) => (
  <span className="dashboard-score-value">{formatScore(value)}</span>
);
const renderSuccessPercent = (value) => (
  <span className="dashboard-success-value">{formatPercent(value)}</span>
);

export function DashboardView({
  canViewStatistics,
  loading,
  filterLoading,
  statistics,
  tableLimits,
  filters,
  subjects,
  exams,
  updateLimit,
  updateFilter,
  resetFilters,
  refresh,
  widgetOrder,
  setWidgetOrder,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const renderLimitSelect = useCallback(
    (key) => (
      <Space size={8}>
        <Text type="secondary">Hiển thị</Text>
        <Select
          className="dashboard-limit-select"
          size="small"
          value={tableLimits[key]}
          options={LIMIT_OPTIONS}
          onChange={updateLimit(key)}
        />
      </Space>
    ),
    [tableLimits, updateLimit]
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    setWidgetOrder((items) => {
      const oldIndex = items.indexOf(active.id);
      const newIndex = items.indexOf(over.id);
      if (oldIndex === -1 || newIndex === -1) return items;
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const resetLayout = () => {
    setWidgetOrder(DEFAULT_WIDGET_ORDER);
  };

  const widgets = useMemo(() => {
    const summary = statistics.summary || {};
    const statWidgets = [
      {
        id: "totalSubjects",
        title: "Môn học",
        value: statistics.totalSubjects,
        icon: <ReadOutlined />,
        tone: "primary",
      },
      {
        id: "totalQuestions",
        title: "Câu hỏi",
        value: statistics.totalQuestions,
        icon: <QuestionCircleOutlined />,
        tone: "warning",
      },
      {
        id: "totalExams",
        title: "Đề thi",
        value: statistics.totalExams,
        icon: <FileTextOutlined />,
        tone: "success",
      },
      {
        id: "totalUsers",
        title: "Người dùng",
        value: statistics.totalUsers,
        icon: <UserOutlined />,
        tone: "error",
      },
    ].map((item) => ({
      id: item.id,
      colProps: { xs: 24, sm: 12, lg: 6 },
      render: ({ dragHandleProps, isDragging }) => (
        <DashboardCard
          title={item.title}
          loading={loading}
          dragHandleProps={dragHandleProps}
          isDragging={isDragging}
        >
          <Statistic
            title={item.title}
            value={item.value}
            prefix={
              <span className={`dashboard-stat-icon dashboard-stat-icon--${item.tone}`}>
                {item.icon}
              </span>
            }
          />
        </DashboardCard>
      ),
    }));

    return [
      ...statWidgets,
      {
        id: "resultSummary",
        colProps: { xs: 24 },
        render: ({ dragHandleProps, isDragging }) => (
          <DashboardCard
            title={
              <Space>
                <LineChartOutlined />
                <span>Kết quả thi</span>
              </Space>
            }
            loading={loading}
            dragHandleProps={dragHandleProps}
            isDragging={isDragging}
          >
            <Row gutter={[16, 16]}>
              <Col xs={12} md={8} xl={4}>
                <Statistic title="Lượt nộp" value={summary.submittedAttempts || 0} />
              </Col>
              <Col xs={12} md={8} xl={5}>
                <Statistic title="Lượt mở bài" value={summary.totalAttempts || 0} />
              </Col>
              <Col xs={12} md={8} xl={5}>
                <Statistic
                  title="Tỷ lệ hoàn thành"
                  value={summary.completionRate || 0}
                  precision={2}
                  suffix="%"
                  valueStyle={{ color: "var(--admin-verified)" }}
                />
              </Col>
              <Col xs={12} md={8} xl={5}>
                <Statistic
                  title="Điểm trung bình"
                  value={summary.averageScore || 0}
                  precision={2}
                  valueStyle={{ color: "var(--admin-score)" }}
                />
              </Col>
              <Col xs={12} md={8} xl={5}>
                <Statistic
                  title="Tỷ lệ đạt"
                  value={summary.passRate || 0}
                  precision={2}
                  suffix="%"
                  valueStyle={{ color: "var(--admin-verified)" }}
                />
              </Col>
            </Row>
          </DashboardCard>
        ),
      },
      {
        id: "overviewChart",
        colProps: { xs: 24, xl: 14 },
        render: ({ dragHandleProps, isDragging }) => (
          <DashboardCard
            title={
              <Space>
                <BarChartOutlined />
                <span>Thống kê tổng quan</span>
              </Space>
            }
            loading={loading}
            dragHandleProps={dragHandleProps}
            isDragging={isDragging}
          >
            <OverviewBarChart statistics={statistics} />
          </DashboardCard>
        ),
      },
      {
        id: "difficultyChart",
        colProps: { xs: 24, xl: 10 },
        render: ({ dragHandleProps, isDragging }) => (
          <DashboardCard
            title={
              <Space>
                <PieChartOutlined />
                <span>Tỷ lệ độ khó</span>
              </Space>
            }
            loading={loading}
            dragHandleProps={dragHandleProps}
            isDragging={isDragging}
          >
            <DifficultyPieChart statistics={statistics} />
          </DashboardCard>
        ),
      },
      {
        id: "attemptsByDay",
        colProps: { xs: 24, lg: 12 },
        render: ({ dragHandleProps, isDragging }) => (
          <DashboardCard
            title="Lượt thi theo ngày"
            loading={loading}
            dragHandleProps={dragHandleProps}
            isDragging={isDragging}
          >
            <AdminWidgetTable
              columns={[
                { title: "Ngày", dataIndex: "date" },
                { title: "Lượt thi", dataIndex: "attempts", width: 120 },
              ]}
              dataSource={statistics.attemptsByDay || []}
              rowKey="date"
            />
          </DashboardCard>
        ),
      },
      {
        id: "hotSubjects",
        colProps: { xs: 24, lg: 12 },
        render: ({ dragHandleProps, isDragging }) => (
          <DashboardCard
            title="Môn hot"
            extra={renderLimitSelect("hotSubjectsLimit")}
            loading={loading}
            dragHandleProps={dragHandleProps}
            isDragging={isDragging}
          >
            <AdminWidgetTable
              columns={[
                { title: "Môn học", dataIndex: "subjectName", ellipsis: true },
                { title: "Lượt thi", dataIndex: "attempts", width: 120 },
              ]}
              dataSource={statistics.hotSubjects || []}
              rowKey="subjectName"
            />
          </DashboardCard>
        ),
      },
      {
        id: "scoreByExam",
        colProps: { xs: 24, xl: 12 },
        render: ({ dragHandleProps, isDragging }) => (
          <DashboardCard
            title="Điểm trung bình theo đề"
            extra={renderLimitSelect("examPerformanceLimit")}
            loading={loading}
            dragHandleProps={dragHandleProps}
            isDragging={isDragging}
          >
            <AdminWidgetTable
              columns={[
                { title: "Đề thi", dataIndex: "examTitle", ellipsis: true },
                { title: "Môn", dataIndex: "subjectName", ellipsis: true },
                { title: "Lượt nộp", dataIndex: "submittedAttempts", width: 100 },
                {
                  title: "Điểm TB",
                  dataIndex: "averageScore",
                  width: 100,
                  render: renderScoreValue,
                },
                {
                  title: "Hoàn thành",
                  dataIndex: "completionRate",
                  width: 120,
                  render: renderSuccessPercent,
                },
              ]}
              dataSource={statistics.scoreByExam || []}
              rowKey="examId"
            />
          </DashboardCard>
        ),
      },
      {
        id: "scoreBySubject",
        colProps: { xs: 24, xl: 12 },
        render: ({ dragHandleProps, isDragging }) => (
          <DashboardCard
            title="Điểm trung bình theo môn"
            extra={renderLimitSelect("subjectPerformanceLimit")}
            loading={loading}
            dragHandleProps={dragHandleProps}
            isDragging={isDragging}
          >
            <AdminWidgetTable
              columns={[
                { title: "Môn học", dataIndex: "subjectName", ellipsis: true },
                { title: "Lượt nộp", dataIndex: "submittedAttempts", width: 100 },
                {
                  title: "Điểm TB",
                  dataIndex: "averageScore",
                  width: 100,
                  render: renderScoreValue,
                },
                {
                  title: "Hoàn thành",
                  dataIndex: "completionRate",
                  width: 120,
                  render: renderSuccessPercent,
                },
              ]}
              dataSource={statistics.scoreBySubject || []}
              rowKey="subjectId"
            />
          </DashboardCard>
        ),
      },
      {
        id: "wrongQuestions",
        colProps: { xs: 24, xl: 14 },
        render: ({ dragHandleProps, isDragging }) => (
          <DashboardCard
            title="Câu sai nhiều nhất"
            extra={renderLimitSelect("wrongQuestionsLimit")}
            loading={loading}
            dragHandleProps={dragHandleProps}
            isDragging={isDragging}
          >
            <AdminWidgetTable
              columns={[
                { title: "ID", dataIndex: "questionId", width: 80 },
                { title: "Câu hỏi", dataIndex: "content", ellipsis: true },
                { title: "Môn", dataIndex: "subjectName", ellipsis: true },
                { title: "Sai", dataIndex: "wrongCount", width: 90 },
                { title: "Trả lời", dataIndex: "attemptCount", width: 100 },
                {
                  title: "Tỷ lệ sai",
                  dataIndex: "wrongRate",
                  width: 110,
                  render: formatPercent,
                },
              ]}
              dataSource={statistics.mostWrongQuestions || []}
              rowKey="questionId"
            />
          </DashboardCard>
        ),
      },
      {
        id: "ranking",
        colProps: { xs: 24, xl: 14 },
        render: ({ dragHandleProps, isDragging }) => (
          <DashboardCard
            title={
              <Space>
                <TrophyOutlined />
                <span>Ranking theo thời gian</span>
              </Space>
            }
            extra={renderLimitSelect("rankingLimit")}
            loading={loading}
            dragHandleProps={dragHandleProps}
            isDragging={isDragging}
          >
            <AdminWidgetTable
              columns={[
                { title: "User", dataIndex: "username", ellipsis: true },
                { title: "Họ tên", dataIndex: "fullName", ellipsis: true },
                { title: "Lượt nộp", dataIndex: "attemptCount", width: 100 },
                {
                  title: "Điểm TB",
                  dataIndex: "avgScore",
                  width: 100,
                  render: renderScoreValue,
                },
                {
                  title: "Tổng điểm",
                  dataIndex: "totalScore",
                  width: 110,
                  render: renderScoreValue,
                },
              ]}
              dataSource={statistics.ranking || []}
              rowKey="userId"
            />
          </DashboardCard>
        ),
      },
      {
        id: "activeUsers",
        colProps: { xs: 24, xl: 10 },
        render: ({ dragHandleProps, isDragging }) => (
          <DashboardCard
            title="User hoạt động"
            extra={renderLimitSelect("activeUsersLimit")}
            loading={loading}
            dragHandleProps={dragHandleProps}
            isDragging={isDragging}
          >
            <AdminWidgetTable
              columns={[
                { title: "User", dataIndex: "username", ellipsis: true },
                { title: "Họ tên", dataIndex: "fullName", ellipsis: true },
                { title: "Lượt thi", dataIndex: "attempts", width: 120 },
              ]}
              dataSource={statistics.activeUsers || []}
              rowKey="userId"
            />
          </DashboardCard>
        ),
      },
    ];
  }, [loading, renderLimitSelect, statistics]);

  const widgetMap = useMemo(
    () => new Map(widgets.map((widget) => [widget.id, widget])),
    [widgets]
  );

  if (!canViewStatistics) {
    return (
      <Result
        status="403"
        title="Không có quyền xem dashboard"
        subTitle="Tài khoản của bạn chưa được cấp quyền xem thống kê tổng quan."
      />
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        subtitle="Tổng quan vận hành hệ thống quiz."
        actions={
          <Space wrap>
            <AdminReloadButton onClick={refresh} loading={loading}>
              Tải lại
            </AdminReloadButton>
            <AdminResetButton onClick={resetLayout}>
              Khôi phục bố cục
            </AdminResetButton>
          </Space>
        }
      />

      <div className="dashboard-filter-bar">
        <Select
          allowClear
          showSearch
          className="dashboard-filter-control"
          loading={filterLoading}
          placeholder="Môn học"
          optionFilterProp="label"
          value={filters.subjectId}
          options={(subjects || []).map((subject) => ({
            value: subject.subjectId,
            label: subject.name,
          }))}
          onChange={updateFilter("subjectId")}
        />
        <Select
          allowClear
          showSearch
          className="dashboard-filter-control dashboard-filter-control--wide"
          loading={filterLoading}
          placeholder="Đề thi"
          optionFilterProp="label"
          value={filters.examId}
          options={(exams || []).map((exam) => ({
            value: exam.examId,
            label: exam.title,
          }))}
          onChange={updateFilter("examId")}
        />
        <RangePicker
          className="dashboard-date-range"
          value={filters.dateRange}
          onChange={updateFilter("dateRange")}
        />
        <AdminResetButton onClick={resetFilters}>
          Xóa lọc
        </AdminResetButton>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={widgetOrder} strategy={rectSortingStrategy}>
          <Row gutter={[18, 18]}>
            {widgetOrder.map((widgetId) => {
              const widget = widgetMap.get(widgetId);
              if (!widget) return null;
              return (
                <SortableWidget
                  id={widget.id}
                  key={widget.id}
                  colProps={widget.colProps}
                >
                  {widget.render}
                </SortableWidget>
              );
            })}
          </Row>
        </SortableContext>
      </DndContext>
    </>
  );
}
