import React, { useCallback, useState } from 'react';

const CAT_QUOTES = [
  // Nhóm động viên
  'Hôm nay bạn đã học được gì mới chưa?',
  'Cố lên! Top 1 server đang chờ bạn đó!',
  'Kiến thức là sức mạnh, còn nghỉ ngơi đúng lúc là bí quyết.',
  'Đừng nhìn người khác, hãy vượt qua chính mình hôm qua!',

  // Nhóm hài hước/IT
  'Code không bug, đời không nể!',
  'Đang loading tinh thần học tập... vui lòng chờ.',
  'Nhìn bảng xếp hạng áp lực quá nhỉ?',
  'Nhớ uống nước và giữ lưng thẳng nhé!',

  // Nhóm "cà khịa" nhẹ
  'Sao hôm nay tụt hạng thế? Mình làm lại nào.',
  'Bạn ở đâu trong danh sách xếp hạng hôm nay?',
];

export default function CatMascot() {
  const [quote, setQuote] = useState(CAT_QUOTES[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Hàm đổi câu thoại ngẫu nhiên
  const pokeCat = useCallback(() => {
    setIsAnimating(true);

    // Random câu mới (đảm bảo không trùng câu cũ)
    setQuote((currentQuote) => {
      let newQuote;
      do {
        newQuote = CAT_QUOTES[Math.floor(Math.random() * CAT_QUOTES.length)];
      } while (newQuote === currentQuote);
      return newQuote;
    });

    // Reset animation sau 300ms
    setTimeout(() => setIsAnimating(false), 300);
  }, []);

  return (
    <div
      onClick={pokeCat}
      className="group relative flex w-full max-w-[480px] mt-4 cursor-pointer items-center gap-4 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-gray-100 transition-all hover:scale-[1.02] hover:shadow-xl dark:bg-gray-800 dark:ring-gray-700"
    >
      {/* 1. Phần Avatar Mèo (Có hiệu ứng rung khi click) */}
      <div
        className={`relative shrink-0 ${isAnimating ? 'aura-tap-pop' : ''}`}
      >
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-orange-200 bg-orange-50 dark:border-orange-900/30 dark:bg-gray-700">
          {/* Bạn có thể thay link ảnh GIF khác nếu muốn */}
          <img
            src="/images/cat_mascot.gif"
            alt="Cat Mascot"
            className="h-14 w-14 object-cover mix-blend-multiply dark:mix-blend-normal"
            decoding="async"
            loading="lazy"
          />
        </div>
        {/* Chấm xanh online */}
        <span className="absolute bottom-0 right-0 block h-4 w-4 rounded-full border-2 border-white bg-green-500 ring-1 ring-gray-100 dark:border-gray-800"></span>
      </div>

      {/* 2. Phần Bong bóng thoại */}
      <div className="flex flex-1 flex-col justify-center">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-500 dark:text-orange-400">
            Mèo Trợ Lý
          </span>
          <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
            Click me!
          </span>
        </div>

        {/* Câu thoại */}
        <p className="line-clamp-2 text-sm font-medium leading-snug text-gray-700 transition-opacity duration-300 dark:text-gray-200">
          "{quote}"
        </p>
      </div>
    </div>
  );
}
