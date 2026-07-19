export const MAX_DISPLAYED_SUBJECTS = 6;
export const MAX_DISPLAYED_ATTEMPTS = 4;

export const TEAM_MEMBERS = [
  {
    name: 'Đoàn Minh Đại',
    role: 'PM & Backend Developer',
    avatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    quote: 'Dẫn dắt bằng chiến lược, xây dựng bằng công nghệ.',
  },
  {
    name: 'Lê Thị Hồng Ánh',
    role: 'Frontend Developer',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    quote: 'Tối ưu hóa trải nghiệm người dùng.',
  },
  {
    name: 'Nguyễn Tuấn Anh',
    role: 'Frontend Developer',
    avatar:
      'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
    quote: 'Mỗi dòng code là một trải nghiệm mới.',
  },
  {
    name: 'Nguyễn Thế Sơn',
    role: 'Frontend Developer',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    quote: 'Thiết kế giao diện – kiến tạo cảm hứng.',
  },
  {
    name: 'Đoàn Thanh Bình',
    role: 'UI/UX Designer',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    quote: 'Thiết kế vì người dùng, đẹp vì mục đích.',
  },
  {
    name: 'Chu Văn Tài',
    role: 'Business Analyst (BA)',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    quote: 'Hiểu đúng nhu cầu, xây đúng sản phẩm.',
  },
];

export const LEARNING_PATH_STEPS = [
  {
    title: 'Ôn tập chuyên đề: Hàm số và ứng dụng',
    description: 'Toán học - 45 phút',
    icon: 'book',
    muted: false,
  },
  {
    title: 'Kiểm tra 15 phút: Khảo sát hàm số',
    description: 'Toán học - 15 phút',
    icon: 'edit',
    muted: false,
  },
  {
    title: 'Làm đề thi thử: Đề thi THPT Quốc gia',
    description: 'Tổng hợp - 90 phút',
    icon: 'clipboard',
    muted: true,
  },
];

export const SUBJECT_ICON_PATHS = [
  // 'M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
  // 'M3 21v-8a2 2 0 012-2h14a2 2 0 012 2v8M3 21h18M3 21l3-3m0 0l-3-3m3 3h12m0 0l3-3m-3 3l3 3',
  // 1. Quyển sách đang mở (Phù hợp cho Môn Văn, Đọc sách, Học chung)
  'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',

  // 2. Mũ cử nhân / Tốt nghiệp (Phù hợp cho Kỳ thi, Khóa học, Thành tích)
  'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222',

  // 3. Quả địa cầu (Phù hợp cho Địa lý, Ngoại ngữ, Lịch sử)
  'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',

  // 4. Kính hiển vi / Nghiên cứu (Phù hợp cho Sinh học, Vật lý, Khoa học)
  'M10 21h7M10 17h4m-8 4h4m0 0V9a2 2 0 012-2h3m-7 14H5a2 2 0 01-2-2V9a2 2 0 012-2h2m2 4h4M14 3a1 1 0 112 0v3a1 1 0 01-1 1h-1V3z',

  // 5. Thước kẻ và Bút chì chéo nhau (Phù hợp cho Toán học, Hình học, Mỹ thuật)
  'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',

  // 6. Huy chương thưởng (Phù hợp cho Điểm số cao, Thi đua, Xếp hạng)
  'M3 21v-8a2 2 0 012-2h14a2 2 0 012 2v8M3 21h18M3 21l3-3m0 0l-3-3m3 3h12m0 0l3-3m-3 3l3 3',

];

export const LEARNING_ICON_PATHS = {
  book: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  clipboard:
    'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
};
