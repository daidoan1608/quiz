import React, { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthProvider";
import { useLanguage } from "../Context/LanguageProvider";
import { useNavigate, useLocation } from "react-router-dom";
import FavoritesModal from "../modal/FavoritesModal";

export default function Headers() {
  const { isLoggedIn, logout, fullName } = useAuth();
  const { language, toggleLanguage, texts } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Kiểm tra dark mode lúc load
  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    }
  };

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = () => setShowUserMenu(false);
    if (showUserMenu) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showUserMenu]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const navItems = [
    { name: texts.home || "Trang chủ", link: "/" },
    { name: texts.revision || "Ôn tập", link: "/revision" },
    { name: texts.exams || "Kiểm tra", link: "/chooseExams" },
    { name: texts.rank || "Xếp hạng", link: "/rank" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-[#1C2A36]/90 backdrop-blur-md border-b border-gray-200 dark:border-white/10 shadow-sm transition-all duration-300">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* LOGO */}
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <img
                src="/logoschool.png"
                alt="Logo"
                className="h-10 w-auto object-contain"
              />
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                QuizVNUA
              </h2>
            </div>

            {/* MENU DESKTOP */}
            <nav className="hidden md:flex items-center gap-1 bg-gray-100/80 dark:bg-gray-700/50 p-1 rounded-full border border-gray-200 dark:border-gray-600">
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  className={`!no-underline px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    isActive(item.link)
                      ? "bg-blue-600 !text-white shadow-md !font-bold"
                      : "text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-white dark:hover:bg-gray-600"
                  }`}
                >
                  {item.name}
                </a>
              ))}
            </nav>

            {/* USER ACTIONS */}
            <div className="flex items-center gap-3">

              {/* --- LOGIC NÚT PHỤ (Language hoặc Notification) --- */}
              {!isLoggedIn ? (
                 // CASE 1: Chưa đăng nhập -> Hiện nút Đổi ngôn ngữ
                <button
                  onClick={toggleLanguage}
                  className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg size-10 bg-gray-100 dark:bg-gray-700/50 text-[#111418] dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Đổi ngôn ngữ"
                >
                  <span className="font-bold text-xs">
                    {language === "vi" ? "VN" : "EN"}
                  </span>
                </button>
              ) : (
                // CASE 2: Đã đăng nhập -> Hiện nút Thông báo (Chuông)
                <button
                  className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg size-10 bg-gray-100 dark:bg-gray-700/50 text-[#111418] dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => navigate("/notifications")}>
                  <span className="material-symbols-outlined text-xl">notifications</span>
                </button>
              )}


              {/* --- LOGIC LOGIN/REGISTER HOẶC AVATAR --- */}
              {!isLoggedIn ? (
                <div className="flex gap-2">
                  <a
                    href="/login"
                    className="!no-underline px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    {texts.login}
                  </a>
                  <a
                    href="/register"
                    className="!no-underline px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition"
                  >
                    {texts.register}
                  </a>
                </div>
              ) : (
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  {/* Avatar Button */}
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-gray-700/50 shadow-sm ring-2 ring-transparent hover:ring-blue-500/50 transition-all focus:outline-none"
                    type="button"
                  >
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 border border-gray-200 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                      <span className="text-blue-600 dark:text-blue-300 font-bold text-lg">
                        {fullName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </button>

                  {/* --- POP-UP MENU --- */}
                  {showUserMenu && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-72 origin-top-right rounded-xl bg-white dark:bg-[#1C2A36] p-2 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex flex-col">
                        {/* 1. Tài khoản */}
                        <div
                          onClick={() => navigate("/account")}
                          className="flex items-center gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">
                            account_circle
                          </span>
                          <p className="flex-1 truncate text-base font-normal leading-normal text-gray-800 dark:text-gray-200">
                            {texts.account || "Thông tin tài khoản"}
                          </p>
                        </div>

                        {/* 2. Yêu thích (Mở Modal) */}
                        <div
                          onClick={() => {
                            setIsModalOpen(true);
                            setShowUserMenu(false);
                          }}
                          className="flex items-center gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">
                            star
                          </span>
                          <p className="flex-1 truncate text-base font-normal leading-normal text-gray-800 dark:text-gray-200">
                            {texts.favorites || "Yêu thích"}
                          </p>
                        </div>

                        {/* 3. Ngôn ngữ (Trong Menu Dropdown vẫn giữ để tiện thay đổi) */}
                        <div
                          onClick={toggleLanguage}
                          className="flex items-center justify-between gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">
                              language
                            </span>
                            <p className="flex-1 truncate text-base font-normal leading-normal text-gray-800 dark:text-gray-200">
                              Ngôn ngữ:{" "}
                              <span className=" text-blue-600">
                                {language === "vi" ? "Tiếng Việt" : "English"}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* 4. Dark Mode */}
                        <div className="flex items-center justify-between gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-gray-100 dark:hover:bg-white/10">
                          <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">
                              dark_mode
                            </span>
                            <p className="flex-1 truncate text-base font-normal leading-normal text-gray-800 dark:text-gray-200">
                              Chế độ tối
                            </p>
                          </div>
                          <label className="relative flex h-[26px] w-[44px] cursor-pointer items-center rounded-full bg-gray-200 dark:bg-gray-700 p-0.5 has-[:checked]:bg-blue-600 transition-colors">
                            <input
                              type="checkbox"
                              className="peer sr-only"
                              checked={isDarkMode}
                              onChange={toggleTheme}
                            />
                            <div className="h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out peer-checked:translate-x-[18px]"></div>
                          </label>
                        </div>

                        <div className="my-2 h-px bg-gray-200 dark:bg-white/10"></div>

                        {/* 5. Đăng xuất */}
                        <div
                          onClick={handleLogout}
                          className="flex items-center gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer group"
                        >
                          <span className="material-symbols-outlined text-red-500 group-hover:scale-110 transition-transform">
                            logout
                          </span>
                          <p className="flex-1 truncate text-base font-normal leading-normal text-red-500">
                            {texts.logout || "Đăng xuất"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Drawer */}
          {showMobileMenu && (
            <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-700 space-y-2 animate-in slide-in-from-top-2">
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  className={`block px-4 py-2 rounded-lg text-base font-medium ${
                    isActive(item.link)
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {item.name}
                </a>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Gọi Component Modal đã tách */}
      <FavoritesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}