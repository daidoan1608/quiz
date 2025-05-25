import React, { useEffect, useState } from "react";
import { useFavorites } from "../../Context/FavoritesContext";
import { useNavigate } from "react-router-dom";
import subjectTranslations from "../../../Languages/subjectTranslations";
import Sidebar from "../../User/SideBar";
import { useLanguage } from "../../Context/LanguageProvider";
import { publicAxios } from "../../../api/axiosConfig";
import "./RevisionUser.css";

export default function RevisionUser() {
  const { favorites, toggleFavorite } = useFavorites();
  const [subjects, setSubjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { texts, language } = useLanguage();

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
    // Bộ lọc dựa vào danh mục hoặc tìm kiếm
    if (selectedCategory) {
      setFilteredSubjects(subjects.filter((subj) => subj.categoryId === selectedCategory));
    } else if (searchQuery.trim()) {
      setFilteredSubjects(
        subjects.filter((subject) =>
          subject.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredSubjects(subjects);
    }
  }, [selectedCategory, searchQuery, subjects]);

  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setSearchQuery("");
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setSelectedCategory(null);
  };

  return (
    // <div>
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
            placeholder={texts.placeholder || "Tìm kiếm môn học..."}
            value={searchQuery}
            onChange={handleSearchChange}
            className="form-control mb-3"
          />

          <section className="category-re">
            <div className="container">
              <div className="row justify-content-center">
                {filteredSubjects.length > 0 ? (
                  filteredSubjects.map((item) => {
                    const translatedName =
                      subjectTranslations[item.name]?.[language] || item.name;
                    const isFavorited = favorites.some((fav) => fav.subjectId === item.subjectId);

                    return (
                      <div className="col-lg-8 col-md-10 col-sm-12 mb-4" key={item.subjectId}>
                        <div className="card h-100 shadow-sm">
                          <div className="card-body d-flex justify-content-between align-items-center flex-wrap">
                            <h5 className="card-title mb-2 mb-md-0 flex-grow-1 text-truncate">
                              {translatedName}
                            </h5>
                            <div className="d-flex flex-wrap gap-2">
                              <button
                                className="btn btn-primary"
                                onClick={() =>
                                  navigate(`/listChap`, { state: { subjectId: item.subjectId } })
                                }
                              >
                                {texts.chooseChapter || "Chọn chương"}
                              </button>
                              <button
                                className={`btn ${isFavorited ? "btn-danger" : "btn-outline-danger"}`}
                                onClick={() => toggleFavorite(item.subjectId, item.name)}
                                disabled={!localStorage.getItem("userId")}
                                aria-label={isFavorited ? "Bỏ yêu thích" : "Thêm yêu thích"}
                              >
                                <i className={`fa-heart ${isFavorited ? "fa-solid" : "fa-regular"}`}></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p>{texts.noSubjects || "Không tìm thấy môn học nào."}</p>
                )}
              </div>
            </div>
          </section>


        </div>
      </div>
    </div>

    // </div >
  );
}
