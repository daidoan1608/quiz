import React, { useEffect, useState } from "react";
import { authAxios, publicAxios } from "../../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import "./RevisionUser.css";
import Sidebar from "../../User/SideBar";
import { useLanguage } from "../../Context/LanguageProvider";
import subjectTranslations from "../../../Languages/subjectTranslations";

export default function RevisionUser() {
  const [subjects, setSubjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { texts, language } = useLanguage();

  // TODO: Lấy userId từ auth hoặc context
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    getAllSubjects();
    loadFavorites();
  }, []);

  const getAllSubjects = async () => {
    try {
      const resp = await authAxios.get("/public/subjects");
      setSubjects(resp.data.data);
      setFilteredSubjects(resp.data.data);
    } catch (error) {
      console.error("Error from the server:", error);
    }
  };

  const loadFavorites = async () => {
    try {
      const resp = await authAxios.get(`/user/favorites/user/${userId}`);
      setFavorites(resp.data.data || []);
    } catch (error) {
      console.error("Error loading favorites:", error);
      setFavorites([]); // Đặt giá trị mặc định là mảng rỗng nếu có lỗi
    }
  };

  const handleFavoriteToggle = async (subjectId, subjectName) => {
    try {
      const isFavorite = favorites.some((fav) => fav.subjectId === subjectId);

      if (!isFavorite) {
        // Thêm favorite
        await authAxios.post("/user/favorites", {
          userId,
          subjectId,
          subjectName,
        });

        setFavorites((prev) => [...prev, { subjectId, subjectName }]);
      } else {
        // Xóa favorite
        await authAxios.delete("/user/favorites", {
          data: { userId, subjectId, subjectName },
        });

        setFavorites((prev) => prev.filter((fav) => fav.subjectId !== subjectId));
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      // Bạn có thể hiển thị thông báo lỗi cho người dùng ở đây
    }
  };

  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setSearchQuery(""); // Xóa tìm kiếm khi chọn danh mục
    const filtered = subjects.filter((subject) => subject.categoryId === categoryId);
    setFilteredSubjects(filtered);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedCategory(null); // Bỏ chọn danh mục khi tìm kiếm
    const filtered = subjects.filter((subject) =>
      subject.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredSubjects(filtered);
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
          {/* 🔍 Thanh tìm kiếm */}
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
                          navigate(`/listChap`, {
                            state: { subjectId: item.subjectId },
                          })
                        }
                      >
                        {texts.chooseChapter}
                      </button>
                      <button
                        className={`favorites-button ${isFavorited ? "favorited" : ""}`}
                        onClick={() => handleFavoriteToggle(item.subjectId, item.name)}
                      >
                        <i className={`fa-heart ${isFavorited ? "fa-solid" : "fa-regular"}`}></i>
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
