import React, { useState } from 'react'; // Import React và hook useState để quản lý trạng thái
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'; // Import các icon từ Ant Design
import { Flex, message, Upload } from 'antd'; // Import các component cần thiết từ Ant Design

// Hàm chuyển đổi ảnh sang Base64
const getBase64 = (img, callback) => {
  const reader = new FileReader(); // Tạo một FileReader để đọc file
  reader.addEventListener('load', () => callback(reader.result)); // Khi đọc xong, gọi callback với kết quả Base64
  reader.readAsDataURL(img); // Đọc file dưới dạng DataURL
};

// Hàm kiểm tra trước khi upload
const beforeUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'; // Kiểm tra định dạng ảnh có phải JPG hoặc PNG không
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!'); // Hiển thị thông báo lỗi nếu không đúng định dạng
  }
  const isLt2M = file.size / 1024 / 1024 < 2; // Kiểm tra kích thước ảnh có nhỏ hơn 2MB không
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!'); // Hiển thị thông báo lỗi nếu ảnh lớn hơn 2MB
  }
  return isJpgOrPng && isLt2M; // Chỉ cho phép upload nếu cả hai điều kiện đều đúng
};

// Component chính
const UploadImage = () => {
  const [loading, setLoading] = useState(false); // Trạng thái để hiển thị biểu tượng tải khi đang upload
  const [imageUrl, setImageUrl] = useState(null); // Trạng thái lưu URL của ảnh đã upload

  // Hàm xử lý khi trạng thái upload thay đổi
  const handleChange = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true); // Nếu đang upload, bật trạng thái loading
      return;
    }
    if (info.file.status === 'done') {
      // Nếu upload thành công, lấy URL của file
      getBase64(info.file.originFileObj, (url) => {
        setLoading(false); // Tắt trạng thái loading
        setImageUrl(url); // Lưu URL ảnh vào state
      });
    }
  };

  // Nút upload (hiển thị khi chưa có ảnh hoặc đang tải)
  const uploadButton = (
    <div
      style={{
        textAlign: 'center',
        cursor: 'pointer',
      }}
    >
      {loading ? <LoadingOutlined /> : <PlusOutlined />} {/* Hiển thị icon tải hoặc thêm tùy trạng thái */}
      <div
        style={{
          marginTop: 8, // Cách phần chữ "Upload" so với icon
        }}
      >
        Upload {/* Văn bản hiển thị trên nút */}
      </div>
    </div>
  );

  return (
    <Flex gap="middle" wrap> {/* Flexbox để căn chỉnh các phần tử */}

      {/* Component upload với kiểu "picture-circle" */}
      <Upload
        name="avatar" // Tên của file khi gửi lên server
        listType="picture-circle" // Kiểu hiển thị upload
        className="avatar-uploader" // Lớp CSS
        showUploadList={false} // Ẩn danh sách file đã upload
        action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload" // API upload
        beforeUpload={beforeUpload} // Kiểm tra file trước khi upload
        onChange={handleChange} // Hàm xử lý khi trạng thái upload thay đổi
      >
        {imageUrl ? (
          <img
            src={imageUrl} // URL của ảnh đã upload
            alt="avatar" // Thuộc tính thay thế
            style={{
              width: '100%', // Chiều rộng ảnh là 100% của khung
              borderRadius: '50%', // Viền bo tròn hoàn toàn để tạo hình tròn
            }}
          />
        ) : (
          uploadButton // Hiển thị nút upload nếu chưa có ảnh
        )}
      </Upload>
    </Flex>
  );
};

export default UploadImage; // Xuất component để sử dụng ở nơi khác
