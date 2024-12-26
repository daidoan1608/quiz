import React from "react";
import "./SideBar.css"; // Ensure this path is correct

const Sidebar = ({ subjects, selectedSubject, onSelectSubject }) => {
  return (
    <div className="sidebar">
      <h3>Danh sách môn học</h3>
      <ul>
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
