import { useEffect, useMemo, useState } from 'react';
import { documentApi } from 'api/services/documentApi';
import { formatFileSize } from '../utils/documentFormatters';

export const useDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    documentApi
      .getAll()
      .then((items) => {
        if (active) setDocuments(Array.isArray(items) ? items : []);
      })
      .catch(() => {
        if (active) {
          setError('Không thể tải danh sách tài liệu. Vui lòng thử lại sau.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const totalSize = documents.reduce(
      (sum, item) => sum + (item.fileSize || 0),
      0
    );
    return { count: documents.length, totalSize: formatFileSize(totalSize) };
  }, [documents]);

  return {
    documents,
    error,
    loading,
    stats,
  };
};
