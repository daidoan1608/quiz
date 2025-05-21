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
    <div>
      <div className="revision">
        <Sidebar
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          onSearchChange={handleSearchChange}
        />

        <div className="content">
          <input
            type="text"
            placeholder={texts.placeholder || "Tìm kiếm môn học..."}
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-bar"
          />

          <section className="category-re">
            <div className="container-re">
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((item) => {
                  const translatedName =
                    subjectTranslations[item.name]?.[language] || item.name;
                  const isFavorited = favorites.some((fav) => fav.subjectId === item.subjectId);

                  return (
                    <div className="card" key={item.subjectId}>
                      <div className="card-content">
                        <h3>{translatedName}</h3>
                      </div>
                      <div className="card-actions">
                        <button
                          className="card-button-list"
                          onClick={() =>
                            navigate(`/listChap`, { state: { subjectId: item.subjectId } })
                          }
                        >
                          {texts.chooseChapter || "Chọn chương"}
                        </button>
                        <button
                          className={`favorites-button ${isFavorited ? "favorited" : ""}`}
                          onClick={() => toggleFavorite(item.subjectId, item.name)}
                          disabled={!localStorage.getItem("userId")}
                          aria-label={isFavorited ? "Bỏ yêu thích" : "Thêm yêu thích"}
                        >
                          <i
                            className={`fa-heart ${
                              isFavorited ? "fa-solid" : "fa-regular"
                            }`}
                          ></i>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>{texts.noSubjects || "Không tìm thấy môn học nào."}</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
