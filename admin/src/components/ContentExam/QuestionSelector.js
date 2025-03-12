import React, { useEffect, useState } from "react";
import { authAxios } from "../../Api/axiosConfig";

const mockChapters = [
  {
    chapterId: 1,
    chapterName: "Giới thiệu về môn học",
    totalQuestions: {
      easy: 10,
      medium: 8,
      hard: 5,
    },
  },
  {
    chapterId: 2,
    chapterName: "Các khái niệm cơ bản",
    totalQuestions: {
      easy: 15,
      medium: 10,
      hard: 8,
    },
  },
  {
    chapterId: 3,
    chapterName: "Nâng cao và ứng dụng",
    totalQuestions: {
      easy: 5,
      medium: 7,
      hard: 10,
    },
  },
];

export default function QuestionSelection() {
  const [numberOfQuestions, setNumberOfQuestions] = useState("");
  const [easyQuestions, setEasyQuestions] = useState(0);
  const [mediumQuestions, setMediumQuestions] = useState(0);
  const [hardQuestions, setHardQuestions] = useState(0);
  const [chapterSelections, setChapterSelections] = useState([]);
  const [chapters, setChapters] = useState([]);

  const totalSelectedQuestions = easyQuestions + mediumQuestions + hardQuestions;

  useEffect(() => {
    // Giả lập lấy dữ liệu chương từ API
    fetchChapters();
  }, []);

  const fetchChapters = () => {
    setChapters(mockChapters);
    setChapterSelections(
      mockChapters.map((chapter) => ({
        chapterId: chapter.chapterId,
        easy: 0,
        medium: 0,
        hard: 0,
      }))
    );
  };

  const handleChapterChange = (chapterId, level, value) => {
    setChapterSelections((prevSelections) =>
      prevSelections.map((selection) =>
        selection.chapterId === chapterId
          ? { ...selection, [level]: Math.min(value, chapters.find((ch) => ch.chapterId === chapterId).totalQuestions[level]) }
          : selection
      )
    );
  };

  return (
    <div className="container border p-3">
      <h2>Chọn Số Lượng Câu Hỏi</h2>

      {/* Dòng 1: Tổng số câu hỏi */}
      <div className="row mb-3">
        <div className="col">
          <label htmlFor="numberOfQuestions" className="form-label">
            Tổng số câu hỏi
          </label>
          <input
            id="numberOfQuestions"
            type="number"
            className="form-control"
            value={numberOfQuestions}
            onChange={(e) => setNumberOfQuestions(e.target.value)}
            placeholder="Nhập tổng số câu hỏi"
            min="1"
          />
        </div>
      </div>

      {/* Dòng 2: Số câu hỏi dễ, trung bình, khó */}
      <div className="row mb-3">
        <div className="col">
          <label htmlFor="easyQuestions" className="form-label">
            Số câu hỏi dễ
          </label>
          <input
            id="easyQuestions"
            type="number"
            className="form-control"
            value={easyQuestions}
            onChange={(e) => setEasyQuestions(Math.min(e.target.value, numberOfQuestions))}
            placeholder="Số câu hỏi dễ"
            min="0"
          />
        </div>
        <div className="col">
          <label htmlFor="mediumQuestions" className="form-label">
            Số câu hỏi trung bình
          </label>
          <input
            id="mediumQuestions"
            type="number"
            className="form-control"
            value={mediumQuestions}
            onChange={(e) => setMediumQuestions(Math.min(e.target.value, numberOfQuestions))}
            placeholder="Số câu hỏi trung bình"
            min="0"
          />
        </div>
        <div className="col">
          <label htmlFor="hardQuestions" className="form-label">
            Số câu hỏi khó
          </label>
          <input
            id="hardQuestions"
            type="number"
            className="form-control"
            value={hardQuestions}
            onChange={(e) => setHardQuestions(Math.min(e.target.value, numberOfQuestions))}
            placeholder="Số câu hỏi khó"
            min="0"
          />
        </div>
      </div>

      {/* Dòng 3: Chọn số câu theo chương */}
      <div className="mb-3">
        <h4>Chọn số câu hỏi theo từng chương</h4>
        {chapters.map((chapter) => (
          <div key={chapter.chapterId} className="row mb-2">
            <div className="col-4">
              <strong>{chapter.chapterName}</strong>
            </div>
            <div className="col">
              <label className="form-label">Số câu hỏi trong chương</label>
              <input
                type="number"
                className="form-control"
                value={
                  chapterSelections.find((selection) => selection.chapterId === chapter.chapterId)?.easy || 0
                }
                onChange={(e) =>
                  handleChapterChange(chapter.chapterId, "easy", Number(e.target.value))
                }
                min="0"
                max={chapter.totalQuestions.easy}
              />
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="btn btn-primary mt-3 mb-3">
        Lưu Lựa Chọn
      </button>
    </div>
  );
}
