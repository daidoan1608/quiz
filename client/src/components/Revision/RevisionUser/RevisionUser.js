import React, { useEffect, useState } from "react";
import { publicAxios } from "../../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import "./RevisionUser.css";
import Sidebar from "../../User/Sidebar";

export default function RevisionUser() {
  const [subjects, setSubjects] = useState([]); // Store subject data
  const [selectedSubject, setSelectedSubject] = useState(null); // Store selected subject
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
      console.log("Dữ liệu nhận được:", resp.data);
      setSubjects(resp.data); // Store data in state
      setFilteredSubjects(resp.data); // Cập nhật môn học đã lọc ban đầu
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

      setSelectedSubject(null);

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
  const handleSelectSubject = (subjectId) => {
    const selected = subjects.find(
      (subject) => subject.subjectId === subjectId
    );
    setSelectedSubject(selected);
  };

  return (
    <div>
      <div className="revision">
        {/* Sidebar */}
        <Sidebar
          subjects={subjects}
          selectedSubject={selectedSubject}
          onSelectSubject={handleSelectSubject}
          onSearchChange={handleSearchChange}  // Truyền hàm tìm kiếm vào Sidebar

        />

        {/* Main Content */}
        <div className="content">
          <section className="category-re">
            <div className="container-re">
              {/* Display details of selected subject */}
              {selectedSubject ? (
                <div className="card">
                  <div className="card-content" key={selectedSubject.subjectId}>
                    <h3>{selectedSubject.name}</h3>
                  </div>
                  <button
                    className="card-button"
                    onClick={() =>
                      // navigate(`/subject/${selectedSubject.subjectId}`)
                      handleSelectChapters(selectedSubject.subjectId)
                    }
                  >
                    Chọn chương
                  </button>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
