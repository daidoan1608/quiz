import React from "react";

const formatTimePart = (value) => value.toString().padStart(2, "0");

export const SubmitConfirmDialog = ({
  answeredCount,
  totalQuestions,
  hours,
  isSubmitting = false,
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
        <span className="exam-submit-confirm__eyebrow">Còn câu chưa trả lời</span>
        <h2 id="exam-submit-confirm-title">Bạn vẫn muốn nộp bài?</h2>
        <p>
          Bạn đã trả lời {answeredCount}/
          {totalQuestions} câu và còn {formatTimePart(hours)}:
          {formatTimePart(minutes)}:{formatTimePart(seconds)}. Bạn có thể xem
          lại hoặc nộp luôn phần đã làm.
        </p>
      </div>
      <div className="exam-submit-confirm__actions">
        <button
          type="button"
          className="exam-submit-confirm__cancel"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          Xem lại
        </button>
        <button
          type="button"
          className="exam-submit-confirm__submit"
          disabled={isSubmitting}
          onClick={onSubmit}
        >
          <span className="material-symbols-outlined">
            {isSubmitting ? 'hourglass_top' : 'send'}
          </span>
          {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
        </button>
      </div>
    </div>
  </div>
);
