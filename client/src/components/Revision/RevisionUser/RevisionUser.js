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

  // Lấy userId từ localStorage, cho phép null/undefined nếu chưa đăng nhập
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    getAllSubjects();
    // Chỉ tải danh sách yêu thích nếu người dùng đã đăng nhập
    if (userId) {
      loadFavorites();
    } else {
      setFavorites([]); // Đặt danh sách yêu thích rỗng cho người dùng chưa đăng nhập
    }
  }, [userId]);

  const getAllSubjects = async () => {
    try {
      // Sử dụng publicAxios để cho phép truy cập không cần xác thực
      const resp = await publicAxios.get("/public/subjects");
      setSubjects(resp.data.data);
      setFilteredSubjects(resp.data.data);
    } catch (error) {
      console.error("Lỗi từ server:", error);
      setSubjects([]); // Đặt mảng rỗng nếu có lỗi
      setFilteredSubjects([]);
    }
  };

  const loadFavorites = async () => {
    try {
      const resp = await authAxios.get(`/user/favorites/user/${userId}`);
      setFavorites(resp.data.data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách yêu thích:", error);
      setFavorites([]); // Đặt mảng rỗng nếu có lỗi
    }
  };

  const handleFavoriteToggle = async (subjectId, subjectName) => {
    // Ngăn thao tác yêu thích nếu người dùng chưa đăng nhập
    if (!userId) {
      alert(texts.pleaseLogin || "Vui lòng đăng nhập để sử dụng tính năng này"); // Thông báo cho người dùng
      return;
    }

    try {
      const isFavorite = favorites.some((fav) => fav.subjectId === subjectId);

      if (!isFavorite) {
        // Thêm vào danh sách yêu thích
        await authAxios.post("/user/favorites", {
          userId,
          subjectId,
          subjectName,
        });
        setFavorites((prev) => [...prev, { subjectId, subjectName }]);
      } else {
        // Xóa khỏi danh sách yêu thích
        await authAxios.delete("/user/favorites", {
          data: { userId, subjectId, subjectName },
        });
        setFavorites((prev) => prev.filter((fav) => fav.subjectId !== subjectId));
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật danh sách yêu thích:", error);
      alert(texts.errorFavorites || "Có lỗi xảy ra khi cập nhật danh sách yêu thích");
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
                            navigate(`/listChap`, {
                              state: { subjectId: item.subjectId },
                            })
                          }
                        >
                          {texts.chooseChapter || "Chọn chương"}
                        </button>
                        <button
                          className={`favorites-button ${isFavorited ? "favorited" : ""}`}
                          onClick={() => handleFavoriteToggle(item.subjectId, item.name)}
                          disabled={!userId} // Vô hiệu hóa nút nếu chưa đăng nhập
                        >
                          <i className={`fa-heart ${isFavorited ? "fa-solid" : "fa-regular"}`}></i>
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