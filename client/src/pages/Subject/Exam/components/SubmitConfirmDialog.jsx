import React from "react";

const formatTimePart = (value) => value.toString().padStart(2, "0");

export const SubmitConfirmDialog = ({
  answeredCount,
  totalQuestions,
  hours,
  minutes,
  seconds,
  onCancel,
  onSubmit,
}) => (
  <div
    className="exam-submit-confirm"
    role="dialog"
    aria-modal="true"
    aria-labelledby="exam-submit-confirm-title"
  >
    <div className="exam-submit-confirm__backdrop" onClick={onCancel} />
    <div className="exam-submit-confirm__panel">
      <div className="exam-submit-confirm__icon">
        <span className="material-symbols-outlined">assignment_turned_in</span>
      </div>
      <div className="exam-submit-confirm__content">
        <span className="exam-submit-confirm__eyebrow">Xác nhận nộp bài</span>
        <h2 id="exam-submit-confirm-title">Bạn muốn nộp bài ngay bây giờ?</h2>
        <p>
          Bài làm sẽ được gửi để chấm điểm. Bạn đã trả lời {answeredCount}/
          {totalQuestions} câu và còn {formatTimePart(hours)}:
          {formatTimePart(minutes)}:{formatTimePart(seconds)}.
        </p>
      </div>
      <div className="exam-submit-confirm__actions">
        <button
          type="button"
          className="exam-submit-confirm__cancel"
          onClick={onCancel}
        >
          Xem lại
        </button>
        <button
          type="button"
          className="exam-submit-confirm__submit"
          onClick={onSubmit}
        >
          <span className="material-symbols-outlined">send</span>
          Nộp bài
        </button>
      </div>
    </div>
  </div>
);
