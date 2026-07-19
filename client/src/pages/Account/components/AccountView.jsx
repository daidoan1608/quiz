import React from 'react';
import { PageContainer } from 'components/common/PageContainer';
import ChangePasswordModal from './ChangePasswordModal';
import PersonalInfo from './PersonalInfo';
import Roadmap from './Roadmap';
import UserProfileCard from './UserProfileCard';
import { ACCOUNT_SECTIONS } from '../constants/accountSections';

export const AccountView = ({
  avatarUrl,
  groupedExams,
  handleChangePassword,
  handleContinueAttempt,
  handleUpdateProfile,
  handleUploadAvatar,
  inProgressAttempts,
  isPersonalSection,
  learningStats,
  savingProfile,
  setActiveSection,
  setShowChangePassword,
  showChangePassword,
  texts,
  user,
}) => (
  <div className="flex flex-1 bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-gray-200">
    <ChangePasswordModal
      isOpen={showChangePassword}
      onClose={() => setShowChangePassword(false)}
      onSubmit={handleChangePassword}
      texts={texts}
    />

    <PageContainer
      as="div"
      className="grid grid-cols-1 gap-8 md:grid-cols-12"
    >
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
              {isPersonalSection
                ? texts.personalInfo || 'Thông tin cá nhân'
                : texts.learningRoadmap || 'Lộ trình học tập'}
            </h2>
          </div>
          {isPersonalSection ? (
            <PersonalInfo
              user={user}
              onSave={handleUpdateProfile}
              saving={savingProfile}
              texts={texts}
            />
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
    </PageContainer>
  </div>
);
