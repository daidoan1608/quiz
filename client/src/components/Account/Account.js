import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { authAxios } from "../../api/axiosConfig";
import { useAuth } from "../Context/AuthProvider";
import { useLanguage } from "../Context/LanguageProvider";
import { message } from "antd";
import UserProfileCard from "../User/UserProfileCard";
import ChangePasswordModal from "../modal/ChangePasswordModal";
import ExamHistoryList from "../User/ExamHistoryList";

const Account = () => {
  const [user, setUser] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();
  const { texts } = useLanguage();

  // --- 1. FETCH DATA ---
  const fetchData = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      message.error(texts.noUserId || "Vui lòng đăng nhập lại!");
      navigate("/login");
      return;
    }
    try {
      setLoading(true);
      const [userResponse, examsResponse] = await Promise.all([
        authAxios.get(`user/${userId}`),
        authAxios.get(`user/userexams/user/${userId}`),
      ]);

      // Xử lý dữ liệu User
      setUser(userResponse.data.data);

      // Xử lý dữ liệu Exams
      const examData = examsResponse.data.data || [];
      const validatedExams = examData.map((exam) => ({
        ...exam,
        examId: exam.examId || exam.id || exam.userExamDto?.examId,
        subjectName: exam.subjectName || "Chưa xác định",
        title: exam.title || "Bài thi không tên",
        score: exam.userExamDto?.score || 0,
        startTime: exam.userExamDto?.startTime,
        endTime: exam.userExamDto?.endTime,
      }));
      setExams(validatedExams);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      message.error("Không thể tải thông tin tài khoản.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. HANDLERS ---
  const handleChangePassword = async (values) => {
    const userId = localStorage.getItem("userId");
    try {
      const response = await authAxios.post(
        `user/change-password/${userId}`,
        values
      );
      if (response.data === "Mật khẩu không đúng") {
        message.error(texts.wrongPassword || "Mật khẩu cũ không đúng!");
        return;
      }
      message.success(
        texts.changePasswordSuccess || "Đổi mật khẩu thành công!"
      );
      setShowChangePassword(false);
      logout();
      navigate("/login");
    } catch (error) {
      message.error("Lỗi đổi mật khẩu.");
    }
  };

  // --- SỬA LẠI HÀM NÀY ---
  const handleUploadAvatar = async (fileInput) => {
    // Lưu ý: UserProfileCard gửi lên 'file' trực tiếp, không phải object 'info'
    const file = fileInput;
    const userId = localStorage.getItem("userId");

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setLoading(true);

      // Gọi API Upload
      const response = await authAxios.post(
        `/users/me/avatar/${userId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Lấy URL ảnh mới từ response (cấu trúc tùy thuộc API của bạn trả về)
      const newAvatarUrl = response.data.data;

      // Cập nhật State User ngay lập tức để giao diện hiển thị ảnh mới
      setUser((prevUser) => ({
        ...prevUser,
        avatarUrl: newAvatarUrl
      }));

      // Cập nhật lại localStorage nếu cần thiết để đồng bộ Header
      localStorage.setItem("avatarUrl", newAvatarUrl);

      message.success(texts.uploadAvatarSuccess || "Tải lên avatar thành công!");
    } catch (error) {
      console.error(error);
      message.error("Lỗi tải ảnh lên.");
    } finally {
      setLoading(false);
    }
  };

  // Group Exams by Subject
  const groupedExams = useMemo(() => {
    return exams.reduce((acc, exam) => {
      const subject = exam.subjectName;
      if (!acc[subject]) acc[subject] = [];
      acc[subject].push(exam);
      return acc;
    }, {});
  }, [exams]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-gray-200 p-4 sm:p-6 lg:p-8">
      {/* Modal Đổi Mật Khẩu */}
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onSubmit={handleChangePassword}
        texts={texts}
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* SIDEBAR (Profile Card) - Chiếm 3 cột */}
        <aside className="md:col-span-4 lg:col-span-3">
          <UserProfileCard
            user={user}
            onUploadAvatar={handleUploadAvatar}
            onChangePasswordClick={() => setShowChangePassword(true)}
            onLogout={logout}
            texts={texts}
          />
        </aside>

        {/* MAIN CONTENT (Exam History) - Chiếm 9 cột */}
        <div className="md:col-span-8 lg:col-span-9">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
              <h2 className="text-2xl font-bold">
                {texts.listSubject || "Lịch sử làm bài"}
              </h2>
            </div>

            <ExamHistoryList groupedExams={groupedExams} texts={texts} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;