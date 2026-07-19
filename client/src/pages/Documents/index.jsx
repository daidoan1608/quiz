import React from 'react';
import { DocumentsView } from './components/DocumentsView';
import { useDocuments } from './hooks/useDocuments';

export default function Documents() {
  const documentsPage = useDocuments();

  return <DocumentsView {...documentsPage} />;
}
