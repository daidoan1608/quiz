import React, { useState, useEffect } from "react";
import { useAuth } from "context/AuthProvider";
import { useLanguage } from "context/LanguageProvider";
import { useNavigate, useLocation } from "react-router-dom";
import FavoritesModal from "components/modals/FavoritesModal";
import { useTheme } from "context/ThemeProvider";
import { getStoredAvatarUrl } from "utils/storage";
import { resolveMediaUrl } from "utils/mediaUrl";
import AppearanceModeToggle from "./AppearanceModeToggle";
import Logo from "./Logo";

const BASE_URL_AVATAR = process.env.REACT_APP_AVATAR_URL;
export default function Header() {
  const { isLoggedIn, logout, fullName, avatarUrl } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const currentAvatarUrl = avatarUrl || getStoredAvatarUrl();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const { mode, setMode, colorTheme, setColorTheme } = useTheme();
  const isDarkMode = mode === 'dark';
  const toggleTheme = () => setMode(isDarkMode ? 'light' : 'dark');

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
    { name: t("nav.home"), link: "/" },
    { name: t("nav.subjects"), link: "/subjects" },
    { name: t("nav.rank"), link: "/rank" },
  ];

  const isActive = (path) => location.pathname === path;

  // Đảm bảo đóng Mobile Menu khi chuyển hướng
  const handleMobileNavClick = (link) => {
    navigate(link);
    setShowMobileMenu(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-surface-dark/90 backdrop-blur-md border-b border-gray-200 dark:border-white/10 shadow-sm transition-all duration-300">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex items-center justify-between h-20 md:h-24">
            <Logo onClick={() => navigate("/")} />

            {/* MENU DESKTOP (Không đổi) */}
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

              {/* --- 1. NÚT ĐỔI NGÔN NGỮ (Chỉ hiện khi CHƯA ĐĂNG NHẬP VÀ TRÊN DESKTOP) --- */}
              {!isLoggedIn && (
                <button
                  onClick={toggleLanguage}
                  className="hidden md:flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg size-10 bg-gray-100 dark:bg-gray-700/50 text-[#111418] dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                   title={t("language.change")}
                >
                  <span className="font-bold text-xs">
                    {language === "vi" ? "VN" : "EN"}
                  </span>
                </button>
              )}

              {/* --- 2. NÚT DARK MODE (Chỉ hiện khi CHƯA ĐĂNG NHẬP VÀ TRÊN DESKTOP) --- */}
              {!isLoggedIn && (
                <button
                  onClick={toggleTheme}
                  className="hidden md:flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg size-10 bg-gray-100 dark:bg-gray-700/50 text-[#111418] dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title={t("theme.dark")}
                >
                  <span className="material-symbols-outlined text-xl">
                    {isDarkMode ? "light_mode" : "dark_mode"}
                  </span>
                </button>
              )}

              {/* --- 3. NÚT THÔNG BÁO (Chỉ hiện khi ĐĂNG NHẬP VÀ TRÊN DESKTOP) --- */}
              {isLoggedIn && (
                <button
                  className="hidden md:flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg size-10 bg-gray-100 dark:bg-gray-700/50 text-[#111418] dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => navigate("/notifications")}>
                  <span className="material-symbols-outlined text-xl">notifications</span>
                </button>
              )}


              {/* --- 4. LOGIC LOGIN/REGISTER HOẶC AVATAR --- */}
              {!isLoggedIn ? (
                // ẨN LOGIN/REGISTER TRÊN THANH HEADER MOBILE
                <div className="hidden md:flex gap-2">
                  <a
                    href="/login"
                    className="!no-underline px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    {t("auth.login")}
                  </a>
                  <a
                    href="/register"
                    className="!no-underline px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition"
                  >
                    {t("auth.register")}
                  </a>
                </div>
              ) : (
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  {/* Avatar Button: HIỂN THỊ CẢ TRÊN MOBILE VÀ DESKTOP */}
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-gray-700/50 shadow-sm ring-2 ring-transparent hover:ring-blue-500/50 transition-all focus:outline-none"
                    type="button"
                  >
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 border border-gray-200 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                      {currentAvatarUrl ? (
                        <img
                          src={resolveMediaUrl(currentAvatarUrl, BASE_URL_AVATAR || "")}
                          alt={fullName || "User Avatar"}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'; // Cách 1: Thay bằng ảnh mặc định
                            // Hoặc e.target.style.display = 'none'; // Cách 2: Ẩn ảnh lỗi để hiện placeholder phía dưới
                          }}
                        />
                      ) : (
                        <span className="text-blue-600 dark:text-blue-300 font-bold text-lg">
                          {fullName?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </button>

                  {/* --- POP-UP MENU (Dropdown cho người dùng Đã Đăng nhập) --- */}
                  {showUserMenu && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-72 origin-top-right rounded-xl bg-white dark:bg-surface-dark p-2 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex flex-col">
                        {/* 1. Tài khoản */}
                        <div
                          onClick={() => {navigate("/account"); setShowUserMenu(false);}}
                          className="flex items-center gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">account_circle</span>
                          <p className="flex-1 truncate text-base font-normal leading-normal text-gray-800 dark:text-gray-200">
                            {t("nav.account")}
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
                          <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">star</span>
                          <p className="flex-1 truncate text-base font-normal leading-normal text-gray-800 dark:text-gray-200">
                            {t("nav.favorites")}
                          </p>
                        </div>

                        {/* 3. Ngôn ngữ (Giữ trong Menu Pop-up) */}
                        <div
                          onClick={toggleLanguage}
                          className="flex items-center justify-between gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">language</span>
                            <p className="flex-1 truncate text-base font-normal leading-normal text-gray-800 dark:text-gray-200">
                              {t("language.label")}: {" "}
                              <span className=" text-blue-600">
                                {language === "vi" ? t("language.vietnamese") : t("language.english")}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* 4. Giao diện & Đổi tông màu */}
                        <div className="flex flex-col gap-3 rounded-lg px-4 py-3 bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-white/5 my-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-gray-600 dark:text-gray-400 text-lg">
                                {isDarkMode ? "dark_mode" : "light_mode"}
                              </span>
                              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {t("theme.appearance")}
                              </p>
                            </div>
                            <AppearanceModeToggle
                              isDarkMode={isDarkMode}
                              setMode={setMode}
                              t={t}
                              lightClassName={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                                !isDarkMode
                                  ? "bg-white text-gray-900 shadow-sm"
                                  : "text-gray-500 hover:text-gray-300"
                              }`}
                              darkClassName={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                                isDarkMode
                                  ? "bg-gray-800 text-white shadow-sm"
                                  : "text-gray-500 hover:text-gray-900"
                              }`}
                            />
                          </div>

                          <div className="h-px bg-gray-200/60 dark:bg-gray-700/60 my-1"></div>

                          <div className="flex flex-col gap-2">
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              {t("theme.primaryColor")}
                            </p>
                            <div className="flex items-center justify-between gap-1 mt-1">
                              {[
                                { name: "blue", color: "#0058be", label: t("theme.colorLabel.blue") },
                                { name: "emerald", color: "#059669", label: t("theme.colorLabel.emerald") },
                                { name: "cyberpunk", color: "#be185d", label: t("theme.colorLabel.cyberpunk") },
                                { name: "sunset", color: "#ea580c", label: t("theme.colorLabel.sunset") },
                                { name: "slate", color: "#4f46e5", label: t("theme.colorLabel.slate") },
                              ].map((themeOpt) => (
                                <button
                                  key={themeOpt.name}
                                  onClick={() => setColorTheme(themeOpt.name)}
                                  title={themeOpt.label}
                                  className={`relative group flex size-7 items-center justify-center rounded-full border-2 transition-all hover:scale-110 active:scale-95 ${
                                    colorTheme === themeOpt.name
                                      ? "border-gray-900 dark:border-white scale-105"
                                      : "border-transparent"
                                  }`}
                                >
                                  <span className="size-5 rounded-full shadow-inner" style={{ backgroundColor: themeOpt.color }}></span>
                                  {colorTheme === themeOpt.name && (
                                    <span className="absolute text-white text-[10px] font-black leading-none">✓</span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="my-2 h-px bg-gray-200 dark:bg-white/10"></div>

                        {/* 5. Đăng xuất */}
                        <div
                          onClick={handleLogout}
                          className="flex items-center gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer group"
                        >
                          <span className="material-symbols-outlined text-red-500 group-hover:scale-110 transition-transform">logout</span>
                          <p className="flex-1 truncate text-base font-normal leading-normal text-red-500">
                            {t("auth.logout")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Menu Button: LUÔN HIỂN THỊ TRÊN MOBILE */}
              <button
                className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <span className="material-symbols-outlined">
                    {showMobileMenu ? "close" : "menu"}
                </span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Drawer */}
          {showMobileMenu && (
            <div className="md:hidden max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain py-4 pb-8 border-t border-gray-100 dark:border-gray-700 space-y-2 animate-in slide-in-from-top-2">

              {/* Menu điều hướng chính */}
              {navItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleMobileNavClick(item.link)}
                  className={`cursor-pointer block px-4 py-2 rounded-lg text-base font-medium ${
                    isActive(item.link)
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {item.name}
                </div>
              ))}

              <div className="my-2 h-px bg-gray-100 dark:bg-gray-700"></div>

              {/* THAY THẾ NÚT LOGIN/REGISTER TRÊN HEADER BẰNG CÁC MỤC TRONG MENU */}
              {!isLoggedIn && (
                <>
                  <div
                    onClick={() => handleMobileNavClick("/login")}
                    className="flex items-center gap-4 rounded-lg px-4 py-3 text-sm font-medium transition-colors text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 cursor-pointer"
                  >
                      <span className="material-symbols-outlined">login</span>
                      {t("auth.login")}
                  </div>
                  <div
                    onClick={() => handleMobileNavClick("/register")}
                    className="flex items-center gap-4 rounded-lg px-4 py-3 text-sm font-medium transition-colors text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 cursor-pointer"
                  >
                      <span className="material-symbols-outlined">person_add</span>
                      {t("auth.register")}
                  </div>

                  <div className="my-2 h-px bg-gray-100 dark:bg-gray-700"></div>
                </>
              )}

              {/* Thêm đổi ngôn ngữ vào Mobile Menu (Luôn hiện trên Mobile Menu) */}
              <div
                onClick={toggleLanguage}
                className="flex items-center justify-between gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">language</span>
                  <p className="flex-1 truncate text-base font-normal leading-normal text-gray-800 dark:text-gray-200">
                    {t("language.label")}: {" "}
                    <span className=" text-blue-600">
                      {language === "vi" ? t("language.vietnamese") : t("language.english")}
                    </span>
                  </p>
                </div>
              </div>

              {/* Đa Theme trên Mobile */}
              <div className="flex flex-col gap-3 rounded-xl px-4 py-3 bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-gray-700/50 mx-4 my-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">
                      {isDarkMode ? "dark_mode" : "light_mode"}
                    </span>
                    <p className="text-base font-medium text-gray-800 dark:text-gray-200">{t("theme.appearance")}</p>
                  </div>
                  <AppearanceModeToggle
                    isDarkMode={isDarkMode}
                    setMode={setMode}
                    t={t}
                    lightClassName={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      !isDarkMode ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"
                    }`}
                    darkClassName={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      isDarkMode ? "bg-gray-800 text-white shadow-sm" : "text-gray-500"
                    }`}
                  />
                </div>

                <div className="h-px bg-gray-200 dark:bg-gray-700/50 my-1"></div>

                <div className="flex flex-col gap-2">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("theme.primaryColor")}</p>
                  <div className="flex items-center justify-between gap-1 mt-1">
                    {[
                      { name: "blue", color: "#0058be", label: t("theme.colorLabel.blue") },
                      { name: "emerald", color: "#059669", label: t("theme.colorLabel.emerald") },
                      { name: "cyberpunk", color: "#be185d", label: t("theme.colorLabel.cyberpunk") },
                      { name: "sunset", color: "#ea580c", label: t("theme.colorLabel.sunset") },
                      { name: "slate", color: "#4f46e5", label: t("theme.colorLabel.slate") },
                    ].map((themeOpt) => (
                      <button
                        key={themeOpt.name}
                        onClick={() => setColorTheme(themeOpt.name)}
                        className={`relative flex size-8 items-center justify-center rounded-full border-2 transition-all ${
                          colorTheme === themeOpt.name
                            ? "border-gray-900 dark:border-white scale-105"
                            : "border-transparent"
                        }`}
                      >
                        <span className="size-6 rounded-full shadow-inner" style={{ backgroundColor: themeOpt.color }}></span>
                        {colorTheme === themeOpt.name && (
                          <span className="absolute text-white text-xs font-black">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

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
