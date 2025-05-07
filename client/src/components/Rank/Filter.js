import React, { useState, useEffect } from 'react';
import { Select, Spin } from 'antd';
import { publicAxios } from '../../api/axiosConfig';
import './Filter.css'


const { Option } = Select;

const Filter = ({ onFilter, selectedSubject }) => {
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAllSubjects = async () => {
    setIsLoading(true);
    try {
      const resp = await publicAxios.get('public/subjects');
      setSubjects(resp.data.data || []);
    } catch (err) {
      setError('Lỗi tải môn học');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllSubjects();
  }, []);

  return (
    <div className="filter" style={{ marginBottom: 16 }}>
      <label style={{ marginRight: 8 }}>Lọc theo môn học: </label>
      <Select
        value={selectedSubject}
        onChange={onFilter}
        loading={isLoading}
        style={{ width: 250 }}
        placeholder="Chọn môn học"
      >
        <Option value="Tất cả">Tất cả</Option>
        {subjects.map((subject) => (
          <Option key={subject.subjectId} value={subject.name}>
            {subject.name}
          </Option>
        ))}
      </Select>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  );
};

export default Filter;
