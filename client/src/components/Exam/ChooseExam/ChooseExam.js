import React, { useEffect, useState } from "react";
import { publicAxios } from "../../../api/axiosConfig";
import { useNavigate } from "react-router-dom"; // Dùng useNavigate để điều hướng
import "./ChooseExam.css";
import Sidebar from "../../User/Sidebar"; // Import the Sidebar component

export default function ChooseExam() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null); // Môn học đã chọn
    const [filteredSubjects, setFilteredSubjects] = useState([]); // Môn học đã lọc

  const navigate = useNavigate();

  useEffect(() => {
    getAllSubjects();
  }, []);

  const getAllSubjects = async () => {
    try {
      const resp = await publicAxios.get("/public/subjects");
      console.log("Dữ liệu nhận được:", resp.data);
      setSubjects(resp.data); // Lưu danh sách môn học
      setFilteredSubjects(resp.data); // Cập nhật môn học đã lọc ban đầu
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
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
      <div className="revision">
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
              {/* Hiển thị thông tin môn học đã chọn */}
              {selectedSubject ? (
                <div className="card-exam" key={selectedSubject.subjectId}>
                  <div className='card-img-exam'>
                      <div className='card-img-ex'>
                      <img alt="Hình bài thi" src='/exam.png'></img>
                      </div>
                  </div>
                  <div className="card-content">
                    <h3>{selectedSubject.name}</h3>
                    <button
                      className="card-button"
                      onClick={() => 
                        handleSelectExamBySubjectId(selectedSubject.subjectId)
                      }
                    >
                      Chọn đề 
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {filteredSubjects.map((item) => (
                    <div className="card-exam" key={item.subjectId}>
                      <div className='card-img-exam'>
                        <div className='card-img'>
                        <img alt="Hình bài thi" src='/exam.png'></img>
                        </div>
                      </div>
                      <div className="card-content">
                        <h3>{item.name}</h3> {/* Display subject name */}
                        <button
                        className="card-button"
                        onClick={() => handleSelectExamBySubjectId(item.subjectId)} // Chọn môn học
                      >
                        Chọn đề
                      </button>
                      </div>
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
