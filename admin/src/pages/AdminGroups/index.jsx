import React from "react";
import { AdminGroupsView } from "./components/AdminGroupsView";
import { useAdminGroups } from "./hooks/useAdminGroups";

export default function AdminGroups() {
  const adminGroups = useAdminGroups();
  return <AdminGroupsView {...adminGroups} />;
}
