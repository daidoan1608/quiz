import React from "react";
import { Typography } from "antd";
import styles from "../../../styles/pages/Login.module.css";

const { Title, Text } = Typography;

export default function LoginBrand() {
  return (
    <div className={styles.brand}>
      <div className={styles.logoMark}>Q</div>
      <Title level={2} className={styles.title}>
        VNUA Quiz
      </Title>
      <Text type="secondary">Đăng nhập hệ thống quản trị</Text>
    </div>
  );
}
