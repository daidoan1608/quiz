import React, { useEffect, useState } from "react";
import { publicAxios } from "../../../api/axiosConfig";
import { useNavigate } from "react-router-dom"; // Dùng useNavigate để điều hướng
import "./ChooseExam.css";
import Headers from "../../Header";
import Footer from "../../Footer";
import Sidebar from "../../User/SideBar"; // Import the Sidebar component

export default function ChooseExam() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null); // Môn học đã chọn
  const navigate = useNavigate();

  useEffect(() => {
    getAllSubjects();
  }, []);

  const getAllSubjects = async () => {
    try {
      const resp = await publicAxios.get("/public/subjects");
      console.log("Dữ liệu nhận được:", resp.data);
      setSubjects(resp.data); // Lưu danh sách môn học
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
    }
  };

  // Hàm chọn môn học
  const handleSelectSubject = (subjectId) => {
    const selected = subjects.find(
      (subject) => subject.subjectId === subjectId
    );
    setSelectedSubject(selected); // Cập nhật môn học đã chọn
  };
  const handleSelectExamBySubjectId = (subjectId) => {
    navigate(`/exams`, { state: { subjectId } });
  };

  return (
    <div>
      <Headers />
      <div className="revision">
        {/* Sidebar */}
        <Sidebar
          subjects={subjects}
          selectedSubject={selectedSubject}
          onSelectSubject={handleSelectSubject}
        />

        {/* Main Content */}
        <div className="content">
          <section className="category-re">
            <div className="container-re">
              {/* Hiển thị thông tin môn học đã chọn */}
              {selectedSubject ? (
                <div className="card">
                  <div className="card-time">
                    <p>8/12/2024</p>
                  </div>
                  <div className="card-content">
                    <h2>{selectedSubject.name}</h2>
                  </div>
                  <button
                    className="card-button"
                    onClick={() =>
                      handleSelectExamBySubjectId(selectedSubject.subjectId)
                    }
                  >
                    Chọn đề
                  </button>
                </div>
              ) : (
                <div className="subject-list">
                  {subjects.map((item) => (
                    <div className="card" key={item.subjectId}>
                      <div className="card-time">
                        <p>8/12/2024</p>
                      </div>
                      <div className="card-content">
                        <h3>{item.name}</h3> {/* Display subject name */}
                      </div>
                      <button
                        className="card-button"
                        onClick={() =>
                          handleSelectExamBySubjectId(item.subjectId)
                        } // Chọn môn học
                      >
                        Chọn đề
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
