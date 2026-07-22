import React from "react";
import { Form, Input, Radio, Typography, Upload } from "antd";
import { AdminUploadButton } from "../../../components/common/buttons/AdminButtons";
import { resolveMediaUrl } from "../../../utils/mediaUrl";

const { Text } = Typography;

export const QuestionImageField = ({
  form,
  imageType,
  setImageType,
  previewImgUrl,
  setPreviewImgUrl,
  uploadingImage,
  handleUploadImage,
}) => {
  const handleImageTypeChange = (event) => {
    setImageType(event.target.value);
    form.setFieldsValue({ imageUrl: "" });
    setPreviewImgUrl("");
  };

  return (
    <>
      <div className="question-image-field__mode">
        <Text strong>Hình thức đính kèm ảnh: </Text>
        <Radio.Group
          className="question-image-field__mode-control"
          value={imageType}
          onChange={handleImageTypeChange}
          buttonStyle="solid"
        >
          <Radio.Button value="upload">Upload tệp</Radio.Button>
          <Radio.Button value="url">Nhập Link ảnh</Radio.Button>
        </Radio.Group>
      </div>

      {imageType === "upload" ? (
        <Form.Item
          label="Chọn tệp ảnh minh họa"
          extra="Chấp nhận tệp .png, .jpg, .jpeg"
        >
          <Upload
            accept="image/*"
            customRequest={handleUploadImage}
            maxCount={1}
            showUploadList={false}
          >
            <AdminUploadButton
              loading={uploadingImage}
              className="question-image-field__upload-button"
            >
              {uploadingImage ? "Đang tải lên..." : "Chọn ảnh để upload"}
            </AdminUploadButton>
          </Upload>
          <Form.Item name="imageUrl" noStyle>
            <Input type="hidden" />
          </Form.Item>
        </Form.Item>
      ) : (
        <Form.Item label="Đường dẫn ảnh minh họa (tùy chọn)" name="imageUrl">
          <Input
            placeholder="Nhập URL ảnh (ví dụ: /avatars/q_123.png hoặc link internet)"
            onChange={(event) => setPreviewImgUrl(event.target.value)}
          />
        </Form.Item>
      )}

      {previewImgUrl && (
        <div className="question-image-field__preview">
          <img
            className="question-image-field__preview-image"
            src={resolveMediaUrl(previewImgUrl)}
            alt="Preview"
          />
        </div>
      )}
    </>
  );
};
