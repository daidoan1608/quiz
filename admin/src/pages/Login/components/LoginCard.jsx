import React from "react";
import { Card, theme } from "antd";
import LoginBrand from "./LoginBrand";
import LoginForm from "./LoginForm";
import styles from "../../../styles/pages/Login.module.css";

export default function LoginCard({ loading, onSubmit }) {
  const { token } = theme.useToken();

  return (
    <Card
      bordered={false}
      className={styles.card}
      style={{ background: token.colorBgContainer }}
    >
      <LoginBrand />
      <LoginForm loading={loading} onSubmit={onSubmit} />
    </Card>
  );
}
