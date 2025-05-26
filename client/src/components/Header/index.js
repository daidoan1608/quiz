import React, { useState } from "react";
import "./index.css";
import { useAuth } from "../Context/AuthProvider";
import { useLanguage } from "../Context/LanguageProvider";
import { useFavorites } from "../Context/FavoritesContext";
import { useNavigate } from "react-router-dom";
import { message } from "antd";

export default function Headers() {
  const { isLoggedIn, logout } = useAuth();
  const { language, toggleLanguage, texts } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { favorites, toggleFavorite, loading, error } = useFavorites();
  const navigate = useNavigate();


  // Mở / Đóng modal, khi mở thì gọi lại loadFavorites từ context nếu cần
  const toggleModal = () => {
    const willOpen = !isModalOpen;
    setIsModalOpen(willOpen);
    // loadFavorites đã được xử lý trong context useEffect nên không cần gọi ở đây nữa
  };

  // Xóa favorite qua toggleFavorite (đã xử lý xóa trong context)
  const handleDelete = (subjectId, subjectName) => {
    toggleFavorite(subjectId, subjectName);
    message.success("Xóa môn yêu thích thành công!");
  };

  const handleReview = (subjectId) => {
    setIsModalOpen(false);
    navigate(`/listChap`, {
      state: { subjectId },
    });
  };

  const handleMockTest = (subjectId) => {
    setIsModalOpen(false);
    navigate(`/exams`, { state: { subjectId } });
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="header-container">
      <header className="header" style={{ marginTop: "10px" }}>
        <div className="d-flex justify-content-between align-items-center">
          <div className="logo">
            <img alt="FITA logo" src="logoschool.png" className="img-fluid" />
          </div>
          <div className="header-top d-flex align-items-center">
            <div className="header-between">
              <div className="slogan">
                <img alt="slogan" src="slogan-vi.png" className="img-fluid" />
              </div>
            </div>

            {/* Nút chuyển đổi ngôn ngữ luôn hiện */}
            <button
              onClick={toggleLanguage}
              className="btn btn-outline-secondary mx-5"
              aria-label={texts.toggleLanguageAria}
            >
              {language === "vi" ? "English" : "Tiếng Việt"}
            </button>

            {!isLoggedIn ? (
              <>
                <a href="/login" className="btn btn-primary mx-2">
                  {texts.login}
                </a>
                <a href="/register" className="btn btn-secondary mx-2">
                  {texts.register}
                </a>
              </>
            ) : (
              <div className="user-info">
                <ul className="menu-user list-unstyled">
                  <li>
                    <input
                      type="checkbox"
                      id="menu-toggle"
                      className="menu-toggle"
                    />
                    <label htmlFor="menu-toggle">
                      <i className="fa-regular fa-user"></i>
                    </label>
                    <ul className="submenu-user list-unstyled">
                      <li>
                        <a href="/account" className="account">
                          {texts.account}
                        </a>
                      </li>
                      <li>
                        <a href="#" className="bookmark" onClick={toggleModal}>
                          {texts.favorites || "Yêu thích"}
                        </a>
                      </li>
                      <li>
                        <a href="/" onClick={handleLogout} className="log-out">
                          {texts.logout}
                        </a>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="nav-links-headers2 d-flex justify-content-center">
          <a href="/" className="mx-3">
            {texts.home}
          </a>
          <a href="/revision" className="mx-3">
            {texts.revision}
          </a>
          <a href="/chooseExams" className="mx-3">
            {texts.exams}
          </a>
          <a href="/rank" className="mx-3">
            {texts.rank}
          </a>
        </div>
      </header>

      {/* Modal hiển thị danh sách môn học yêu thích */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{texts.favoriteSubjectsTitle || "Môn học yêu thích"}</h3>

            {loading && <p>Đang tải...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {!loading && !error && (favorites.length > 0 ? (
              <ul>
                {favorites.map((fav) => (
                  <li key={fav.subjectId}>
                    <div>{fav.subjectName || `Môn ${fav.subjectId}`}</div>
                    <div className="favorite-actions">
                      <button
                        className="btn btn-delete"
                        onClick={() => handleDelete(fav.subjectId, fav.subjectName)}
                        type="button"
                      >
                        {texts.delete}
                      </button>
                      <button
                        className="btn btn-review"
                        onClick={() => handleReview(fav.subjectId)}
                        type="button"
                      >
                        {texts.revision}
                      </button>
                      <button
                        className="btn btn-mocktest"
                        onClick={() => handleMockTest(fav.subjectId)}
                        type="button"
                      >
                        {texts.test}  
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>{texts.noFavorites || "Chưa có môn học yêu thích nào."}</p>
            ))}

            <button onClick={toggleModal}>{texts.close}</button>
          </div>
        </div>
      )}
    </div>
  );
}
