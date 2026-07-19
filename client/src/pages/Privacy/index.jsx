import React from 'react';
import { LegalPageLayout } from 'pages/Legal/components/LegalPageLayout';

const privacySections = [
  {
    title: '1. Thông tin chúng tôi thu thập',
    content:
      'QuizVNUA có thể lưu trữ các thông tin cần thiết như họ tên, email, tài khoản đăng nhập, lịch sử làm bài, điểm số và tiến độ học tập để vận hành các tính năng của nền tảng.',
  },
  {
    title: '2. Mục đích sử dụng dữ liệu',
    content:
      'Dữ liệu được sử dụng để xác thực người dùng, cá nhân hóa trải nghiệm học tập, hiển thị kết quả, thống kê tiến độ, cải thiện chất lượng câu hỏi và hỗ trợ kỹ thuật khi cần thiết.',
  },
  {
    title: '3. Bảo vệ thông tin cá nhân',
    content:
      'Chúng tôi áp dụng các biện pháp hợp lý để hạn chế truy cập trái phép, mất mát hoặc lạm dụng dữ liệu. Mật khẩu được xử lý theo cơ chế bảo mật của hệ thống và người dùng nên tự bảo vệ thông tin đăng nhập của mình.',
  },
  {
    title: '4. Chia sẻ thông tin',
    content:
      'QuizVNUA không bán hoặc trao đổi thông tin cá nhân của người dùng cho bên thứ ba. Thông tin chỉ có thể được chia sẻ khi cần phục vụ vận hành hệ thống, yêu cầu hỗ trợ hoặc theo quy định pháp luật.',
  },
  {
    title: '5. Quyền của người dùng',
    content:
      'Bạn có thể kiểm tra, cập nhật thông tin cá nhân trong tài khoản và liên hệ quản trị viên nếu cần hỗ trợ chỉnh sửa, khóa hoặc xử lý dữ liệu liên quan đến tài khoản.',
  },
];

export default function Privacy() {
  return (
    <LegalPageLayout
      title="Chính sách bảo mật"
      intro="Chính sách này mô tả cách QuizVNUA thu thập, sử dụng và bảo vệ dữ liệu của bạn."
      sections={privacySections}
      contactText="Nếu phát hiện rủi ro bảo mật hoặc cần hỗ trợ về dữ liệu cá nhân, vui lòng liên hệ cntt@vnua.edu.vn."
    />
  );
}
