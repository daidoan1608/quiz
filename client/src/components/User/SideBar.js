import React, { useState } from "react";
import "./Sidebar.css";

const Sidebar = ({ subjects, selectedSubject, onSelectSubject, onSearchChange  }) => {
  const [searchQuery, setSearchQuery] = useState(""); // Từ khóa tìm kiếm

  // Hàm xử lý thay đổi trong ô tìm kiếm
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    onSearchChange(e.target.value); // Gọi hàm từ component cha để lọc danh sách môn học
  };

  return (
    <div className="sidebar">
      <h3>Danh sách môn học</h3>

      {/* Thanh tìm kiếm */}
      <input
        type="text"
        placeholder="Tìm kiếm môn học..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="search-bar"
      />

      <ul>
        {/* Hiển thị danh sách môn học */}
        {subjects.map((subject) => (
          <li key={subject.subjectId}>
            <button
              onClick={() => onSelectSubject(subject.subjectId)}
              className={
                selectedSubject?.subjectId === subject.subjectId
                  ? "selected"
                  : ""
              }
            >
              {subject.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
