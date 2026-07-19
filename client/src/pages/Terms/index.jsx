import React from 'react';
import { LegalPageLayout } from 'pages/Legal/components/LegalPageLayout';

const sections = [
  {
    title: '1. Chấp nhận điều khoản',
    content:
      'Khi truy cập và sử dụng QuizVNUA, bạn đồng ý tuân thủ các điều khoản sử dụng này. Nếu không đồng ý, vui lòng ngừng sử dụng nền tảng.',
  },
  {
    title: '2. Mục đích sử dụng',
    content:
      'QuizVNUA được xây dựng nhằm hỗ trợ sinh viên ôn tập, luyện đề trắc nghiệm và theo dõi kết quả học tập. Người dùng không được sử dụng hệ thống cho các hành vi gian lận, phá hoại, phát tán nội dung độc hại hoặc vi phạm pháp luật.',
  },
  {
    title: '3. Tài khoản người dùng',
    content:
      'Bạn chịu trách nhiệm bảo mật thông tin đăng nhập của mình và các hoạt động phát sinh từ tài khoản. Hãy thông báo cho quản trị viên nếu phát hiện truy cập bất thường hoặc nghi ngờ tài khoản bị lộ.',
  },
  {
    title: '4. Nội dung và dữ liệu học tập',
    content:
      'Câu hỏi, đề thi, tài liệu và kết quả trên nền tảng chỉ phục vụ mục đích học tập nội bộ. Người dùng không được sao chép, khai thác thương mại hoặc phân phối lại khi chưa có sự cho phép.',
  },
  {
    title: '5. Thay đổi dịch vụ',
    content:
      'Chúng tôi có thể cập nhật tính năng, giao diện hoặc nội dung học tập để cải thiện trải nghiệm. Các điều khoản cũng có thể được điều chỉnh và sẽ có hiệu lực khi được đăng tải trên trang này.',
  },
];

export default function Terms() {
  return (
    <LegalPageLayout
      title="Điều khoản sử dụng"
      intro="Vui lòng đọc kỹ các điều khoản trước khi sử dụng nền tảng."
      sections={sections}
      contactText="Nếu bạn có câu hỏi về điều khoản sử dụng, vui lòng liên hệ khoa CNTT VNUA qua email cntt@vnua.edu.vn."
    />
  );
}
