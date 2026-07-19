import React from "react";
import { Button, Form, Input, Radio, Typography, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { primaryModalButtonStyle } from "../../../utils/ui/antdModalButtonStyles";
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
      <div style={{ marginBottom: 10 }}>
        <Text strong>Hình thức đính kèm ảnh: </Text>
        <Radio.Group
          value={imageType}
          onChange={handleImageTypeChange}
          buttonStyle="solid"
          style={{ marginLeft: 10 }}
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
            <Button
              type="default"
              icon={<UploadOutlined />}
              loading={uploadingImage}
              style={{ ...primaryModalButtonStyle, width: "100%" }}
            >
              {uploadingImage ? "Đang tải lên..." : "Chọn ảnh để upload"}
            </Button>
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
        <div style={{ marginTop: 10, textAlign: "center" }}>
          <img
            src={resolveMediaUrl(previewImgUrl)}
            alt="Preview"
            style={{
              maxHeight: 100,
              maxWidth: "100%",
              borderRadius: 6,
              border: "1px solid #d9d9d9",
            }}
          />
        </div>
      )}
    </>
  );
};
