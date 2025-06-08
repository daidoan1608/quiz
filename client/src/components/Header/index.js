import React, { useState } from "react";
// import "./index.css";
import "./index1.css";
import { useAuth } from "../Context/AuthProvider";
import { useLanguage } from "../Context/LanguageProvider";
import { useFavorites } from "../Context/FavoritesContext";
import { useNavigate } from "react-router-dom";
import { message } from "antd";


export default function Headers() {
  const { isLoggedIn, logout } = useAuth();
  const {fullName} = useAuth();
  const { language, toggleLanguage, texts } = useLanguage();


  const [isModalOpen, setIsModalOpen] = useState(false);
  const { favorites, toggleFavorite, loading, error } = useFavorites();
  const navigate = useNavigate();


  const [showMobileMenu, setShowMobileMenu] = useState(false);
  // const [isHovered, setIsHovered] = useState(false);
  // person
  const [showUserMenu, setShowUserMenu] = useState(false);


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
    <>
      <header className="header" style={{ marginTop: "10px" }}>
        <div className="container py-2">
          <div className="d-flex align-items-center justify-content-between w-100">
            <div className="d-flex align-items-center flex-shrink-0">
              <img
                src="logoschool.png"
                alt="FITA logo"
                className="logo-img"
              />
              <img
                src="slogan-vi.png"
                alt="Slogan"
                className="logo-img ms-2"
              />
            </div>


            <div className="d-none d-md-flex align-items-center gap-2">
              <button
                onClick={toggleLanguage}
                className="btn btn-outline-secondary btn-sm text-nowrap px-2"
              >
                {language === "vi" ? "English" : "Tiếng Việt"}
              </button>
              {!isLoggedIn ? (
                <>
                  <a href="/login" className="btn btn-primary btn-sm text-nowrap px-2">
                    {texts.login}
                  </a>
                  <a href="/register" className="btn btn-secondary btn-sm text-nowrap px-2">
                    {texts.register}
                  </a>
                </>
              ) : (
                <div className="position-relative user-dropdown">
                  <button
                    className="btn btn-light btn-sm border px-2"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <i className="fa-regular fa-user"></i>
                  </button>

                  {showUserMenu && (
                    <ul className="user-menu list-unstyled position-absolute bg-white border p-2 mt-1">
                      <li>
                        <a href="/account" className="dropdown-item">{texts.account}</a>
                      </li>
                      <li>
                        <button onClick={toggleModal} className="dropdown-item">
                          {texts.favorites || "Yêu thích"}
                        </button>
                      </li>
                      <li>
                        <button onClick={handleLogout} className="dropdown-item text-danger">
                          {texts.logout}
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              )}
                  <span className="d-block text-center mb-1" style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {fullName || "Người dùng"}
                  </span>
            </div>


            {/* Nút chức năng trên màn hình nhỏ (dropdown) */}
            <div className="d-md-none position-relative">
              <button
                className="btn btn-sm no-border-btn"
                style={{ marginLeft: '-10px' }}
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                ☰
              </button>


              {showMobileMenu && (
                <div
                  className="position-absolute bg-white border rounded p-1 mt-1 d-flex flex-column"
                  style={{ left: '-130px', zIndex: 999, fontSize: '0.65rem', minWidth: '140px' }}
                >
                  <button
                    onClick={toggleLanguage}
                    className="btn btn-outline-secondary btn-sm w-100 mb-1 py-1"
                    style={{ fontSize: '0.65rem', paddingTop: '0.2rem', paddingBottom: '0.2rem' }}
                  >
                    {language === "vi" ? "English" : "Tiếng Việt"}
                  </button>


                  {!isLoggedIn ? (
                    <>
                      <a href="/login" className="btn btn-primary btn-sm w-100 mb-1 py-1" style={{ fontSize: '0.65rem', paddingTop: '0.2rem', paddingBottom: '0.2rem' }}>
                        {texts.login}
                      </a>
                      <a href="/register" className="btn btn-secondary btn-sm w-100 py-1" style={{ fontSize: '0.65rem', paddingTop: '0.2rem', paddingBottom: '0.2rem' }}>
                        {texts.register}
                      </a>
                    </>
                  ) : (
                    <>
                      <a href="/account" className="btn btn-light btn-sm w-100 mb-1 py-1" style={{ fontSize: '0.65rem', paddingTop: '0.2rem', paddingBottom: '0.2rem' }}>
                        {texts.account}
                      </a>
                      <button
                        onClick={toggleModal}
                        className="btn btn-light btn-sm w-100 mb-1 py-1"
                        style={{ fontSize: '0.65rem', paddingTop: '0.2rem', paddingBottom: '0.2rem' }}
                      >
                        {texts.favorites || "Yêu thích"}
                      </button>
                      <button
                        onClick={handleLogout}
                        className="btn btn-danger btn-sm w-100 py-1"
                        style={{ fontSize: '0.65rem', paddingTop: '0.2rem', paddingBottom: '0.2rem' }}
                      >
                        {texts.logout}
                      </button>

                    </>
                  )}
                </div>
              )}


              <style jsx>{`
            .no-border-btn,
            .no-border-btn:hover,
            .no-border-btn:focus,
            .no-border-btn:active {
              border: none !important;
              box-shadow: none !important;
              background-color: transparent !important;
              outline: none !important;
            }
          `}</style>
            </div>
          </div>
        </div>




        <div className="nav-links-headers2 d-flex justify-content-center">
          <a href="/" className="nav-link mx-3">
            {texts.home}
          </a>
          <a href="/revision" className="nav-link mx-3">
            {texts.revision}
          </a>
          <a href="/chooseExams" className="nav-link mx-3">
            {texts.exams}
          </a>
          <a href="/rank" className="nav-link mx-3">
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
    </>
  );
}
