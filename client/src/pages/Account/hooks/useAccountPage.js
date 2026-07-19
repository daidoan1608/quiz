import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { accountApi } from 'api/services/accountApi';
import { useAuth } from 'context/auth/AuthProvider';
import { useLanguage } from 'context/language/LanguageProvider';
import { ACCOUNT_SECTIONS } from '../constants/accountSections';
import {
  buildExamAttemptLocation,
  buildAvatarFormData,
  buildLearningStats,
  buildProfilePayload,
  groupExamsBySubject,
  mergeUpdatedUser,
  normalizeExams,
  resolveAvatarUrl,
} from '../utils/accountUtils';
import { useRequireAccountUser } from './useRequireAccountUser';

export const useAccountPage = () => {
  const [user, setUser] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [activeSection, setActiveSection] = useState(ACCOUNT_SECTIONS.PERSONAL);
  const [inProgressAttempts, setInProgressAttempts] = useState([]);
  const [savingProfile, setSavingProfile] = useState(false);

  const { updateAvatar, avatarUrl } = useAuth();
  const navigate = useNavigate();
  const { texts } = useLanguage();
  const requireUserId = useRequireAccountUser({
    navigate,
  });

  const fetchAccountData = useCallback(async () => {
    const userId = await requireUserId();
    if (!userId) {
      setLoading(false);
      return;
    }

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
      console.error('Lỗi tải dữ liệu:', error);
      message.error('Không thể tải thông tin tài khoản.');
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
      if (result === 'Mật khẩu không đúng') {
        message.error(texts.wrongPassword || 'Mật khẩu cũ không đúng!');
        return;
      }

      message.success(
        texts.changePasswordSuccess || 'Đổi mật khẩu thành công!'
      );
      setShowChangePassword(false);
    } catch (error) {
      message.error('Lỗi đổi mật khẩu.');
    }
  };

  const handleUploadAvatar = async (fileInput) => {
    try {
      setLoading(true);
      const newAvatarUrl = await accountApi.uploadAvatar(
        buildAvatarFormData(fileInput)
      );

      setUser((prevUser) => ({
        ...prevUser,
        avatarUrl: newAvatarUrl,
      }));

      if (newAvatarUrl) {
        updateAvatar(newAvatarUrl);
      }
      message.success(
        texts.uploadAvatarSuccess || 'Tải lên avatar thành công!'
      );
    } catch (error) {
      console.error(error);
      message.error('Lỗi tải ảnh lên.');
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

      setUser((prevUser) => mergeUpdatedUser(prevUser, updatedUser));
      message.success('Cập nhật thông tin cá nhân thành công!');
    } catch (error) {
      console.error('Lỗi cập nhật thông tin:', error);
      message.error('Không thể cập nhật thông tin cá nhân.');
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

  return {
    activeSection,
    avatarUrl,
    groupedExams,
    handleChangePassword,
    handleContinueAttempt,
    handleUpdateProfile,
    handleUploadAvatar,
    inProgressAttempts,
    isPersonalSection,
    learningStats,
    loading,
    savingProfile,
    setActiveSection,
    setShowChangePassword,
    showChangePassword,
    texts,
    user,
  };
};
