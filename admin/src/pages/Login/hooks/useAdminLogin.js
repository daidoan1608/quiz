import { useState } from "react";
import { message } from "antd";
import { getApiErrorMessage, publicAxios } from "../../../api/axiosConfig";
import { useAuth } from "../../../context/AuthProvider";
import { ADMIN_ALLOWED_ROLES, LOGIN_MESSAGES } from "../constants";

const logoutSilently = () => publicAxios.post("/auth/logout").catch(() => {});

export const useAdminLogin = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const submitLogin = async (values) => {
    setLoading(true);
    try {
      await logoutSilently();
      const response = await publicAxios.post("/auth/login", {
        username: values.username,
        password: values.password,
      });

      const authUser = response.data.data;
      const { role } = authUser;

      if (!ADMIN_ALLOWED_ROLES.includes(role)) {
        await logoutSilently();
        message.error(LOGIN_MESSAGES.unauthorized);
        return;
      }

      login({ ...authUser, username: authUser.username || values.username });
      message.success(LOGIN_MESSAGES.success);
    } catch (error) {
      message.error(getApiErrorMessage(error, LOGIN_MESSAGES.failure));
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    submitLogin,
  };
};
