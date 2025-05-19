import React from "react";
import "./index.css";
import { useAuth } from "../Context/AuthProvider";
import { useLanguage } from "../Context/LanguageProvider";

export default function Headers() {
  const { isLoggedIn, logout } = useAuth();
  const { language, toggleLanguage, texts } = useLanguage();

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
                <img
                  alt="slogan"
                  src="slogan-vi.png"
                  className="img-fluid"
                />
              </div>
            </div>
            <div className="auth-links d-flex align-items-center">
              <div className="header-img">
                <img alt="Illustration" src="hat.png" className="img-fluid" />
              </div>
              <button
                onClick={toggleLanguage}
                className="btn btn-outline-secondary mx-2"
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
          <a href="/favorites" className="favorites-link mx-3">
            <i className="fa-solid fa-heart"></i>
          </a>
        </div>
      </header>
    </div>
  );
}