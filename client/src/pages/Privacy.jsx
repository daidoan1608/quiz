import React from "react";

const privacySections = [
  {
    title: "1. Thông tin chúng tôi thu thập",
    content:
      "QuizVNUA có thể lưu trữ các thông tin cần thiết như họ tên, email, tài khoản đăng nhập, lịch sử làm bài, điểm số và tiến độ học tập để vận hành các tính năng của nền tảng.",
  },
  {
    title: "2. Mục đích sử dụng dữ liệu",
    content:
      "Dữ liệu được sử dụng để xác thực người dùng, cá nhân hóa trải nghiệm học tập, hiển thị kết quả, thống kê tiến độ, cải thiện chất lượng câu hỏi và hỗ trợ kỹ thuật khi cần thiết.",
  },
  {
    title: "3. Bảo vệ thông tin cá nhân",
    content:
      "Chúng tôi áp dụng các biện pháp hợp lý để hạn chế truy cập trái phép, mất mát hoặc lạm dụng dữ liệu. Mật khẩu được xử lý theo cơ chế bảo mật của hệ thống và người dùng nên tự bảo vệ thông tin đăng nhập của mình.",
  },
  {
    title: "4. Chia sẻ thông tin",
    content:
      "QuizVNUA không bán hoặc trao đổi thông tin cá nhân của người dùng cho bên thứ ba. Thông tin chỉ có thể được chia sẻ khi cần phục vụ vận hành hệ thống, yêu cầu hỗ trợ hoặc theo quy định pháp luật.",
  },
  {
    title: "5. Quyền của người dùng",
    content:
      "Bạn có thể kiểm tra, cập nhật thông tin cá nhân trong tài khoản và liên hệ quản trị viên nếu cần hỗ trợ chỉnh sửa, khóa hoặc xử lý dữ liệu liên quan đến tài khoản.",
  },
];

export default function Privacy() {
  return (
    <main className="flex flex-1 justify-center px-4 py-10">
      <div className="w-full max-w-4xl rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-10">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            QuizVNUA
          </p>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Chính sách bảo mật
          </h1>
          <p className="mt-4 text-sm leading-6 text-gray-500 dark:text-gray-400">
            Cập nhật lần cuối: {new Date().getFullYear()}. Chính sách này mô tả cách QuizVNUA thu thập, sử dụng và bảo vệ dữ liệu của bạn.
          </p>
        </div>

        <div className="space-y-6">
          {privacySections.map((section) => (
            <section key={section.title} className="rounded-xl bg-gray-50 p-5 dark:bg-gray-800/60">
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
          Nếu phát hiện rủi ro bảo mật hoặc cần hỗ trợ về dữ liệu cá nhân, vui lòng liên hệ cntt@vnua.edu.vn.
        </div>
      </div>
    </main>
  );
}
