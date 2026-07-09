import React, { useEffect, useState } from "react";
import { publicAxios } from "../../api/axiosConfig";
import { useLanguage } from "../../context/LanguageProvider";
import { useNavigate } from "react-router-dom";
import CatMascot from "./CatMascot";

export default function Home() {
  const [subjects, setSubjects] = useState([]);
  const { texts } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    getAllSubjects();
  }, []);

  const getAllSubjects = async () => {
    try {
      const resp = await publicAxios.get("public/subjects");
      setSubjects(resp.data.data || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách môn học:", error);
    }
  };



  // --- DỮ LIỆU TEAM (MỚI) ---
  const teamMembers = [
    {
      name: "Đoàn Minh Đại",
      role: "Project Manager & Backend",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
      quote: "Dẫn dắt bằng chiến lược, xây dựng bằng công nghệ.",
    },
    {
      name: "Lê Thị Hồng Ánh",
      role: "Frontend Developer",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      quote: "Tối ưu hóa trải nghiệm người dùng.",
    },
    {
      name: "Nguyễn Tuấn Anh",
      role: "Frontend Developer",
      avatar:
        "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80",
      quote: "Mỗi dòng code là một trải nghiệm mới.",
    },
{
      name: "Nguyễn Thế Sơn",
      role: "Frontend Developer",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
      quote: "Thiết kế giao diện – kiến tạo cảm hứng.",
    },
    {
      name: "Đoàn Thanh Bình",
      role: "UI/UX Designer",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
      quote: "Thiết kế vì người dùng, đẹp vì mục đích.",
    },
    {
      name: "Chu Văn Tài",
      role: "Business Analyst (BA)",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      quote: "Hiểu đúng nhu cầu, xây đúng sản phẩm.",
    },
  ];

  return (
    <div className="flex flex-col w-full min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      <main className="flex flex-1 justify-center py-6 sm:py-8 lg:py-12">
        <div className="flex flex-col w-full max-w-screen-xl px-4 sm:px-6 lg:px-8 gap-12">
          {/* --- SECTION 1: HERO / BANNER --- */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-blue-600/5 via-primary/10 to-indigo-500/5 dark:from-surface-dark dark:via-primary/5 dark:to-surface-dark border border-gray-200/50 dark:border-white/5 py-12 px-6 sm:px-12 flex flex-col lg:flex-row items-center gap-10 shadow-sm">
            {/* Glowing background highlights */}
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-blue-400/10 dark:bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
            
            <div className="flex-1 flex flex-col gap-5 text-center lg:text-left">
              <span className="inline-flex w-fit mx-auto lg:mx-0 items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                ✨ Học tập thông minh cùng AI
              </span>
              <h1 className="text-gray-900 dark:text-white text-4xl sm:text-5xl font-black leading-tight tracking-tight">
                {texts.onlineTest || "Chinh phục mọi kỳ thi"}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg max-w-xl leading-relaxed">
                {texts.slogan1 ||
                  "Nền tảng ôn tập và kiểm tra thử hàng đầu giúp bạn đạt điểm số cao nhất."}
              </p>
              
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start mt-2">
                <button 
                  onClick={() => navigate("/exam")}
                  className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
                >
                  Bắt đầu thi thử
                </button>
                <button 
                  onClick={() => navigate("/revision")}
                  className="px-6 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-white font-bold text-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition active:scale-95 cursor-pointer"
                >
                  Ôn tập lý thuyết
                </button>
              </div>
            </div>

            <div className="w-full lg:w-96 flex justify-center z-10">
              <div className="w-full max-w-[400px] bg-white/70 dark:bg-surface-dark/70 backdrop-blur-md border border-white/30 dark:border-white/5 shadow-xl rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700/50 pb-3">
                  <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">🐱</div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Mèo Mascot AI</h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Trợ lý ôn thi dễ thương</p>
                  </div>
                </div>
                <CatMascot />
              </div>
            </div>
          </section>

          {/* --- MAIN GRID LAYOUT --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* CỘT TRÁI (Nội dung chính) */}
            <div className="lg:col-span-2 flex flex-col gap-10">
              {/* SECTION 2: LỘ TRÌNH HỌC TẬP (ĐÃ ẨN MỜ) */}
              <section className="relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {/* --- LỚP PHỦ (OVERLAY) --- */}
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 dark:bg-gray-900/60 backdrop-blur-[2px]">
                  <span className="bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-4 py-2 rounded-full font-bold text-xs sm:text-sm shadow-lg transform -rotate-2">
                    🚀 Tính năng đang phát triển
                  </span>
                </div>

                {/* --- NỘI DUNG BÊN DƯỚI (BỊ LÀM MỜ & KHÓA CLICK) --- */}
                <div className="opacity-40 pointer-events-none select-none grayscale">
                  <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 text-gray-900 dark:text-white">
                    Lộ trình học tập cá nhân
                  </h2>
                  <div className="grid grid-cols-[40px_1fr] gap-x-2 pt-2">
                    {/* Step 1 */}
                    <div className="flex flex-col items-center gap-1 pt-3">
                      <div className="text-blue-600">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      </div>
                      <div className="w-[1.5px] bg-blue-200 dark:bg-blue-900 h-full"></div>
                    </div>
                    <div className="flex flex-1 flex-col py-3">
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        Ôn tập chuyên đề: Hàm số và ứng dụng
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Toán học - 45 phút
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-[1.5px] bg-blue-200 dark:bg-blue-900 h-full"></div>
                      <div className="text-blue-600">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </div>
                      <div className="w-[1.5px] bg-blue-200 dark:bg-blue-900 h-full"></div>
                    </div>
                    <div className="flex flex-1 flex-col py-3">
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        Kiểm tra 15 phút: Khảo sát hàm số
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Toán học - 15 phút
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center gap-1 pb-3">
                      <div className="w-[1.5px] bg-blue-200 dark:bg-blue-900 h-full"></div>
                      <div className="text-gray-400">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col py-3 opacity-60">
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        Làm đề thi thử: Đề thi THPT Quốc gia
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Tổng hợp - 90 phút
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 3: DANH SÁCH MÔN HỌC (Dynamic Data) */}
              <section>
                <div className="flex items-center justify-between px-2 pb-5 pt-2">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    {texts.subjectsTitle || "Ôn tập trắc nghiệm"}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subjects.length > 0 ? (
                    subjects.slice(0, 6).map((item, index) => (
                      <div
                        key={index}
                        onClick={() => navigate(`/list-chapter`, { state: { subjectId: item.subjectId } })}
                        className="flex flex-col gap-4 rounded-2xl p-6 bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700/50 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 dark:hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                      >
                        <div className="flex items-center justify-center size-12 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                          {/* Logic chọn Icon giả lập */}
                          {index % 3 === 0 && (
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                          {index % 3 === 1 && (
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                              />
                            </svg>
                          )}
                          {index % 3 === 2 && (
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 21v-8a2 2 0 012-2h14a2 2 0 012 2v8M3 21h18M3 21l3-3m0 0l-3-3m3 3h12m0 0l3-3m-3 3l3 3"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="flex flex-col flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-primary transition-colors leading-snug mb-1">
                            {item.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {item.totalQuestions} câu hỏi ôn tập
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                      {texts.noSubjects || "Chưa có môn học nào."}
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* CỘT PHẢI (SIDEBAR - ĐÃ ẨN MỜ) */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 relative overflow-hidden rounded-xl">
                {/* --- LỚP PHỦ (OVERLAY) --- */}
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 dark:bg-gray-900/60 backdrop-blur-[2px]">
                  <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-3 py-1 rounded-full text-xs font-bold border border-gray-200 dark:border-gray-600 shadow-sm">
                    Coming Soon...
                  </span>
                </div>

                {/* --- NỘI DUNG SIDEBAR (BỊ LÀM MỜ) --- */}
                <div className="opacity-40 pointer-events-none select-none grayscale">
                  <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] pb-4 pt-2 text-gray-900 dark:text-white">
                    Đang thực hiện
                  </h2>
                  <div className="flex flex-col gap-4">
                    {/* Item 1 */}
                    <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-gray-800 dark:text-white">
                          Đề thi thử THPT QG 2024
                        </p>
                        <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                          Đang làm
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        Môn Toán
                      </p>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                          style={{ width: "45%" }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Hoàn thành 45%
                        </p>
                        <button className="text-sm font-bold text-blue-600 hover:underline">
                          Tiếp tục
                        </button>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-gray-800 dark:text-white">
                          Dao động cơ
                        </p>
                        <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded">
                          Ôn tập
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        Môn Vật Lý
                      </p>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: "80%" }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Hoàn thành 80%
                        </p>
                        <button className="text-sm font-bold text-green-600 hover:underline">
                          Tiếp tục
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
          <section className="flex flex-col items-center justify-center pt-10 pb-6">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                Đội ngũ phát triển
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Chúng tôi là nhóm sinh viên đam mê công nghệ, với sứ mệnh mang
                đến nền tảng ôn tập hiệu quả và miễn phí cho cộng đồng học sinh,
                sinh viên.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/60 dark:border-gray-700/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Decorative Gradient Background for Avatar */}
                  <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/20 to-primary/5 rounded-t-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
 
                  <div className="relative flex flex-col items-center">
                    {/* Avatar */}
                    <div className="relative mb-4">
                      <div className="w-24 h-24 rounded-full p-1 bg-white dark:bg-gray-800 ring-2 ring-primary/20 dark:ring-primary/40">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-2 border-white dark:border-gray-800">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                      </div>
                    </div>
 
                    {/* Info */}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {member.name}
                    </h3>
                    <p className="text-primary font-medium text-sm mb-3 uppercase tracking-wider">
                      {member.role}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center italic">
                      "{member.quote}"
                    </p>
 
                    {/* Social Links (Demo) */}
                    <div className="flex gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <button className="text-gray-400 hover:text-primary transition-colors cursor-pointer">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                        </svg>
                      </button>
                      <button className="text-gray-400 hover:text-primary/80 transition-colors cursor-pointer">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
