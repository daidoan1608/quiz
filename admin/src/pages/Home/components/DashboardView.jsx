import React, { useCallback, useMemo } from "react";
import { Result, Row, Select, Space, Statistic, Table, theme, Typography } from "antd";
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
  PieChartOutlined,
  QuestionCircleOutlined,
  ReadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  DifficultyPieChart,
  OverviewBarChart,
} from "./StatisticsChart";
import { DEFAULT_WIDGET_ORDER, LIMIT_OPTIONS } from "../constants";
import { DashboardCard } from "./DashboardCard";
import { SortableWidget } from "./SortableWidget";
import { AdminResetButton } from "../../../components/common/buttons/AdminButtons";

const { Title, Text } = Typography;

export function DashboardView({
  canViewStatistics,
  loading,
  statistics,
  tableLimits,
  updateLimit,
  widgetOrder,
  setWidgetOrder,
}) {
  const { token } = theme.useToken();
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
          size="small"
          value={tableLimits[key]}
          options={LIMIT_OPTIONS}
          onChange={updateLimit(key)}
          style={{ width: 96 }}
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

  const tableProps = useMemo(
    () => ({
      size: "small",
      pagination: false,
      scroll: { x: true },
    }),
    []
  );

  const widgets = useMemo(() => {
    const statIconStyle = (color) => ({
      width: 38,
      height: 38,
      borderRadius: 8,
      display: "inline-grid",
      placeItems: "center",
      marginRight: 6,
      color,
      background: `${color}18`,
    });

    const statWidgets = [
      {
        id: "totalSubjects",
        title: "Môn học",
        value: statistics.totalSubjects,
        icon: <ReadOutlined />,
        color: token.colorPrimary,
      },
      {
        id: "totalQuestions",
        title: "Câu hỏi",
        value: statistics.totalQuestions,
        icon: <QuestionCircleOutlined />,
        color: token.colorWarning,
      },
      {
        id: "totalExams",
        title: "Đề thi",
        value: statistics.totalExams,
        icon: <FileTextOutlined />,
        color: token.colorSuccess,
      },
      {
        id: "totalUsers",
        title: "Người dùng",
        value: statistics.totalUsers,
        icon: <UserOutlined />,
        color: token.colorError,
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
            prefix={<span style={statIconStyle(item.color)}>{item.icon}</span>}
          />
        </DashboardCard>
      ),
    }));

    return [
      ...statWidgets,
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
            <Table
              {...tableProps}
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
            <Table
              {...tableProps}
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
            <Table
              {...tableProps}
              columns={[
                { title: "ID", dataIndex: "questionId", width: 80 },
                { title: "Câu hỏi", dataIndex: "content", ellipsis: true },
                { title: "Sai", dataIndex: "wrongCount", width: 90 },
              ]}
              dataSource={statistics.mostWrongQuestions || []}
              rowKey="questionId"
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
            <Table
              {...tableProps}
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
  }, [loading, renderLimitSelect, statistics, tableProps, token]);

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
      <div className="dashboard-header">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Dashboard
          </Title>
          <Text type="secondary">Tổng quan vận hành hệ thống quiz.</Text>
        </div>
        <AdminResetButton onClick={resetLayout}>
          Khôi phục bố cục
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
