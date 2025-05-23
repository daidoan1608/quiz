import React, { useState } from "react";
import "./index.css";
import "./responsiveHeader.css"
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

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isUserOpen, setIsUserOpen] = useState(true);


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

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    setIsMenuOpen(false);
    navigate("/");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const toggleUser = () => {
    setIsUserOpen(!isUserOpen)
  }


  return (
          <div id="main">
            <div id="header">
              <ul id="nav" className={isNavOpen ? "nav-closed":"nav-open"}>
                <li>
                  <a href="/">{texts.home}</a>
                  <i className="fas fa-bars menu-btn" onClick={toggleNav}></i>
                </li>
                <li>
                  <a href="/revision">{texts.revision}</a>
                </li>
                <li>
                  <a href="/chooseExams">{texts.exams}</a>
                </li>
                <li>
                  <a href="/rank">{texts.rank}</a>
                </li>
                <li>
                  <button
                    onClick={toggleLanguage}
                    className="btn-language"
                    aria-label={texts.toggleLanguageAria}
                  >
                    {language === "vi" ? "English" : "Tiếng Việt"}
                  </button>
                </li>
                <li className="user-li">
                  <div className="user-icon" onClick={toggleMenu}>
                    
                      <i className="fas fa-user"></i>
                      <i className="fas fa-caret-down"></i>
                    
                  </div>
                  {isMenuOpen && (
                    <ul className={`dropdown-menu ${toggleUser ? "show" : ""}`}>
                      {!isLoggedIn ? (
                        <>
                          <li>
                            <a href="/login">{texts.login}</a>
                          </li>
                          <li>
                            <a href="/register">{texts.register}</a>
                          </li>
                        </>
                      ) : (
                        <>
                          <li>
                            <a href="/account">{texts.account}</a>
                          </li>
                          <li>
                              <a href="#" className="bookmark" onClick={toggleModal}>{texts.favorites || "Yêu thích"}</a>
                            </li>
                          <li>
                            <a href="/" onClick={handleLogout}>
                              {texts.logout}
                            </a>
                          </li>
                        </>
                      )}
                    </ul>
                  )}
                </li>
              </ul>
            </div>
      
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
                        Xóa
                      </button>
                      <button
                        className="btn btn-review"
                        onClick={() => handleReview(fav.subjectId)}
                        type="button"
                      >
                        Ôn tập
                      </button>
                      <button
                        className="btn btn-mocktest"
                        onClick={() => handleMockTest(fav.subjectId)}
                        type="button"
                      >
                        Thi thử
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>{texts.noFavorites || "Chưa có môn học yêu thích nào."}</p>
            ))}

            <button onClick={toggleModal}>{texts.close || "Đóng"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
