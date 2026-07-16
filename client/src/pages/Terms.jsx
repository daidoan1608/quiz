import React from 'react';

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
    <main className="flex flex-1 justify-center px-4 py-10">
      <div className="w-full max-w-4xl rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-10">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            QuizVNUA
          </p>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Điều khoản sử dụng
          </h1>
          <p className="mt-4 text-sm leading-6 text-gray-500 dark:text-gray-400">
            Cập nhật lần cuối: {new Date().getFullYear()}. Vui lòng đọc kỹ các
            điều khoản trước khi sử dụng nền tảng.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-xl bg-gray-50 p-5 dark:bg-gray-800/60"
            >
              <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                {section.title}
              </h2>
              <p className="text-sm leading-7 text-gray-600 dark:text-gray-300">
                {section.content}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-emerald-100 bg-emerald-50 p-5 text-sm font-medium leading-7 text-emerald-900 dark:border-emerald-700/60 dark:bg-emerald-900/40 dark:text-emerald-50">
          Nếu bạn có câu hỏi về điều khoản sử dụng, vui lòng liên hệ khoa CNTT
          VNUA qua email cntt@vnua.edu.vn.
        </div>
      </div>
    </main>
  );
}
