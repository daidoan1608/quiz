import React, { useEffect, useState } from "react";
import { useFavorites } from "../../Context/FavoritesContext";
import { useNavigate } from "react-router-dom";
import subjectTranslations from "../../../Languages/subjectTranslations";
import Sidebar from "../../User/SideBar";
import { useLanguage } from "../../Context/LanguageProvider";
import { publicAxios } from "../../../api/axiosConfig";
import "./RevisionUser.css";
import { Row, Col, Pagination } from "antd";

export default function RevisionUser() {
  const { favorites, toggleFavorite } = useFavorites();
  const [subjects, setSubjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { texts, language } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [sidebarOpen, setSidebarOpen] = useState(false);


  // Hàm toggle sidebar cho màn hình nhỏ
  // const toggleSidebar = () => {
  //   setIsSidebarOpen((prev) => !prev);
  // };

  useEffect(() => {
    const getAllSubjects = async () => {
      try {
        const resp = await publicAxios.get("/public/subjects");
        setSubjects(resp.data.data || []);
        setFilteredSubjects(resp.data.data || []);
      } catch (error) {
        setSubjects([]);
        setFilteredSubjects([]);
      }
    };

    getAllSubjects();
  }, []);

  useEffect(() => {
    let filtered = subjects;
    // Bộ lọc dựa và danh mục hoặc tìm kiếm
    if (selectedCategory) {
      filtered = filtered.filter((subj) => subj.categoryId === selectedCategory);
    } else if (searchQuery.trim()) {
      filtered = filtered.filter((subject) =>
        subject.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredSubjects(filtered);
    setCurrentPage(1); // Reset về trang đầu sau khi lọc
  }, [selectedCategory, searchQuery, subjects]);

  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setSearchQuery("");
  };

  const paginatedSubjects = filteredSubjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setSelectedCategory(null);
  };

  return (
    <div className="container-fluid px-2 px-sm-3 px-md-4">
      <div className="row">
        {/* Nút mở sidebar - chỉ hiện trên mobile */}
        <div className="col-12 d-lg-none">
          <button
            className="btn btn-outline-secondary mb-3 responsive-button"
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
          className={`position-fixed top-0 start-0 bg-light h-100 p-3 shadow d-lg-none ${
            sidebarOpen ? "d-block" : "d-none"
          }`}
          style={{ width: "80%", maxWidth: "300px", zIndex: 1050 }}
        >
          <button
            className="btn btn-sm btn-danger mb-3 responsive-button"
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
            placeholder={texts.placeholder || "Tìm kiếm môn học..."}
            value={searchQuery}
            onChange={handleSearchChange}
            className="form-control mb-3 responsive-input"
          />

          <section className="category-re">
            <div className="container">
              <Row gutter={[16, 16]} justify="center">
                {paginatedSubjects.length > 0 ? (
                  paginatedSubjects.map((item) => {
                    const translatedName =
                      subjectTranslations[item.name]?.[language] || item.name;
                    const isFavorited = favorites.some(
                      (fav) => fav.subjectId === item.subjectId
                    );

                    return (
                      <Col xs={24} sm={24} md={12} lg={12} key={item.subjectId}> 
                        <div className="card h-100 shadow-sm">
                          <div className="card-body d-flex justify-content-between align-items-center flex-wrap">
                            <h5 className="card-title auto-fit-text">
                              {translatedName}
                            </h5>
                            <div className="responsive-action-group">
                              <button
                                className="btn btn-primary responsive-button"
                                onClick={() =>
                                  navigate(`/listChap`, {
                                    state: { subjectId: item.subjectId },
                                  })
                                }
                              >
                                {texts.chooseChapter || "Chọn chương"}
                              </button>
                              <button
                                className={`favorite-icon-button ${
                                  isFavorited ? "favorited" : ""
                                }`}
                                onClick={() =>
                                  toggleFavorite(item.subjectId, item.name)
                                }
                                disabled={!localStorage.getItem("userId")}
                                aria-label={
                                  isFavorited ? "Bỏ yêu thích" : "Thêm yêu thích"
                                }
                              >
                                <i
                                  className={`fa-heart ${
                                    isFavorited ? "fa-solid" : "fa-regular"
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
                  <p className="responsive-text">
                    {texts.noSubjects || "Không tìm thấy môn học nào."}
                  </p>
                )}
             </Row>

              {/* Pagination */}
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