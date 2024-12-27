import React, { useEffect, useState } from "react";
import axiosLocalApi from "../../../api/local-api";
import { useNavigate } from "react-router-dom"; // Dùng useNavigate để điều hướng
import "./ChooseExam.css";
import Headers from "../../Header";
import Footer from "../../Footer";
import Sidebar from "../../User/SideBar"; // Import the Sidebar component
import Headers2 from "../../Headers2";

export default function ChooseExam() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null); // Môn học đã chọn
  const navigate = useNavigate();

  useEffect(() => {
    getAllSubjects();
  }, []);

  const getAllSubjects = async () => {
    try {
      const resp = await axiosLocalApi.get("/public/subjects");
      console.log("Dữ liệu nhận được:", resp.data);
      setSubjects(resp.data); // Lưu danh sách môn học
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
    }
  };

  // Hàm chọn môn học
  const handleSelectSubject = (subjectId) => {
    const selected = subjects.find((subject) => subject.subjectId === subjectId
);
    setSelectedSubject(selected); // Cập nhật môn học đã chọn

    // Điều hướng đến trang ExamUsers và truyền subjectId trong URL
    // navigate(`/exams`);
  };
  const handleSelectExamBySubjectId = (subjectId) => {
    navigate(`/exams`, { state: { subjectId } });
  }

  return (
    <div>
      {/* <Headers /> */}
      <Headers2 />
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
                <div className="card-exam">
                  <div className='card-img-exam'>
                      <div className='card-img-ex'>
                      <img src='/exam.png'></img>
                      </div>
                  </div>
                  <div className='card-two-exam'>
                    <div className="card-content-exam">
                      <h3>{selectedSubject.name}</h3>
                    </div>
                    <div className='card-button-ex'>
                      <button
                        className="card-button-exam"
                        onClick={() => 
                          handleSelectExamBySubjectId(selectedSubject.subjectId)
                        }
                      >
                        Chọn đề 
                        </button>
                      </div>
                  </div>
                </div>
              ) : (
                <div className="subject-list">
                  {subjects.map((item) => (
                    <div className="card-exam" key={item.subjectId}>
                      <div className='card-img-exam'>
                        <div className='card-img'>
                        <img src='/exam.png'></img>
                        </div>
                      </div>
                      <div className='card-two-exam'>
                        <div className="card-content-exam">
                          <h3>{item.name}</h3> {/* Display subject name */}
                        </div>
                        <div className='card-button-ex'>
                          <button
                            className="card-button-exam"
                            onClick={() => handleSelectExamBySubjectId(item.subjectId)} // Chọn môn học
                          >
                            Chọn đề
                          </button>
                        </div>
                      </div>
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
