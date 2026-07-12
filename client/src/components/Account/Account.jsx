import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { authAxios } from "../../api/axiosConfig";
import { useAuth } from "../../context/AuthProvider";
import { useLanguage } from "../../context/LanguageProvider";
import { message } from "antd";
import UserProfileCard from "../User/UserProfileCard";
import ChangePasswordModal from "../Modal/ChangePasswordModal";
import ExamHistoryList from "../User/ExamHistoryList";

const Account = () => {
  const [user, setUser] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [activeSection, setActiveSection] = useState("roadmap");
  const [inProgressAttempts, setInProgressAttempts] = useState([]);
  const [savingProfile, setSavingProfile] = useState(false);

  const { logout, updateAvatar, avatarUrl } = useAuth();
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
      const [userResponse, examsResponse, inProgressResponse] = await Promise.all([
        authAxios.get(`users/${userId}`),
        authAxios.get(`users/${userId}/user-exams`),
        authAxios.get(`users/${userId}/exam-attempts/in-progress`).catch(() => ({ data: { data: [] } })),
      ]);

      // Xử lý dữ liệu User và đồng bộ avatar từ localStorage/AuthContext nếu API chưa trả về avatar
      const userData = userResponse.data.data || {};
      const storedAvatarUrl = localStorage.getItem("avatarUrl");
      const syncedAvatarUrl = userData.avatarUrl || avatarUrl || storedAvatarUrl || "";
      setUser({
        ...userData,
        avatarUrl: syncedAvatarUrl,
      });

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
      setInProgressAttempts(inProgressResponse.data?.data || []);
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
      const response = await authAxios.patch(
        `users/${userId}/password`,
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

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      // Gọi API Upload
      const response = await authAxios.put(
        `/users/me/avatar`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Lấy URL ảnh mới từ response (cấu trúc tùy thuộc API của bạn trả về)
      const newAvatarUrl = response.data.avatarUrl || response.data.data?.avatarUrl || response.data.data || "";

      // Cập nhật State User ngay lập tức để giao diện hiển thị ảnh mới
      setUser((prevUser) => ({
        ...prevUser,
        avatarUrl: newAvatarUrl
      }));

      // Cập nhật lại localStorage nếu cần thiết để đồng bộ Header
      if (newAvatarUrl) {
        updateAvatar(newAvatarUrl);
      }
      message.success(texts.uploadAvatarSuccess || "Tải lên avatar thành công!");
    } catch (error) {
      console.error(error);
      message.error("Lỗi tải ảnh lên.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (profileValues) => {
    const userId = localStorage.getItem("userId");
    try {
      setSavingProfile(true);
      const payload = {
        fullName: profileValues.fullName?.trim(),
        email: profileValues.email?.trim(),
        phone: profileValues.phone?.trim(),
        address: profileValues.address?.trim(),
      };
      const response = await authAxios.patch(`users/${userId}`, payload);
      const updatedUser = response.data?.data || response.data || payload;
      setUser((prevUser) => ({
        ...prevUser,
        ...updatedUser,
        avatarUrl: updatedUser.avatarUrl || prevUser?.avatarUrl,
      }));
      message.success("Cập nhật thông tin cá nhân thành công!");
    } catch (error) {
      console.error("Lỗi cập nhật thông tin:", error);
      message.error("Không thể cập nhật thông tin cá nhân.");
      throw error;
    } finally {
      setSavingProfile(false);
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
      <div className="flex flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-gray-200 p-4 sm:p-6 lg:p-8">
      {/* Modal Đổi Mật Khẩu */}
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onSubmit={handleChangePassword}
        texts={texts}
      />

      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* SIDEBAR (Profile Card) - Chiếm 3 cột */}
        <aside className="md:col-span-4 lg:col-span-3">
          <UserProfileCard
             user={user}
             avatarUrl={avatarUrl}
            onUploadAvatar={handleUploadAvatar}
            onPersonalInfoClick={() => setActiveSection("personal")}
            onRoadmapClick={() => setActiveSection("roadmap")}
            onChangePasswordClick={() => setShowChangePassword(true)}
            texts={texts}
          />
        </aside>

        {/* MAIN CONTENT (Exam History) - Chiếm 9 cột */}
        <div className="md:col-span-8 lg:col-span-9">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
              <h2 className="text-2xl font-bold">
                {activeSection === "personal" ? texts.personalInfo || "Thông tin cá nhân" : texts.learningRoadmap || "Lộ trình học tập"}
              </h2>
            </div>
            {activeSection === "personal" ? (
              <PersonalInfo user={user} onSave={handleUpdateProfile} saving={savingProfile} texts={texts} />
            ) : (
              <Roadmap
                groupedExams={groupedExams}
                inProgressAttempts={inProgressAttempts}
                texts={texts}
                navigate={navigate}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PersonalInfo = ({ user, onSave, saving, texts }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  useEffect(() => {
    setFormValues({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
  }, [user]);

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formValues);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormValues({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
    setIsEditing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-700/30">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
          <span className="material-symbols-outlined text-primary">person</span>
          {texts.personalInfo || "Thông tin cá nhân"}
        </h3>
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary/90"
          >
            {texts.edit || "Chỉnh sửa"}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-100 disabled:opacity-60 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              {texts.cancel || "Hủy"}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary/90 disabled:opacity-60"
            >
              {saving ? texts.saving || "Đang lưu..." : texts.save || "Lưu"}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {isEditing ? (
          <>
            <EditableInfoItem label={texts.fullName || "Họ tên"} value={formValues.fullName} onChange={(value) => handleChange("fullName", value)} required />
            <InfoItem label={texts.name || "Tên đăng nhập"} value={user?.username} texts={texts} />
            <EditableInfoItem label={texts.email || "Email"} type="email" value={formValues.email} onChange={(value) => handleChange("email", value)} />
            <InfoItem label={texts.role || "Vai trò"} value={user?.role} texts={texts} />
            <EditableInfoItem label={texts.tel || "Số điện thoại"} value={formValues.phone} onChange={(value) => handleChange("phone", value)} placeholder={texts.enterPhone || "Nhập số điện thoại"} />
            <EditableInfoItem label={texts.address || "Địa chỉ"} value={formValues.address} onChange={(value) => handleChange("address", value)} placeholder={texts.enterAddress || "Nhập địa chỉ"} />
          </>
        ) : (
          <>
            <InfoItem label={texts.fullName || "Họ tên"} value={user?.fullName || user?.username} texts={texts} />
            <InfoItem label={texts.name || "Tên đăng nhập"} value={user?.username} texts={texts} />
            <InfoItem label={texts.email || "Email"} value={user?.email} texts={texts} />
            <InfoItem label={texts.role || "Vai trò"} value={user?.role} texts={texts} />
            <InfoItem label={texts.tel || "Số điện thoại"} value={user?.phone} texts={texts} />
            <InfoItem label={texts.address || "Địa chỉ"} value={user?.address} texts={texts} />
          </>
        )}
      </div>
    </form>
  );
};

const Roadmap = ({ groupedExams, inProgressAttempts, texts, navigate }) => {
  const attemptedSubjects = Object.keys(groupedExams);

  const getAttemptProgress = (attempt) => {
    const total = Number(attempt.totalQuestions) || 0;
    const answered = Number(attempt.answeredCount) || 0;
    return total > 0 ? Math.min(100, Math.round((answered / total) * 100)) : 0;
  };

  const continueAttempt = (attempt) => {
    navigate(`/subjects/${attempt.subjectId}/exams/${attempt.examId}`, {
      state: {
        subjectId: attempt.subjectId,
        examId: attempt.examId,
        title: attempt.title,
      },
    });
  };

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900/40 dark:bg-amber-900/10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <span className="material-symbols-outlined text-amber-500">pending_actions</span>
            {texts.inProgressExams || "Bài đang làm dở"}
          </h3>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-amber-700 shadow-sm dark:bg-gray-800 dark:text-amber-300">
            {inProgressAttempts.length} {texts.examAttemptUnit || "bài"}
          </span>
        </div>

        {inProgressAttempts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {inProgressAttempts.map((attempt) => {
              const progress = getAttemptProgress(attempt);
              return (
                <div key={attempt.attemptId || attempt.userExamId || attempt.examId} className="rounded-xl border border-amber-100 bg-white p-4 shadow-sm dark:border-amber-900/30 dark:bg-gray-800">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h4 className="line-clamp-2 font-bold text-gray-900 dark:text-white">
                        {attempt.title || texts.inProgressExamFallback || "Bài thi đang làm"}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {attempt.subjectName || texts.unknownSubject || "Chưa xác định môn học"}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                      {progress}%
                    </span>
                  </div>
                  <div className="mb-4 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: `${progress}%` }} />
                  </div>
                  <button
                    onClick={() => continueAttempt(attempt)}
                    className="w-full rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-600 active:scale-95"
                  >
                    {texts.continueExam || "Tiếp tục làm bài"}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-amber-200 bg-white p-6 text-center text-gray-500 dark:border-amber-900/30 dark:bg-gray-800 dark:text-gray-400">
            {texts.noInProgressExams || "Không có bài thi nào đang làm dở."}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <span className="material-symbols-outlined text-primary">school</span>
            {texts.attemptedSubjects || "Môn đã thi"}
          </h3>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            {attemptedSubjects.length} {texts.subjectUnit || "môn"}
          </span>
        </div>
        <ExamHistoryList groupedExams={groupedExams} texts={texts} />
      </section>
    </div>
  );
};

const EditableInfoItem = ({ label, value, onChange, type = "text", placeholder, required = false }) => (
  <label className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {label}
    </span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
    />
  </label>
);

const InfoItem = ({ label, value, texts }) => (
  <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {label}
    </p>
    <p className="mt-1 break-words text-sm font-medium text-gray-900 dark:text-white">
      {value || texts?.notUpdated || "Chưa cập nhật"}
    </p>
  </div>
);

export default Account;
