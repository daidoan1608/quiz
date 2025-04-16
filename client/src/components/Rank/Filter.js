import React, { useState, useEffect } from 'react';
import { publicAxios } from '../../api/axiosConfig';

const Filter = ({ onFilter, selectedSubject }) => {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAllSubjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await publicAxios.get('/public/subjects');
      console.log('Dữ liệu nhận được:', resp.data);
      setSubjects(resp.data);
      setFilteredSubjects(resp.data);
    } catch (error) {
      if (error.response) {
        console.error('Lỗi từ server:', error.response.data);
        setError('Không thể tải danh sách môn học. Vui lòng thử lại sau.');
      } else if (error.request) {
        console.error('Không có phản hồi từ server:', error.request);
        setError('Không có phản hồi từ server. Kiểm tra kết nối mạng.');
      } else {
        console.error('Lỗi khác:', error.message);
        setError('Đã xảy ra lỗi: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllSubjects();
  }, []);

  return (
    <div className="filter">
      <label>Lọc theo môn học: </label>
      <select value={selectedSubject} onChange={(e) => onFilter(e.target.value)}>
        <option value="Tất cả">Tất cả</option>
        {isLoading ? (
          <option value="" disabled>
            Đang tải môn học...
          </option>
        ) : error ? (
          <option value="" disabled>
            {error}
          </option>
        ) : subjects.length > 0 ? (
          subjects.map((subject) => (
            <option key={subject.subjectId} value={subject.name}>
              {subject.name}
            </option>
          ))
        ) : (
          <option value="" disabled>
            Không có môn học nào.
          </option>
        )}
      </select>
    </div>
  );
};

export default Filter;