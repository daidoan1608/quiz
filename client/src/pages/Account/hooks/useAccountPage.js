import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appMessage } from 'utils/appMessage';
import { accountApi } from 'api/services/accountApi';
import { authApi } from 'api/services/authApi';
import { useAuth } from 'context/auth/AuthProvider';
import { useLanguage } from 'context/language/LanguageProvider';
import { buildContinueExamAttemptLocation } from 'pages/Subject/utils/subjectNavigation';
import { ACCOUNT_SECTIONS } from '../constants/accountSections';
import {
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

  const { updateAvatar, avatarUrl, authProvider, hasPassword } = useAuth();
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
        authProvider: accountData.user.authProvider || authProvider,
        hasPassword:
          typeof accountData.user.hasPassword === 'boolean'
            ? accountData.user.hasPassword
            : hasPassword,
        avatarUrl: syncedAvatarUrl,
      });
      setExams(normalizeExams(accountData.exams));
      setInProgressAttempts(accountData.inProgressAttempts);
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
      appMessage.error('Không thể tải thông tin tài khoản.');
    } finally {
      setLoading(false);
    }
  }, [authProvider, avatarUrl, hasPassword, requireUserId]);

  useEffect(() => {
    fetchAccountData();
  }, [fetchAccountData]);

  const handleChangePassword = async (values) => {
    const userId = await requireUserId();
    if (!userId) return;

    try {
      const result = await accountApi.changePassword(userId, values);
      if (result === 'Mật khẩu không đúng') {
        appMessage.error(texts.wrongPassword || 'Mật khẩu cũ không đúng!');
        return;
      }

      appMessage.success(
        texts.changePasswordSuccess || 'Đổi mật khẩu thành công!'
      );
      setShowChangePassword(false);
    } catch (error) {
      appMessage.error('Lỗi đổi mật khẩu.');
    }
  };

  const handleSetPassword = async (values) => {
    try {
      await authApi.setPassword(values);
      setUser((prevUser) => ({
        ...prevUser,
        hasPassword: true,
      }));
      appMessage.success(
        'Đã thiết lập mật khẩu thành công. Bạn có thể đăng nhập bằng tài khoản + mật khẩu.'
      );
    } catch (error) {
      appMessage.error('Không thể thiết lập mật khẩu.');
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
      appMessage.success(
        texts.uploadAvatarSuccess || 'Tải lên avatar thành công!'
      );
    } catch (error) {
      console.error(error);
      appMessage.error('Lỗi tải ảnh lên.');
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
      appMessage.success('Cập nhật thông tin cá nhân thành công!');
    } catch (error) {
      console.error('Lỗi cập nhật thông tin:', error);
      appMessage.error('Không thể cập nhật thông tin cá nhân.');
      throw error;
    } finally {
      setSavingProfile(false);
    }
  };

  const handleContinueAttempt = (attempt) => {
    navigate(buildContinueExamAttemptLocation(attempt));
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
    handleSetPassword,
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

