import React from "react";
import { AuditLogView } from "./components/AuditLogView";
import { useAuditLog } from "./hooks/useAuditLog";

export default function AuditLog() {
  const auditLog = useAuditLog();
  return <AuditLogView {...auditLog} />;
}
