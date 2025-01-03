import React, { useState } from 'react';
import { LoadingOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { message, Upload, Button, Modal } from 'antd';

const getBase64 = (img, callback) => {
  const reader = new FileReader(); // Tạo một đối tượng FileReader để đọc file
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
};

//kiểm tra trước khi ảnh được upload
const beforeUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('Chỉ hỗ trợ định dạng JPG/PNG!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Dung lượng ảnh không được vượt quá 2MB!');
  }
  return isJpgOrPng && isLt2M;
};

//component chính
const UploadImage = () => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  const handleChange = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      setError(null);
      return;
    }
    if (info.file.status === 'done') {
      const response = info.file.response;
      if (response && response.url) {
        setImageUrl(response.url); // URL trả về từ API
        message.success('Tải ảnh thành công!');
      } else {
        message.error('Lỗi khi tải ảnh!');
      }
      setLoading(false);
    }
    if (info.file.status === 'error') {
      message.error('Lỗi trong quá trình tải lên.');
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setImageUrl(null);
    message.success('Ảnh đã được xóa.');
  };

  const uploadButton = (
    <div style={{ textAlign: 'center', cursor: 'pointer' }}>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <div style={{ textAlign: 'center', marginTop: 20 }}>
      <Upload
        name="avatar"
        listType="picture-circle"
        className="avatar-uploader"
        showUploadList={false}
        action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload" // Thay bằng API thực tế
        beforeUpload={beforeUpload}
        onChange={handleChange}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="avatar"
            style={{
              width: '100%',
              borderRadius: '50%',
              objectFit: 'cover',
            }}
            onClick={() => setPreviewVisible(true)} // Click để xem trước
          />
        ) : (
          uploadButton
        )}
      </Upload>

      {imageUrl && (
        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          style={{ marginTop: 10 }}
          onClick={handleRemove}
        >
          Xóa ảnh
        </Button>
      )}

      {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}

      {/* Modal xem trước ảnh */}
      <Modal
        visible={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        centered
      >
        <img alt="preview" style={{ width: '100%' }} src={imageUrl} />
      </Modal>
    </div>
  );
};

export default UploadImage;
