import React from "react";
import { useLanguage } from "../Context/LanguageProvider";

const Footer = () => {
  const { texts } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-12 transition-colors duration-300">
      <div className="max-w-screen-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* GRID SYSTEM: items-start để căn đỉnh, nhưng ta sẽ chỉnh margin tiêu đề để khớp logo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* --- CỘT 1: LOGO & GIỚI THIỆU (4/12) --- */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2 h-8">
              {" "}
              {/* Set cứng chiều cao h-8 để làm chuẩn */}
              <div className="size-8 text-blue-600 flex items-center justify-center">
                <svg
                  fill="none"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                >
                  <path
                    d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-none mt-0.5">
                QuizVNUA
              </h2>
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
              Nền tảng ôn tập và kiểm tra trắc nghiệm trực tuyến chất lượng cao
              dành cho sinh viên VNUA.
            </p>
            {/* Social Icons */}
            <div className="mt-6 flex gap-4">
              <a
                href="https://www.facebook.com/groups/ITHUA"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-600 transition-colors !no-underline"
              >
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* --- CỘT 2: DANH MỤC (3/12) --- */}
          <div className="lg:col-span-3 lg:pl-8">
            {/* mt-1.5: Đẩy xuống để thẳng hàng mắt với chữ QuizVNUA ở cột 1 */}
            <h3 className="mt-1.5 text-sm font-bold tracking-wider uppercase text-gray-900 dark:text-white mb-4 h-6 flex items-center">
              {texts.menu || "Danh mục"}
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 !no-underline transition"
                  href="/"
                >
                  Trang chủ
                </a>
              </li>
              <li>
                <a
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 !no-underline transition"
                  href="/revision"
                >
                  Ôn tập kiến thức
                </a>
              </li>
              <li>
                <a
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 !no-underline transition"
                  href="/chooseExams"
                >
                  Làm bài kiểm tra
                </a>
              </li>
            </ul>
          </div>

          {/* --- CỘT 3: THÔNG TIN LIÊN HỆ (5/12) --- */}
          <div className="lg:col-span-5">
            {/* mt-1.5: Đẩy xuống tương tự cột 2 */}
            <h3 className="mt-1.5 text-sm font-bold tracking-wider uppercase text-gray-900 dark:text-white mb-4 h-6 flex items-center">
              {texts.contact || "Thông tin liên hệ"}
            </h3>
            <ul className="space-y-4">
              {/* Item 1: Địa chỉ */}
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 mt-[2px] text-blue-600 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {texts.address || "Địa chỉ"}:{" "}
                  </span>
                  P316, Tầng 3 Nhà Hành chính, Học viện Nông nghiệp Việt Nam
                </div>
              </li>

              {/* Item 2: Hotline */}
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 mt-[2px] text-blue-600 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {texts.tel || "Hotline"}:{" "}
                  </span>
                  (024) 62617701
                </div>
              </li>

              {/* Item 3: Email */}
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 mt-[2px] text-blue-600 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Email:{" "}
                  </span>
                  cntt@vnua.edu.vn
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* --- FOOTER BOTTOM: BẢN QUYỀN --- */}
        <div className="mt-4 border-t border-gray-200 dark:border-gray-800 text-center md:flex md:justify-between md:items-center md:text-left">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            &copy; {currentYear}{" "}
            {texts.coppy || "QuizVNUA. All rights reserved."}
          </p>
          <div className="mt-2 md:mt-0 flex justify-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            <a
              href="#"
              className="hover:text-blue-600 !no-underline transition-colors"
            >
              Điều khoản
            </a>
            <a
              href="#"
              className="hover:text-blue-600 !no-underline transition-colors"
            >
              Bảo mật
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
