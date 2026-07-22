import React from "react";
import MainBackButton from "../MainBackButton";
import AdminPageHeader from "./AdminPageHeader";

export default function AdminFormPageLayout({
  actions,
  children,
  onBack,
  subtitle,
  title,
}) {
  return (
    <div className="admin-form-page">
      <MainBackButton onClick={onBack} />
      <AdminPageHeader
        actions={actions}
        className="admin-page-header--form"
        subtitle={subtitle}
        title={title}
      />
      {children}
    </div>
  );
}
