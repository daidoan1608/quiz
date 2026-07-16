import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { accountApi } from "api/accountApi";
import { authApi } from "api/authApi";
import { useAuth } from "context/AuthProvider";
import { useLanguage } from "context/LanguageProvider";
import ChangePasswordModal from "./components/ChangePasswordModal";
import UserProfileCard from "./components/UserProfileCard";
import PersonalInfo from "./components/PersonalInfo";
import Roadmap from "./components/Roadmap";
import {
  ACCOUNT_SECTIONS,
  buildLearningStats,
  buildExamAttemptLocation,
  buildProfilePayload,
  getCurrentUserId,
  groupExamsBySubject,
  normalizeExams,
  resolveAvatarUrl,
} from "./utils/accountUtils";

const Account = () => {
  const [user, setUser] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [activeSection, setActiveSection] = useState(ACCOUNT_SECTIONS.PERSONAL);
  const [inProgressAttempts, setInProgressAttempts] = useState([]);
  const [savingProfile, setSavingProfile] = useState(false);

  const { logout, updateAvatar, avatarUrl } = useAuth();
  const navigate = useNavigate();
  const { texts } = useLanguage();

  const requireUserId = useCallback(async () => {
    let currentUser = null;
    try {
      currentUser = await authApi.getCurrentUser();
    } catch (error) {
      localStorage.removeItem("userId");
      localStorage.removeItem("fullName");
      localStorage.removeItem("avatarUrl");
      message.error(texts.noUserId || "Vui lòng đăng nhập lại!");
      navigate("/login");
      return null;
    }
    const userId = currentUser?.userId || getCurrentUserId();
    if (!userId) {
      message.error(texts.noUserId || "Vui lòng đăng nhập lại!");
      navigate("/login");
    }
    if (currentUser?.userId) {
      localStorage.setItem("userId", currentUser.userId);
      localStorage.setItem("fullName", currentUser.fullName || "");
      localStorage.setItem("avatarUrl", currentUser.avatarUrl || "");
    }
    return userId;
  }, [navigate, texts.noUserId]);

  const fetchAccountData = useCallback(async () => {
    const userId = await requireUserId();
    if (!userId) return;

    try {
      setLoading(true);
      const accountData = await accountApi.getOverview(userId);
      const syncedAvatarUrl = resolveAvatarUrl({
        userData: accountData.user,
        avatarUrl,
      });

      setUser({
        ...accountData.user,
        avatarUrl: syncedAvatarUrl,
      });
      setExams(normalizeExams(accountData.exams));
      setInProgressAttempts(accountData.inProgressAttempts);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      message.error("Không thể tải thông tin tài khoản.");
    } finally {
      setLoading(false);
    }
  }, [avatarUrl, requireUserId]);

  useEffect(() => {
    fetchAccountData();
  }, [fetchAccountData]);

  const handleChangePassword = async (values) => {
    const userId = await requireUserId();
    if (!userId) return;

    try {
      const result = await accountApi.changePassword(userId, values);
      if (result === "Mật khẩu không đúng") {
        message.error(texts.wrongPassword || "Mật khẩu cũ không đúng!");
        return;
      }

      message.success(texts.changePasswordSuccess || "Đổi mật khẩu thành công!");
      setShowChangePassword(false);
      logout();
      navigate("/login");
    } catch (error) {
      message.error("Lỗi đổi mật khẩu.");
    }
  };

  const handleUploadAvatar = async (fileInput) => {
    const formData = new FormData();
    formData.append("file", fileInput);

    try {
      setLoading(true);
      const newAvatarUrl = await accountApi.uploadAvatar(formData);

      setUser((prevUser) => ({
        ...prevUser,
        avatarUrl: newAvatarUrl,
      }));

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
    const userId = await requireUserId();
    if (!userId) return;

    try {
      setSavingProfile(true);
      const payload = buildProfilePayload(profileValues);
      const updatedUser = await accountApi.updateProfile(userId, payload);

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

  const handleContinueAttempt = (attempt) => {
    navigate(buildExamAttemptLocation(attempt));
  };

  const groupedExams = useMemo(() => groupExamsBySubject(exams), [exams]);
  const learningStats = useMemo(() => buildLearningStats(exams), [exams]);
  const isPersonalSection = activeSection === ACCOUNT_SECTIONS.PERSONAL;

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-gray-200 p-4 sm:p-6 lg:p-8">
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onSubmit={handleChangePassword}
        texts={texts}
      />

      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        <aside className="md:col-span-4 lg:col-span-3">
          <UserProfileCard
            user={user}
            avatarUrl={avatarUrl}
            onUploadAvatar={handleUploadAvatar}
            onPersonalInfoClick={() => setActiveSection(ACCOUNT_SECTIONS.PERSONAL)}
            onRoadmapClick={() => setActiveSection(ACCOUNT_SECTIONS.ROADMAP)}
            onChangePasswordClick={() => setShowChangePassword(true)}
            texts={texts}
          />
        </aside>

        <div className="md:col-span-8 lg:col-span-9">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
              <h2 className="text-2xl font-bold">
                {isPersonalSection ? texts.personalInfo || "Thông tin cá nhân" : texts.learningRoadmap || "Lộ trình học tập"}
              </h2>
            </div>
            {isPersonalSection ? (
              <PersonalInfo user={user} onSave={handleUpdateProfile} saving={savingProfile} texts={texts} />
            ) : (
              <Roadmap
                groupedExams={groupedExams}
                inProgressAttempts={inProgressAttempts}
                learningStats={learningStats}
                texts={texts}
                onContinueAttempt={handleContinueAttempt}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
