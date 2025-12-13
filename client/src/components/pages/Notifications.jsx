import React, { useState, useEffect } from "react";
import { authAxios } from "../../api/axiosConfig";
import { useNavigate } from "react-router-dom";

// Helper format thời gian
const formatTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Vừa xong";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  // --- 1. GET: Lấy danh sách thông báo ---
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await authAxios.get("/notifications");
      // API trả về mảng trực tiếp hoặc object { data: [...] }
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setNotifications(data);
    } catch (error) {
      console.error("Lỗi khi tải thông báo:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // --- 2. XỬ LÝ CLICK (Đọc & Điều hướng) ---
  const handleNotificationClick = async (notif) => {
    // 1. Đánh dấu đã đọc nếu chưa đọc
    if (!notif.isRead) {
      try {
        await authAxios.put(`/notifications/${notif.id}/read`);
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notif.id ? { ...item, isRead: true } : item
          )
        );
      } catch (error) {
        console.error("Lỗi đánh dấu đã đọc:", error);
      }
    }

    // 2. Điều hướng dựa trên relatedType
    if (notif.relatedType === "EXAM" && notif.relatedId) {
      // Ví dụ: Chuyển hướng đến trang chi tiết đề thi (sửa đường dẫn theo project của bạn)
      navigate(`/exams/${notif.relatedId}`);
    }
    // Các logic điều hướng khác (nếu có)
  };

  // --- 3. ĐÁNH DẤU TẤT CẢ ĐÃ ĐỌC ---
  const handleMarkAllAsRead = async () => {
    try {
      await authAxios.put("/notifications/read-all");
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error("Lỗi mark all read:", error);
    }
  };

  // --- LOGIC UI ---

  // Lọc thông báo
  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notif.isRead;

    // Lọc theo loại nghiệp vụ (relatedType)
    if (filter === "EXAM") return notif.relatedType === "EXAM";
    if (filter === "SYSTEM") return notif.relatedType === "SYSTEM";
    if (filter === "MSG") return ["PERSONAL_MSG", "BATCH_MSG"].includes(notif.relatedType);

    return true;
  });

  // Chọn icon dựa trên relatedType
  const getIconInfo = (relatedType) => {
    switch (relatedType) {
      case "EXAM":
        return { icon: "assignment", color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30", label: "Đề thi" };
      case "SYSTEM":
        return { icon: "dns", color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30", label: "Hệ thống" };
      case "PERSONAL_MSG":
        return { icon: "person", color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30", label: "Cá nhân" };
      case "BATCH_MSG":
        return { icon: "groups", color: "text-green-600 bg-green-100 dark:bg-green-900/30", label: "Thông báo lớp" };
      default:
        return { icon: "notifications", color: "text-gray-600 bg-gray-200 dark:bg-gray-800", label: "Thông báo" };
    }
  };

  // Định nghĩa các Tabs bộ lọc
  const filterTabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'unread', label: 'Chưa đọc' },
    { id: 'EXAM', label: 'Đề thi' },
    { id: 'SYSTEM', label: 'Hệ thống' },
    { id: 'MSG', label: 'Tin nhắn' },
  ];

  return (
      <main className="flex flex-1 justify-center py-6 px-4">
        <div className="flex flex-col w-full max-w-3xl gap-6">

          {/* Title & Button Mark All */}
          <div className="flex flex-wrap justify-between items-center gap-4">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Cập nhật mới
            </h2>
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-bold text-gray-800 dark:text-gray-200"
            >
              <span className="material-symbols-outlined text-lg">done_all</span>
              <span>Đọc tất cả</span>
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {filterTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filter === tab.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notification List */}
          <div className="flex flex-col bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            {loading ? (
               <div className="p-10 text-center text-gray-500">Đang tải dữ liệu...</div>
            ) : filteredNotifications.length === 0 ? (
               <div className="flex flex-col items-center justify-center p-10 text-gray-400 gap-2">
                 <span className="material-symbols-outlined text-5xl opacity-50">notifications_off</span>
                 <p>Không có thông báo nào.</p>
               </div>
            ) : (
              filteredNotifications.map((notif, index) => {
                const isUnread = !notif.isRead;
                const { icon, color, label } = getIconInfo(notif.relatedType);

                return (
                  <div key={notif.id}>
                    <div
                      className={`relative flex gap-4 p-4 transition-all cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 ${isUnread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      {/* Indicator Bar for Unread */}
                      {isUnread && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
                      )}

                      {/* Icon */}
                      <div className={`shrink-0 flex items-center justify-center size-12 rounded-full ${color}`}>
                        <span className="material-symbols-outlined">{icon}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <p className={`text-base truncate pr-2 text-gray-900 dark:text-white ${isUnread ? 'font-bold' : 'font-medium'}`}>
                            {notif.title}
                          </p>
                          <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                            {formatTime(notif.createdAt)}
                          </span>
                        </div>

                        <p className={`text-sm text-gray-600 dark:text-gray-300 line-clamp-2 ${isUnread ? 'font-medium' : 'font-normal'}`}>
                          {notif.message}
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                             {label}
                          </span>
                        </div>
                      </div>

                      {/* Unread Dot (Mobile/Visual aid) */}
                      {isUnread && (
                        <div className="shrink-0 pt-2">
                           <div className="size-2.5 bg-blue-600 rounded-full ring-2 ring-white dark:ring-gray-900"></div>
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    {index < filteredNotifications.length - 1 && (
                      <hr className="border-gray-100 dark:border-gray-800 mx-4" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
  );
}