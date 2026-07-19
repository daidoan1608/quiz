import React from "react";
import LoginCard from "./components/LoginCard";
import { useAdminLogin } from "./hooks/useAdminLogin";
import styles from "../../styles/pages/Login.module.css";

function Login() {
  const { loading, submitLogin } = useAdminLogin();

  return (
    <div className={styles.page}>
      <LoginCard loading={loading} onSubmit={submitLogin} />
    </div>
  );
}

export default Login;
