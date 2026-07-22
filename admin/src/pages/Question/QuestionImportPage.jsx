import React from "react";
import {
  Divider,
  Form,
} from "antd";
import { ImportOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  AdminCancelButton,
  AdminCheckButton,
  AdminImportButton,
} from "../../components/common/buttons/AdminButtons";
import AdminFormSection from "../../components/common/forms/AdminFormSection";
import AdminFormPageLayout from "../../components/common/layout/AdminFormPageLayout";
import { useQuestionImport } from "./hooks/useQuestionImport";
import {
  QuestionImportClassificationFields,
  QuestionImportInfoAlert,
  QuestionImportPreviewAlert,
  QuestionImportUploadField,
} from "./components/QuestionImportFormParts";

const QuestionImportPage = () => {
  const navigate = useNavigate();
  const goBack = () => navigate("/questions");
  const {
    form,
    categories,
    subjects,
    chapters,
    loading,
    previewLoading,
    selectedFile,
    previewResult,
    isChaptersEmpty,
    uploadProps,
    handleCategoryChange,
    handleSubjectChange,
    handlePreview,
    handleUpload,
    handleCancel,
  } = useQuestionImport({
    isModalOpen: true,
    onCancel: goBack,
    onSuccess: goBack,
  });

  return (
    <AdminFormPageLayout
      onBack={handleCancel}
      title={<><ImportOutlined /> Import câu hỏi</>}
    >
      <AdminFormSection size="default">
        <QuestionImportInfoAlert />

        <Form form={form} layout="vertical" onFinish={handleUpload} size="large">
          <Divider orientation="left">Thông tin phân loại</Divider>
          <QuestionImportClassificationFields
            categories={categories}
            chapters={chapters}
            handleCategoryChange={handleCategoryChange}
            handleSubjectChange={handleSubjectChange}
            isChaptersEmpty={isChaptersEmpty}
            subjects={subjects}
          />

          <Divider orientation="left">Chọn tập tin</Divider>
          <QuestionImportUploadField selectedFile={selectedFile} uploadProps={uploadProps} />
          <QuestionImportPreviewAlert previewResult={previewResult} />

          <div className="admin-form-actions admin-form-actions--spaced">
            <AdminCancelButton onClick={handleCancel} />
            <AdminCheckButton
              loading={previewLoading}
              onClick={handlePreview}
            >
              Kiểm tra file
            </AdminCheckButton>
            <AdminImportButton
              htmlType="submit"
              loading={loading}
              disabled={(isChaptersEmpty && chapters.length === 0) || previewResult?.invalidRows > 0}
            >
              Bắt đầu import
            </AdminImportButton>
          </div>
        </Form>
      </AdminFormSection>
    </AdminFormPageLayout>
  );
};

export default QuestionImportPage;
