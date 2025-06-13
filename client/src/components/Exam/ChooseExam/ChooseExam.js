import React, { useEffect, useState } from "react";
import { publicAxios } from "../../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import "./ChooseExam.css";
import Sidebar from "../../User/SideBar";
import { useLanguage } from "../../Context/LanguageProvider";
import subjectTranslations from "../../../Languages/subjectTranslations";
import { useFavorites } from "../../Context/FavoritesContext";
import { Row, Col, Pagination } from "antd"; // 💡 Thêm AntD Grid + Pagination

export default function ChooseExam() {
  const [subjects, setSubjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { texts, language } = useLanguage();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { favorites, toggleFavorite } = useFavorites();


  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

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
    setCurrentPage(1); // reset phân trang khi lọc
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
    setSearchQuery("");
    setCurrentPage(1); // reset phân trang khi lọc
  };

  const isFavorited = (subjectId) => {
    return favorites.some((fav) => fav.subjectId === subjectId);
  };

  const paginatedSubjects = filteredSubjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar toggle - mobile */}
        <div className="col-12 d-lg-none">
          <button
            className="btn btn-outline-secondary mb-3"
            onClick={() => setSidebarOpen(true)}
          >
            📚 Danh sách khoa
          </button>
        </div>


        {/* Sidebar overlay - mobile */}
        {sidebarOpen && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
            style={{ zIndex: 1040 }}
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        <div
          className={`position-fixed top-0 start-0 bg-light h-100 p-3 shadow d-lg-none ${sidebarOpen ? "d-block" : "d-none"}`}
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

        {/* Sidebar - desktop */}
        <div className="col-lg-3 col-md-12 d-none d-lg-block">
          {/*         <div className="col-lg-3 d-none d-lg-block">
 */}
          <div className="bg-light p-3 h-100">
            <Sidebar
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              onSearchChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="col-lg-9 col-md-12">
          {/*         <div className="col-lg-9 col-md-8 col-12">
 */}
          <input
            type="text"
            placeholder={texts.placeholder || "Tìm kiếm môn học..."}
            value={searchQuery}
            onChange={handleSearchChange}
            className="form-control mb-3"
          />

          <section className="category-re">
            <div className="container-re">
              <Row gutter={[16, 16]}>
                {paginatedSubjects.length > 0 ? (
                  paginatedSubjects.map((item) => {
                    const translatedName =
                      subjectTranslations[item.name]?.[language] || item.name;

                    return (
                      <Col xs={24} sm={24} md={12} lg={12} key={item.subjectId}>
                        <div className="card-exam h-100">
                          <div className="card-img-exam">
                            <div className="card-img">
                              <img alt="Hình bài thi" src="/exam.png" />
                            </div>
                          </div>
                          <div className="card-content">
                            <h3>{translatedName}</h3>
                            <div className="card-buttons-row">
                              <button
                                className="card-button"
                                onClick={() =>
                                  handleSelectExamBySubjectId(item.subjectId)
                                }
                              >
                                {texts.chooseTopic || "Chọn đề"}
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
                      </Col>
                    );
                  })
                ) : (
                  <Col span={24}>
                    <p className="responsive-text">
                      {texts.noSubjects || "Không tìm thấy môn học nào."}
                    </p>
                  </Col>
                )}
              </Row>

              {/* Phân trang */}
              {filteredSubjects.length > pageSize && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredSubjects.length}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                  />
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
