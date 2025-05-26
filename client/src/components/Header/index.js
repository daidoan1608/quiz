import React, { useState, useEffect, useRef } from "react";
import "./index.css";
import { useAuth } from "../Context/AuthProvider";
import { useLanguage } from "../Context/LanguageProvider";
import { useFavorites } from "../Context/FavoritesContext";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { Link } from "react-router-dom";

export default function Headers() {
  const { isLoggedIn, logout } = useAuth();
  const { language, toggleLanguage, texts } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false); // Trạng thái submenu
  const { favorites, toggleFavorite, loading, error } = useFavorites();
  const navigate = useNavigate();
  const submenuRef = useRef(null); // Ref cho submenu

  // Toggle modal yêu thích
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Toggle submenu user
  const toggleSubmenu = () => {
    setIsSubmenuOpen(!isSubmenuOpen);
  };

  // Đóng submenu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (submenuRef.current && !submenuRef.current.contains(event.target)) {
        setIsSubmenuOpen(false);
        const checkbox = document.getElementById("menu-toggle");
        if (checkbox) checkbox.checked = false; // Reset checkbox
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Xóa favorite
  const handleDelete = (subjectId, subjectName) => {
    toggleFavorite(subjectId, subjectName);
    message.success("Xóa môn yêu thích thành công!");
  };

  // Chuyển đến ôn tập
  const handleReview = (subjectId) => {
    setIsModalOpen(false);
    navigate(`/listChap`, { state: { subjectId } });
  };

  // Chuyển đến thi thử
  const handleMockTest = (subjectId) => {
    setIsModalOpen(false);
    navigate(`/exams`, { state: { subjectId } });
  };

  // Đăng xuất
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="header-container">
      <header className="header">
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

            {/* Nút chuyển đổi ngôn ngữ */}
            <button
              onClick={toggleLanguage}
              className="btn btn-outline-secondary mr-5"
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
              <div className="user-info" ref={submenuRef}>
                <ul className="menu-user list-unstyled">
                  <li>
                    <input
                      type="checkbox"
                      id="menu-toggle"
                      className="menu-toggle"
                      checked={isSubmenuOpen}
                      onChange={toggleSubmenu}
                    />
                    <label htmlFor="menu-toggle">
                      <i className="fa-regular fa-user"></i>
                    </label>
                    <ul className={`submenu-user list-unstyled ${isSubmenuOpen ? "open" : ""}`}>
                      <li>
                        <Link to="/account" className="account">
                          {texts.account}
                        </Link>
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

        {/* Navbar của Bootstrap */}
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid">
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/"
                    onClick={() => document.getElementById("navbarNav")?.classList.remove("show")}
                  >
                    {texts.home}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/revision"
                    onClick={() => document.getElementById("navbarNav")?.classList.remove("show")}
                  >
                    {texts.revision}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/chooseExams"
                    onClick={() => document.getElementById("navbarNav")?.classList.remove("show")}
                  >
                    {texts.exams}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/rank"
                    onClick={() => document.getElementById("navbarNav")?.classList.remove("show")}
                  >
                    {texts.rank}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      {/* Modal hiển thị danh sách môn học yêu thích */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{texts.favoriteSubjectsTitle || "Môn học yêu thích"}</h3>

            {loading && <p>Đang tải...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {!loading && !error && favorites.length > 0 ? (
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
              <p>{texts.noFavorites}</p>
            )}

            <button onClick={toggleModal}>{texts.close}</button>
          </div>
        </div>
      )}
    </div>
  );
}