import React, { useEffect, useState } from "react";
import { publicAxios } from "../../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import "./RevisionUser.css";
import Sidebar from "../../User/SideBar";

export default function RevisionUser() {
  const [subjects, setSubjects] = useState([]); // Store subject data
  const [selectedCategory, setSelectedCategory] = useState(); // Store selected subject
  const [filteredSubjects, setFilteredSubjects] = useState([]); // Môn học đã lọc
  const navigate = useNavigate(); // Initialize useNavigate

  // Initial loading
  useEffect(() => {
    getAllSubjects();
  }, []);

  // API call to get subjects
  const getAllSubjects = async () => {
    try {
      const resp = await publicAxios.get("/public/subjects"); // Call API to fetch subjects
      setSubjects(resp.data.data); // Store data in state
      setFilteredSubjects(resp.data.data); // Cập nhật môn học đã lọc ban đầu
    } catch (error) {
      if (error.response) {
        console.error("Lỗi từ server:", error.response.data);
      } else if (error.request) {
        console.error("Không có phản hồi từ server:", error.request);
      } else {
        console.error("Lỗi khác:", error.message);
      }
    }
  };

    // Hàm xử lý tìm kiếm
    const handleSearchChange = (query) => {

      setSelectedCategory(null);

      const filtered = subjects.filter((subject) =>
        subject.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSubjects(filtered); // Cập nhật danh sách môn học đã lọc
    };

  // Handle selecting chapters
  const handleSelectChapters = (subjectId) => {
    navigate(`/listChap`, { state: { subjectId } });
  };

  // Handle selecting a subject in sidebar
  const handleSelectCategory = (categoryId) => {
    const filtered = subjects.filter(
      (subject) => subject.categoryId === categoryId
    );
    setFilteredSubjects(filtered);
    setSelectedCategory(categoryId);
    };

  return (
    <div>
      <div className="revision">
        {/* Sidebar */}
        <Sidebar
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          onSearchChange={handleSearchChange}  // Truyền hàm tìm kiếm vào Sidebar
        />

        {/* Main Content */}
        <div className="content">
          <section className="category-re">
            <div className="container-re">
                  {filteredSubjects.map((item)=> (
                    <div className="card" key={item.subjectId}>
                      <div className="card-content">
                        <h3>{item.name}</h3> {/* Display subject name */}
                      </div>
                      <button
                        className="card-button"
                        onClick={() => handleSelectChapters(item.subjectId)} // Navigate to chapters of the subject
                      >
                        Chọn chương
                      </button>
                    </div>
                  ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
