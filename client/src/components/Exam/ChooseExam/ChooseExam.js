import React, { useEffect, useState } from "react";
import { publicAxios } from "../../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import "./ChooseExam.css";
import Sidebar from "../../User/SideBar";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";

export default function ChooseExam() {
  const [subjects, setSubjects] = useState([]); // Tất cả môn học
  const [selectedCategory, setSelectedCategory] = useState(null); // Khoa đã chọn
  const [filteredSubjects, setFilteredSubjects] = useState([]); // Môn học đã lọc
  const [bookmarkedExams, setBookmarkedExams] = useState([]); // Môn học đã bookmark
  const navigate = useNavigate(); // Hook useNavigate

  // Khi component được load, gọi API lấy tất cả môn học
  useEffect(() => {
    getAllSubjects();
  }, []);

  // Lấy danh sách môn học từ API
  const getAllSubjects = async () => {
    try {
      const resp = await publicAxios.get("/public/subjects");
      setSubjects(resp.data.data); // Lưu tất cả môn học vào state
      setFilteredSubjects(resp.data.data); // Hiển thị toàn bộ môn học khi chưa lọc
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
    }
  };

  // Hàm xử lý tìm kiếm môn học
  const handleSearchChange = (query) => {
    setSelectedCategory(null); // Reset khoa đã chọn khi tìm kiếm
    const filtered = subjects.filter((subject) =>
      subject.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredSubjects(filtered); // Cập nhật danh sách môn học đã lọc
  };

  // Hàm xử lý chọn môn thi
  const handleSelectExamBySubjectId = (subjectId) => {
    navigate(`/exams`, { state: { subjectId } }); // Chuyển hướng tới trang danh sách đề thi
  };

  // Hàm xử lý chọn khoa
  const handleSelectCategory = (categoryId) => {
    // Kiểm tra nếu khoa đã được chọn và nhấp lại lần thứ hai
    if (selectedCategory === categoryId) {
      // Nếu khoa đã được chọn, hiển thị lại toàn bộ môn học
      setSelectedCategory(null); // Bỏ chọn khoa
      setFilteredSubjects(subjects); // Hiển thị lại tất cả các môn học
    } else {
      // Lọc danh sách môn học theo khoa đã chọn
      const filtered = subjects.filter(
        (subject) => subject.categoryId === categoryId
      );
      setFilteredSubjects(filtered); // Cập nhật môn học đã lọc theo khoa
      setSelectedCategory(categoryId); // Cập nhật khoa đã chọn
    }
  };

  // Hàm xử lý bookmark môn học
  const handleBookmark = (subjectId) => {
    setBookmarkedExams((prevBookmarks) => {
      // Kiểm tra nếu bài thi đã được bookmark, thì bỏ bookmark
      if (prevBookmarks.includes(subjectId)) {
        return prevBookmarks.filter((id) => id !== subjectId);
      } else {
        // Nếu chưa bookmark, thêm vào danh sách bookmark
        return [...prevBookmarks, subjectId];
      }
    });
  };

  return (
    <div>
      <div className="revision">
        {/* Sidebar */}
        <Sidebar
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          onSearchChange={handleSearchChange} // Truyền hàm tìm kiếm vào Sidebar
        />
        <div className="content">
          <section className="category-re">
            <div className="container-re">
              {filteredSubjects.map((item) => (
                <div className="card-exam" key={item.subjectId}>
                  <div className="bookmark-button">
                    <button
                      className="bookmark-icon"
                      onClick={() => handleBookmark(item.subjectId)}
                    >
                      {/* Hiển thị icon bookmark đầy đủ hoặc chưa đầy đủ */}
                      {bookmarkedExams.includes(item.subjectId) ? (
                        <FaBookmark size={24} color="blue" /> // Icon đã bookmark
                      ) : (
                        <FaRegBookmark size={24} color="gray" /> // Icon chưa bookmark
                      )}
                    </button>
                  </div>
                  <div className="card-img-exam">
                    <div className="card-img">
                      <img alt="Hình bài thi" src="/exam.png"></img>
                    </div>
                  </div>
                  <div className="card-content">
                    <h3>{item.name}</h3>
                    <button
                      className="card-button"
                      onClick={() =>
                        handleSelectExamBySubjectId(item.subjectId) // Chọn môn thi
                      }
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
