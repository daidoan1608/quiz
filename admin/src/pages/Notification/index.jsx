import React from "react";
import { NotificationView } from "./components/NotificationView";
import { useNotification } from "./hooks/useNotification";

export default function Notification() {
  const notification = useNotification();
  return <NotificationView {...notification} />;
}
