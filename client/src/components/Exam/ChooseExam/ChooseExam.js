import React, { useEffect, useState } from "react";
import { publicAxios } from "../../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import "./ChooseExam.css";
import Sidebar from "../../User/SideBar";
import { useLanguage } from "../../Context/LanguageProvider";
import subjectTranslations from "../../../Languages/subjectTranslations";
import { useFavorites } from "../../Context/FavoritesContext"; // Thêm import useFavorites

export default function ChooseExam() {
  const [subjects, setSubjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { texts, language } = useLanguage(); // lấy ngôn ngữ hiện tại

  const [sidebarOpen, setSidebarOpen] = useState(false);


  const { favorites, toggleFavorite } = useFavorites();
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

  // Kiểm tra môn học có được yêu thích chưa
  const isFavorited = (subjectId) => {
    return favorites.some((fav) => fav.subjectId === subjectId);
  };
  return (
    <div className="container-fluid">
      <div className="row">
        {/* Nút mở sidebar - chỉ hiện trên mobile */}
        <div className="col-12 d-lg-none">
          <button
            className="btn btn-outline-secondary mb-3"
            onClick={() => setSidebarOpen(true)}
          >
            📚 Danh sách khoa
          </button>
        </div>

        {/* Overlay đen khi mở sidebar mobile */}
        {sidebarOpen && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
            style={{ zIndex: 1040 }}
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar kiểu off-canvas trên mobile */}
        <div
          className={`position-fixed top-0 start-0 bg-light h-100 p-3 shadow d-lg-none ${sidebarOpen ? "d-block" : "d-none"
            }`}
          style={{ width: "80%", maxWidth: "300px", zIndex: 1050 }}
        >
          <button
            className="btn btn-sm btn-danger mb-3"
            onClick={() => setSidebarOpen(false)}
          >
            ✕ Đóng
          </button>
          <Sidebar
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            onSearchChange={handleSearchChange}
          />
        </div>

        {/* Sidebar cố định trên desktop */}
        <div className="col-lg-3 d-none d-lg-block">
          <div className="bg-light p-3 h-100">
            <Sidebar
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              onSearchChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Content chiếm phần còn lại */}
        <div className="col-lg-9 col-md-8 col-12">
          <input
            type="text"
            placeholder={texts.placeholder}
            value={searchQuery}
            onChange={handleSearchChange}
            // className="search-bar"
            className="form-control mb-3"
          />
          <section className="category-re">
            <div className="container-re">
              <div className="row justify-content-center">
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
                        {/* <h3 className="responsive-exam-title">{translatedName}</h3> */}

                        <div className="card-buttons-row">
                          <button
                            className="card-button"
                            onClick={() =>
                              handleSelectExamBySubjectId(item.subjectId)
                            }
                          >
                            {texts.chooseTopic}
                          </button>
                          <button
                            className={`favorites-button ${isFavorited(item.subjectId) ? "favorited" : ""
                              }`}
                            onClick={() =>
                              toggleFavorite(item.subjectId, item.name)
                            }
                            disabled={!localStorage.getItem("userId")}
                            aria-label={
                              isFavorited(item.subjectId)
                                ? "Bỏ yêu thích"
                                : "Thêm yêu thích"
                            }
                          >
                            <i
                              className={`fa-heart ${isFavorited(item.subjectId)
                                ? "fa-solid"
                                : "fa-regular"
                                }`}
                            ></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

