import React, { useState } from "react";
import "./index.css";
import { useAuth } from "../Context/AuthProvider";
import { useLanguage } from "../Context/LanguageProvider";
import { publicAxios , authAxios} from "../../api/axiosConfig";

export default function Headers() {
  const { isLoggedIn, logout } = useAuth();
  const { language, toggleLanguage, texts } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [favorites, setFavorites] = useState([]); // Giả sử bạn sẽ set danh sách môn yêu thích ở đây
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem("userId");

  const toggleModal = async () => {
    const willOpen = !isModalOpen;
    setIsModalOpen(willOpen);
    if (willOpen) {
    setLoading(true);
    setError(null);
    try {
      const resp = await authAxios.get(`/user/favorites/user/${userId}`);
      setFavorites(resp.data.data || []);
    } catch (error) {
      setError(texts.errorLoadingFavorites || "Lỗi tải danh sách yêu thích");
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }
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
          {/* <a href="/favorites" className="favorites-link mx-3">
            <i className="fa-solid fa-heart"></i>
          </a> */}
        </div>
      </header>

      {/* Modal hiển thị danh sách môn học yêu thích */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{texts.favoriteSubjectsTitle || "Môn học yêu thích"}</h3>

            {loading && <p>Đang tải...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {!loading && !error && (
              favorites.length > 0 ? (
                <ul>
                  {favorites.map((fav) => (
                    <li key={fav.subjectId}>
                      <div>{fav.subjectName || `Môn ${fav.subjectId}`}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{texts.noFavorites || "Chưa có môn học yêu thích nào."}</p>
              )
            )}

            <button onClick={toggleModal}>{texts.close || "Đóng"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
