import React from "react";
import { DocumentsManagerView } from "./components/DocumentsManagerView";
import { useDocumentsManager } from "./hooks/useDocumentsManager";

export default function DocumentsManager() {
  const documentsManager = useDocumentsManager();
  return <DocumentsManagerView {...documentsManager} />;
}
