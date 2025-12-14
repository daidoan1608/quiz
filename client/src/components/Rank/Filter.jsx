import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import { publicAxios } from '../../api/axiosConfig';
import { useLanguage } from '../Context/LanguageProvider';
import subjectTranslations from '../../Languages/subjectTranslations';

const { Option } = Select;

const Filter = ({ onFilter, selectedSubject }) => {
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { texts, language } = useLanguage();

  const getAllSubjects = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const resp = await publicAxios.get('/public/subjects');
      console.log('Subjects from API:', resp.data);
      const subjectList = resp.data?.data || [];
      setSubjects(subjectList);
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setError(texts.errorFetchingSubjects || 'Lỗi tải môn học');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllSubjects();
  }, []);

  return (
    <div className="filter" style={{ marginBottom: 16 }}>
      <label htmlFor="subject-select" style={{ marginRight: 8 }}>
        {texts.filter}:
      </label>
      <Select
        id="subject-select"
        value={selectedSubject}
        onChange={onFilter}
        loading={isLoading}
        style={{ width: 250 }}
        placeholder={texts.selectSubject || 'Chọn môn học'}
        allowClear
      >
        <Option key="all" value="Tất cả">
          {texts.all}
        </Option>
        {subjects.map((subject) => {
          const translatedName =
            subjectTranslations?.[subject.name]?.[language] || subject.name;
          return (
            <Option key={subject.subjectId} value={subject.name}>
              {translatedName}
            </Option>
          );
        })}
      </Select>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  );
};

export default Filter;