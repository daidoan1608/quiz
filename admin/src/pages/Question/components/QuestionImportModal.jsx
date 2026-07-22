import React from 'react';
import {
  Form,
  Divider,
} from "antd";
import { ImportOutlined } from "@ant-design/icons";
import {
  AdminCheckButton,
  AdminImportButton,
} from "../../../components/common/buttons/AdminButtons";
import AdminModalFormShell from "../../../components/common/modal/AdminModalFormShell";
import { useQuestionImport } from "../hooks/useQuestionImport";
import {
  QuestionImportClassificationFields,
  QuestionImportInfoAlert,
  QuestionImportPreviewAlert,
  QuestionImportUploadField,
} from "./QuestionImportFormParts";

const QuestionImportModal = ({ isModalOpen, onCancel, onSuccess }) => {
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
  } = useQuestionImport({ isModalOpen, onCancel, onSuccess });

  return (
    <AdminModalFormShell
      title="Import Câu Hỏi"
      icon={<ImportOutlined />}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      width={700}
      centered
      maskClosable={false}
    >
      <QuestionImportInfoAlert compact />

      <Divider orientation="left">Thông tin phân loại</Divider>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleUpload}
        size="large"
      >
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
        <QuestionImportPreviewAlert maxErrors={20} previewResult={previewResult} />

        <div className="admin-form-actions admin-form-actions--spaced">
          <AdminCheckButton
            loading={previewLoading}
            size="large"
            onClick={handlePreview}
          >
            Kiểm tra file
          </AdminCheckButton>
          <AdminImportButton
            htmlType="submit"
            loading={loading}
            size="large"
            disabled={(isChaptersEmpty && chapters.length === 0) || previewResult?.invalidRows > 0}
          >
            Bắt đầu Upload
          </AdminImportButton>
        </div>
      </Form>
    </AdminModalFormShell>
  );
};

export default QuestionImportModal;
