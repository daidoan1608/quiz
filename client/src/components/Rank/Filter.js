import React, { useState, useEffect } from 'react';
import { publicAxios } from '../../api/axiosConfig';

const Filter = ({ onFilter, selectedSubject }) => {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAllSubjects = async () => {
      const resp = await publicAxios.get("public/subjects");
      console.log(resp.data.data);
      setSubjects(resp.data.data);
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