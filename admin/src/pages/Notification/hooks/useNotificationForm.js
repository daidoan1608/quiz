import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Form, message } from "antd";
import { authAxios, getApiErrorMessage } from "../../../api/axiosConfig";
import { userApi } from "../../../api/services/userApi";
import { useAuth } from "../../../context/AuthProvider";

export const useNotificationForm = ({
  isModalOpen,
  createForm,
  notificationType,
  setNotificationType,
  notificationTemplates,
  onSuccess,
}) => {
  const { canGlobal, canOnSubject, getAllowedSubjectIds } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const userSearchTimerRef = useRef(null);
  const watchedTitle = Form.useWatch("title", createForm);
  const watchedMessage = Form.useWatch("message", createForm);
  const currentTemplate =
    notificationTemplates[notificationType] || notificationTemplates.GLOBAL;
  const allowedSubjectIds = useMemo(
    () => getAllowedSubjectIds("NOTIFICATION", "SEND"),
    [getAllowedSubjectIds]
  );
  const canSendGlobal = canGlobal("NOTIFICATION", "SEND");
  const canSendSubject = allowedSubjectIds === null || allowedSubjectIds.length > 0;
  const canSendPersonal =
    canGlobal("NOTIFICATION", "SEND") &&
    canGlobal("NOTIFICATION", "VIEW_RECIPIENTS");
  const availableNotificationTypes = Object.entries(notificationTemplates).filter(
    ([value]) => {
      if (value === "GLOBAL") return canSendGlobal;
      if (value === "PERSONAL" || value === "BATCH") return canSendPersonal;
      if (value === "SUBJECT") return canSendSubject;
      return value === "SUBJECT";
    }
  );

  const fetchSubjects = useCallback(async () => {
    setLoadingSubjects(true);
    try {
      const response = await authAxios.get("/public/subjects");
      const allSubjects = response.data.data || [];
      setSubjects(
        Array.isArray(allowedSubjectIds)
          ? allSubjects.filter((subject) =>
              allowedSubjectIds.includes(Number(subject.subjectId))
            )
          : allSubjects
      );
    } catch (error) {
      message.error("Không thể tải danh sách môn học.");
    } finally {
      setLoadingSubjects(false);
    }
  }, [allowedSubjectIds]);

  useEffect(() => {
    if (isModalOpen && notificationType === "SUBJECT" && subjects.length === 0) {
      fetchSubjects();
    }
  }, [fetchSubjects, isModalOpen, notificationType, subjects.length]);

  useEffect(() => {
    if (!isModalOpen || canSendGlobal || !canSendSubject) return;
    setNotificationType("SUBJECT");
    createForm.setFieldsValue({ type: "SUBJECT", targetId: undefined });
    if (subjects.length === 0) fetchSubjects();
  }, [
    canSendGlobal,
    canSendSubject,
    createForm,
    fetchSubjects,
    isModalOpen,
    setNotificationType,
    subjects.length,
  ]);

  const fetchUsers = useCallback(
    async (keyword) => {
      if (!canSendPersonal || !keyword || keyword.trim().length < 2) {
        setUsers([]);
        return;
      }

      setLoadingUsers(true);
      try {
        setUsers(await userApi.search(keyword.trim(), 20));
      } catch (error) {
        message.error("Không thể tìm người dùng.");
      } finally {
        setLoadingUsers(false);
      }
    },
    [canSendPersonal]
  );

  const searchUsers = useCallback(
    (keyword) => {
      if (userSearchTimerRef.current) {
        clearTimeout(userSearchTimerRef.current);
      }
      userSearchTimerRef.current = setTimeout(() => {
        fetchUsers(keyword);
      }, 400);
    },
    [fetchUsers]
  );

  useEffect(
    () => () => {
      if (userSearchTimerRef.current) {
        clearTimeout(userSearchTimerRef.current);
      }
    },
    []
  );

  const handleTypeChange = (value) => {
    const canUseType =
      (value === "GLOBAL" && canSendGlobal) ||
      ((value === "PERSONAL" || value === "BATCH") && canSendPersonal) ||
      (value === "SUBJECT" && canSendSubject);

    if (!canUseType) {
      setNotificationType("SUBJECT");
      createForm.setFieldsValue({ type: "SUBJECT", targetId: undefined });
      return;
    }

    setNotificationType(value);
    createForm.setFieldsValue({ targetId: undefined });
    setUsers([]);
  };

  const handleCreate = async (values) => {
    if (values.type === "GLOBAL" && !canSendGlobal) {
      message.warning("Bạn chưa có quyền gửi thông báo toàn hệ thống.");
      return;
    }
    if (
      (values.type === "PERSONAL" || values.type === "BATCH") &&
      !canSendPersonal
    ) {
      message.warning("Bạn chưa có quyền chọn người nhận thông báo.");
      return;
    }
    if (
      values.type === "SUBJECT" &&
      !canOnSubject(values.targetId, "NOTIFICATION", "SEND")
    ) {
      message.warning("Bạn không có quyền gửi thông báo cho môn học này.");
      return;
    }

    setSubmitting(true);
    try {
      let endpoint = "/admin/notifications";
      const payload = { title: values.title, message: values.message };

      if (values.type === "GLOBAL") {
        endpoint += "/global";
      } else if (values.type === "PERSONAL") {
        endpoint += "/personal";
        payload.userId = values.targetId;
      } else if (values.type === "SUBJECT") {
        endpoint += "/subject";
        payload.subjectId = values.targetId;
        payload.subjectName =
          subjects.find((subject) => subject.subjectId === values.targetId)
            ?.name || "Thông báo môn học";
      } else if (values.type === "BATCH") {
        endpoint += "/batch";
        payload.userIds = values.targetId;
      }

      await authAxios.post(endpoint, payload);
      message.success("Gửi thông báo thành công!");
      onSuccess();
    } catch (error) {
      message.error(
        getApiErrorMessage(error, "Không thể gửi thông báo. Vui lòng thử lại.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return {
    subjects,
    loadingSubjects,
    users,
    loadingUsers,
    submitting,
    watchedTitle,
    watchedMessage,
    currentTemplate,
    availableNotificationTypes,
    searchUsers,
    handleTypeChange,
    handleCreate,
  };
};
