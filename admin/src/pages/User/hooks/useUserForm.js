import { useCallback, useEffect, useState } from "react";
import { appMessage as message } from "../../../utils/ui/messageService";
import { Form, Modal } from "antd";
import { authAxios, getApiErrorMessage } from "../../../api/axiosConfig";
import { userApi } from "../../../api/services";
import { unwrapApiData } from "../../../api/services/apiResponse";

export const useUserForm = ({
  mode,
  userId,
  open,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [originalRole, setOriginalRole] = useState("USER");
  const [permissionMap, setPermissionMap] = useState({});
  const isEditMode = mode === "edit";
  const isEditingSelf =
    String(localStorage.getItem("userId") || "") === String(userId || "");

  const fetchModPermissions = useCallback(async (modId) => {
    try {
      const response = await authAxios.get(`/admin/permissions/mod/${modId}`);
      setPermissionMap(unwrapApiData(response, {}));
    } catch {
      setPermissionMap({});
    }
  }, []);

  const fetchUser = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await authAxios.get(`users/${userId}`);
      const userData = response.data.data;
      const role = userData.role || "USER";

      form.setFieldsValue({
        fullName: userData.fullName,
        email: userData.email,
        role,
      });
      setOriginalRole(role);

      if (role === "MOD") {
        fetchModPermissions(userId);
      } else {
        setPermissionMap({});
      }
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể lấy thông tin người dùng."));
      onCancel();
    } finally {
      setLoading(false);
    }
  }, [fetchModPermissions, form, onCancel, userId]);

  useEffect(() => {
    if (!open) return;

    if (isEditMode) {
      fetchUser();
      return;
    }

    form.resetFields();
    form.setFieldsValue({ role: "USER" });
    setLoading(false);
  }, [fetchUser, form, isEditMode, open]);

  const submitRoleUpdate = async (role) => {
    setSubmitting(true);
    try {
      await authAxios.patch(`/admin/permissions/user/${userId}/role`, { role });
      message.success("Cập nhật vai trò thành công.");
      onSuccess();
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể cập nhật vai trò."));
    } finally {
      setSubmitting(false);
    }
  };

  const submit = async (values) => {
    if (!isEditMode) {
      setSubmitting(true);
      try {
        await userApi.create(values);
        message.success("Thêm người dùng thành công!");
        form.resetFields();
        onSuccess();
      } catch (error) {
        message.error(
          getApiErrorMessage(
            error,
            "Không thể thêm người dùng. Vui lòng thử lại."
          )
        );
      } finally {
        setSubmitting(false);
      }
      return;
    }

    const nextRole = values.role;
    const grantedSubjectCount = Object.values(permissionMap).filter(
      (permissions) => permissions?.length
    ).length;

    if (isEditingSelf && nextRole !== originalRole) {
      message.warning("Bạn không thể tự thay đổi vai trò của chính mình.");
      return;
    }

    if (originalRole === "MOD" && nextRole !== "MOD" && grantedSubjectCount > 0) {
      Modal.confirm({
        title: "Thu hồi quyền theo môn?",
        content:
          "Khi tài khoản không còn là MOD, backend sẽ thu hồi toàn bộ quyền theo môn. Nếu chuyển lại MOD, cần cấp quyền lại thủ công.",
        okText: "Cập nhật vai trò",
        cancelText: "Hủy",
        onOk: () => submitRoleUpdate(nextRole),
      });
      return;
    }

    submitRoleUpdate(nextRole);
  };

  const cancel = () => {
    form.resetFields();
    onCancel();
  };

  return {
    form,
    loading,
    submitting,
    originalRole,
    isEditMode,
    isEditingSelf,
    submit,
    cancel,
  };
};
