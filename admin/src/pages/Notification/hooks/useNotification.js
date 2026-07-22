import { useEffect, useState } from "react";
import { Form } from "antd";
import { authAxios } from "../../../api/axiosConfig";
import { useAuth } from "../../../context/AuthProvider";
import { appMessage as message } from "../../../utils/ui/messageService";

const toApiSortDirection = (sortDir) =>
  sortDir === "ascend" ? "asc" : sortDir === "descend" ? "desc" : undefined;

export const useNotification = () => {
  const { user, canGlobal, canAnySubject, canAny } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({});
  const [tableSort, setTableSort] = useState({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);
  const [notificationType, setNotificationType] = useState("GLOBAL");
  const [createForm] = Form.useForm();
  const [filterForm] = Form.useForm();

  const isMod = user?.role === "MOD";
  const canSendGlobal = canGlobal("NOTIFICATION", "SEND");
  const canSendSubject = canAnySubject("NOTIFICATION", "SEND");
  const canSendPersonal =
    canGlobal("NOTIFICATION", "SEND") &&
    canGlobal("NOTIFICATION", "VIEW_RECIPIENTS");
  const canViewRecipients = canAny("NOTIFICATION", "VIEW_RECIPIENTS");
  const canRecall = canGlobal("NOTIFICATION", "RECALL");

  const fetchCampaigns = async (
    page = 1,
    nextFilters = filters,
    nextSort = tableSort
  ) => {
    setLoading(true);
    try {
      const sortDir = toApiSortDirection(nextSort.sortDir);
      const params = {
        page: page - 1,
        size: pagination.pageSize,
        keyword: nextFilters.keyword || undefined,
        sendType: isMod ? "SUBJECT_ID" : nextFilters.sendType || undefined,
        createdBy: isMod ? undefined : nextFilters.createdBy || undefined,
        fromDate: nextFilters.fromDate,
        toDate: nextFilters.toDate,
        sort:
          nextSort.sortBy && sortDir
            ? `${nextSort.sortBy},${sortDir}`
            : undefined,
      };
      const response = await authAxios.get("/admin/notifications/campaigns", {
        params,
      });
      setCampaigns(response.data.content);
      setPagination((prev) => ({
        ...prev,
        current: page,
        total: response.data.totalElements,
      }));
    } catch (error) {
      message.error("Không thể tải danh sách thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns(1, {}, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (values) => {
    const nextFilters = {
      keyword: values.keyword?.trim(),
      sendType: values.sendType,
      createdBy: isMod ? undefined : values.createdBy?.trim(),
      fromDate: values.dateRange?.[0]?.startOf("day").toISOString(),
      toDate: values.dateRange?.[1]?.endOf("day").toISOString(),
    };
    setFilters(nextFilters);
    fetchCampaigns(1, nextFilters, tableSort);
  };

  const clearFilters = () => {
    filterForm.resetFields();
    setFilters({});
    fetchCampaigns(1, {}, tableSort);
  };

  const createSuccess = () => {
    setIsCreateModalOpen(false);
    createForm.resetFields();
    fetchCampaigns(1, filters, tableSort);
  };

  const recallCampaign = async (id) => {
    try {
      await authAxios.delete(`/admin/notifications/history/${id}`);
      message.success("Đã thu hồi chiến dịch thông báo");
      fetchCampaigns(pagination.current, filters, tableSort);
    } catch (error) {
      message.error("Không thể thu hồi");
    }
  };

  const viewRecipients = (historyId) => {
    setSelectedHistoryId(historyId);
    setIsDetailModalOpen(true);
  };

  const closeRecipients = () => {
    setIsDetailModalOpen(false);
    setSelectedHistoryId(null);
  };

  const openCreateModal = () => {
    if (!canSendGlobal && canSendSubject) {
      setNotificationType("SUBJECT");
      createForm.setFieldsValue({ type: "SUBJECT" });
    } else if (canSendGlobal) {
      setNotificationType("GLOBAL");
      createForm.setFieldsValue({ type: "GLOBAL" });
    } else {
      message.warning("Bạn chưa có quyền tạo thông báo.");
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handleTableChange = (nextPagination, _, sorter) => {
    const nextSort = sorter?.order
      ? { sortBy: sorter.columnKey || sorter.field, sortDir: sorter.order }
      : {};
    setTableSort(nextSort);
    fetchCampaigns(nextPagination.current || 1, filters, nextSort);
  };

  const getSortOrder = (key) =>
    tableSort.sortBy === key ? tableSort.sortDir : null;

  return {
    campaigns,
    loading,
    pagination,
    isMod,
    canSendGlobal,
    canSendSubject,
    canSendPersonal,
    canViewRecipients,
    canRecall,
    isCreateModalOpen,
    setIsCreateModalOpen,
    createForm,
    filterForm,
    notificationType,
    setNotificationType,
    isDetailModalOpen,
    selectedHistoryId,
    fetchCampaigns,
    handleFilter,
    clearFilters,
    createSuccess,
    recallCampaign,
    viewRecipients,
    closeRecipients,
    openCreateModal,
    handleTableChange,
    getSortOrder,
  };
};
