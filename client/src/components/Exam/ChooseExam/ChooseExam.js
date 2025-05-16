import React, { useEffect, useState } from "react";
import { publicAxios } from "../../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import "./ChooseExam.css";
import Sidebar from "../../User/SideBar";

export default function ChooseExam() {
  const [subjects, setSubjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getAllSubjects();
  }, []);

  const getAllSubjects = async () => {
    try {
      const resp = await publicAxios.get("/public/subjects");
      setSubjects(resp.data.data);
      setFilteredSubjects(resp.data.data);
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedCategory(null);

    const filtered = subjects.filter((subject) =>
      subject.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredSubjects(filtered);
  };

  const handleSelectExamBySubjectId = (subjectId) => {
    navigate(`/exams`, { state: { subjectId } });
  };

  const handleSelectCategory = (categoryId) => {
    const filtered = subjects.filter(
      (subject) => subject.categoryId === categoryId
    );
    setFilteredSubjects(filtered);
    setSelectedCategory(categoryId);
    setSearchQuery(""); // Xoá từ khóa tìm kiếm khi chọn danh mục
  };

  return (
    <div>
      <div className="revision">
        <Sidebar
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          onSearchChange={handleSearchChange}
        />
        <div className="content">
          <input
            type="text"
            placeholder="Tìm kiếm môn học..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-bar"
          />
          <section className="category-re">
            <div className="container-re">
              {filteredSubjects.map((item) => (
                <div className="card-exam" key={item.subjectId}>
                  <div className="card-img-exam">
                    <div className="card-img">
                      <img alt="Hình bài thi" src="/exam.png" />
                    </div>
                  </div>
                  <div className="card-content">
                    <h3>{item.name}</h3>
                    <button
                      className="card-button"
                      onClick={() => handleSelectExamBySubjectId(item.subjectId)}
                    >
                      Chọn đề
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
