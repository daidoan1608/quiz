import React, { useEffect, useState } from "react";
import { publicAxios } from "../../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import "./ChooseExam.css";
import Sidebar from "../../User/SideBar";
import { useLanguage } from "../../Context/LanguageProvider";
import subjectTranslations from "../../../Languages/subjectTranslations";

export default function ChooseExam() {
  const [subjects, setSubjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { texts, language } = useLanguage(); // lấy ngôn ngữ hiện tại

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

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedCategory(null);

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
        {/* Sidebar */}
        <Sidebar
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          onSearchChange={handleSearchChange} // Truyền hàm tìm kiếm vào Sidebar
        />
        <div className="content">
          <input
            type="text"
            placeholder={texts.placeholder}
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-bar"
          />
          <section className="category-re">
            <div className="container-re">
              {filteredSubjects.map((item) => {
                const translatedName =
                  subjectTranslations[item.name]?.[language] || item.name;

                return (
                  <div className="card-exam" key={item.subjectId}>
                    <div className="card-img-exam">
                      <div className="card-img">
                        <img alt="Hình bài thi" src="/exam.png" />
                      </div>
                    </div>
                    <div className="card-content">
                      <h3>{translatedName}</h3>
                      <button
                        className="card-button"
                        onClick={() => handleSelectExamBySubjectId(item.subjectId)}
                      >
                        {texts.chooseTopic}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
