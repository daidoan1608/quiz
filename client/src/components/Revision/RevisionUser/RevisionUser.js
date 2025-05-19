import React, { useEffect, useState } from "react";
import { publicAxios } from "../../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import "./RevisionUser.css";
import Sidebar from "../../User/SideBar";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";

export default function RevisionUser() {
  const [subjects, setSubjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getAllSubjects();
    loadFavorites();
  }, []);

  const getAllSubjects = async () => {
    try {
      const resp = await publicAxios.get("/public/subjects");
      setSubjects(resp.data.data);
      setFilteredSubjects(resp.data.data);
    } catch (error) {
      console.error("Error from the server:", error);
    }
  };

  const loadFavorites = () => {
    const savedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(savedFavorites);
  };

  const saveFavorites = (updatedFavorites) => {
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  const handleFavoriteToggle = (subjectId, subjectName) => {
    const updatedFavorites = [...favorites];
    const index = updatedFavorites.findIndex((item) => item.subjectId === subjectId);

    if (index === -1) {
      updatedFavorites.push({ subjectId, subjectName });
    } else {
      updatedFavorites.splice(index, 1);
    }

    setFavorites(updatedFavorites);
    saveFavorites(updatedFavorites);
  };

  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setSearchQuery(""); // Xoá tìm kiếm khi chọn danh mục
    const filtered = subjects.filter(
      (subject) => subject.categoryId === categoryId
    );
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
            placeholder="Tìm kiếm môn học..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-bar"
          />

          <section className="category-re">
            <div className="container-re">
              {filteredSubjects.map((item) => (
                <div className="card" key={item.subjectId}>
                  <div className="card-content">
                    <h3>{item.name}</h3>
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
                      Chọn chương
                    </button>
                    <button
                      className={`favorites-button ${
                        favorites.some((fav) => fav.subjectId === item.subjectId)
                          ? "favorited"
                          : ""
                      }`}
                      onClick={() =>
                        handleFavoriteToggle(item.subjectId, item.name)
                      }
                    >
                      <i
                        className={`fa-heart ${
                          favorites.some((fav) => fav.subjectId === item.subjectId)
                            ? "fa-solid"
                            : "fa-regular"
                        }`}
                      ></i>
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
