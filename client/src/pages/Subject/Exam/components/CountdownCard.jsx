import React from "react";

export const CountdownCard = ({ texts, hours, minutes, seconds }) => (
  <div className="aura-surface-panel rounded-2xl p-5">
    <h4 className="mb-4 text-center text-base font-semibold">
      {texts.countDown || texts.conutDown || "Thời gian còn lại"}
    </h4>
    <div className="flex gap-3">
      {[hours, minutes, seconds].map((val, idx) => (
        <div key={idx} className="flex grow basis-0 flex-col items-stretch gap-2">
          <div className="flex h-16 grow items-center justify-center rounded-xl bg-primary/10 px-3 text-primary">
            <p className="text-2xl font-bold tracking-[-0.015em]">
              {val.toString().padStart(2, "0")}
            </p>
          </div>
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            {idx === 0
              ? texts.hours || "Giờ"
              : idx === 1
                ? texts.minutes || "Phút"
                : texts.seconds || "Giây"}
          </p>
        </div>
      ))}
    </div>
  </div>
);
