import React, { useEffect, useState } from "react";
import { publicAxios } from "../../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import "./RevisionUser.css";
import Sidebar from "../../User/SideBar";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";

export default function RevisionUser() {
  const [subjects, setSubjects] = useState([]); // Store subject data
  const [selectedCategory, setSelectedCategory] = useState(null); // Store selected category
  const [filteredSubjects, setFilteredSubjects] = useState([]); // Môn học đã lọc
  const navigate = useNavigate(); // Initialize useNavigate
  const [bookmarkedExams, setBookmarkedExams] = useState([]);

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
    setSelectedCategory(null); // Reset selected category khi tìm kiếm
    const filtered = subjects.filter((subject) =>
      subject.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredSubjects(filtered); // Cập nhật danh sách môn học đã lọc
  };

  // Hàm xử lý bookmark
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

  // Handle selecting chapters
  const handleSelectChapters = (subjectId) => {
    navigate(`/listChap`, { state: { subjectId } });
  };

  // Handle selecting a subject in sidebar
  const handleSelectCategory = (categoryId) => {
    // Nếu khoa đã được chọn và nhấp lại lần thứ hai
    if (selectedCategory === categoryId) {
      setSelectedCategory(null); // Bỏ chọn khoa
      setFilteredSubjects(subjects); // Hiển thị lại toàn bộ danh sách môn học
    } else {
      // Lọc danh sách theo category được chọn
      const filtered = subjects.filter(
        (subject) => subject.categoryId === categoryId
      );
      setFilteredSubjects(filtered); // Cập nhật môn học đã lọc theo khoa
      setSelectedCategory(categoryId); // Cập nhật khoa được chọn
    }
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

        {/* Main Content */}
        <div className="content">
          <section className="category-re">
            <div className="container-re">
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((item) => (
                  <div className="card" key={item.subjectId}>
                    <div className="bookmark-button">
                      <button
                        className="bookmark-icon"
                        onClick={() => handleBookmark(item.subjectId)}
                      >
                        {/* Hiển thị icon bookmark đầy đủ hoặc chưa đầy đủ */}
                        {bookmarkedExams.includes(item.subjectId) ? (
                          <FaBookmark size={24} color="blue" /> // Icon đầy đủ (được bookmark)
                        ) : (
                          <FaRegBookmark size={24} color="gray" /> // Icon chưa đầy đủ (chưa bookmark)
                        )}
                      </button>
                    </div>
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
                ))
              ) : (
                <p>Không có môn học nào.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
