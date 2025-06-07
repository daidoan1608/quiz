import React, { useEffect, useState } from "react";
import { authAxios } from "../../Api/axiosConfig";
import { useNavigate } from "react-router-dom";

export default function AddExam() {
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [examTitle, setExamTitle] = useState("");
  const [examDescription, setExamDescription] = useState("");
  const [examDuration, setExamDuration] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [easyQuestions, setEasyQuestions] = useState(0);
  const [mediumQuestions, setMediumQuestions] = useState(0);
  const [hardQuestions, setHardQuestions] = useState(0);
  const [chapterQuestions, setChapterQuestions] = useState([]);
  const [maxQuestions, setMaxQuestions] = useState({});
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId"); // Lấy ID người dùng hiện tại

  const isTotalSelected = totalQuestions > 0;
  const isDifficultySelected =
    easyQuestions > 0 || mediumQuestions > 0 || hardQuestions > 0;
  const isChapterSelected = chapterQuestions.some(
    (chapter) => chapter.selectedQuestions > 0
  );

  const handleTotalQuestionsChange = (value) => {
    setTotalQuestions(value);
    if (value > 0) {
      // Reset các lựa chọn khác
      setEasyQuestions(0);
      setMediumQuestions(0);
      setHardQuestions(0);
      setChapterQuestions((prev) =>
        prev.map((chapter) => ({ ...chapter, selectedQuestions: 0 }))
      );
    }
  };

  const handleDifficultyChange = (difficulty, value) => {
    if (value < 0 || value > maxQuestions[difficulty]) return; // Giới hạn giá trị nhập
    if (!isTotalSelected && !isChapterSelected) { // Chỉ cho phép nếu chưa chọn tổng số câu hoặc chương
      switch (difficulty) {
        case "easy":
          setEasyQuestions(value);
          break;
        case "medium":
          setMediumQuestions(value);
          break;
        case "hard":
          setHardQuestions(value);
          break;
        default:
          break;
      }
    }
  };
  

  const handleChapterChange = (chapterName, value) => {
    if (isTotalSelected || isDifficultySelected) return; // Bỏ qua nếu tổng hoặc độ khó đã được chọn
    setChapterQuestions((prev) =>
      prev.map((chapter) =>
        chapter.chapterName === chapterName
          ? {
              ...chapter,
              selectedQuestions: Math.min(value, chapter.totalQuestions),
            }
          : chapter
      )
    );
  };

  // Tính tổng số câu đã chọn
  const totalSelectedQuestions =
    easyQuestions +
    mediumQuestions +
    hardQuestions +
    chapterQuestions.reduce(
      (acc, chapter) => acc + chapter.selectedQuestions,
      0
    );
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await authAxios.get("/public/categories")
      setCategories(response.data.data[0] || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khoa:", error);
    }
  };

  const fetchQuestionLimits = async (subjectId) => {
    try {
      const res = await authAxios.get(
        `/admin/questions/total-questions/${subjectId}`
      );
      console.log("Giới hạn câu hỏi:", res.data.data);
      setMaxQuestions(res.data.data);
      const chapterData = Object.entries(res.data.data.totalQuestionByChapter).map(
        ([name, count]) => ({
          chapterName: name,
          totalQuestions: count,
          selectedQuestions: 0,
        })
      );
      setChapterQuestions(chapterData);
    } catch (error) {
      console.error("Lỗi khi lấy giới hạn câu hỏi:", error);
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    setSelectedSubject("");
    const selectedCategory = categories.find(
      (c) => c.categoryId === parseInt(categoryId)
    );
    setSubjects(selectedCategory ? selectedCategory.subjects : []);
  };

  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    setSelectedSubject(subjectId);
    if (subjectId) {
      fetchQuestionLimits(subjectId);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const totalSelectedByChapter = chapterQuestions.reduce(
      (acc, chapter) => acc + chapter.selectedQuestions,
      0
    );
    const totalSelectedByDifficulty =
      easyQuestions + mediumQuestions + hardQuestions;

    if (
      totalQuestions > 0 &&
      (totalSelectedByChapter > 0 || totalSelectedByDifficulty > 0)
    ) {
      alert("Chỉ được chọn một tiêu chí: Tổng số câu, chương, hoặc độ khó.");
      return;
    }

    const examDto = {
      subjectId: selectedSubject,
      title: examTitle,
      description: examDescription,
      duration: parseInt(examDuration, 10),
      createdBy: userId,
    };

    const payload = {
      examDto,
      totalQuestions: parseInt(totalQuestions, 10) || null,
      easyQuestions,
      mediumQuestions,
      hardQuestions,
      chapterQuestions: chapterQuestions.filter(
        (chapter) => chapter.selectedQuestions > 0
      ),
    };

    try {
      await authAxios.post("/admin/exams", payload);
      alert("Thêm bài thi thành công!");
      navigate("/admin/exams");
    } catch (error) {
      console.error("Lỗi khi thêm bài thi:", error);
      alert("Không thể thêm bài thi. Vui lòng thử lại.");
    }
    console.info("Payload:", payload);
  };

  return (
    <div>
      <h2>Thêm Bài Thi</h2>
      <form onSubmit={handleSubmit}>
        {/* Chọn Khoa */}
        <div className="mb-3">
          <label>Khoa:</label>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="form-select"
          >
            <option value="">-- Chọn Khoa --</option>
            {categories.map((cat) => (
              <option key={cat.categoryId} value={cat.categoryId}>
                {cat.categoryName}
              </option>
            ))}
          </select>
        </div>

        {/* Chọn Môn */}
        <div className="mb-3">
          <label>Môn:</label>
          <select
            value={selectedSubject}
            onChange={handleSubjectChange}
            className="form-select"
          >
            <option value="">-- Chọn Môn --</option>
            {subjects.map((sub) => (
              <option key={sub.subjectId} value={sub.subjectId}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="examTitle" className="form-label">
            Tên bài thi
          </label>
          <input
            id="examTitle"
            type="text"
            className="form-control"
            value={examTitle}
            onChange={(e) => setExamTitle(e.target.value)}
            placeholder="Nhập tên bài thi"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="examDescription" className="form-label">
            Mô tả bài thi
          </label>
          <textarea
            id="examDescription"
            className="form-control"
            value={examDescription}
            onChange={(e) => setExamDescription(e.target.value)}
            placeholder="Nhập mô tả bài thi"
            rows="3"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="examDuration" className="form-label">
            Thời gian làm bài (phút)
          </label>
          <input
            id="examDuration"
            type="number"
            className="form-control"
            value={examDuration}
            onChange={(e) => setExamDuration(Number(e.target.value))}
            placeholder="Nhập thời gian làm bài"
            min="1"
            required
          />
        </div>
        {/* Số câu hỏi */}
        <div className="mb-3">
          <label>
            Tổng số câu hỏi:
            <span className="text-muted ms-2">
              (Tối đa: {maxQuestions.totalQuestion || 0})
            </span>
          </label>
          <input
            type="number"
            value={totalQuestions}
            onChange={(e) => handleTotalQuestionsChange(Number(e.target.value))}
            className="form-control"
            disabled={isDifficultySelected || isChapterSelected}
            max={maxQuestions.totalQuestion || 0}
            min={0}
          />
        </div>

        {/* Độ khó */}
        <div className="mb-3">
          <label className="form-label">Số câu theo độ khó:</label>
          <div className="row align-items-center">
            <div className="col">
              <label>
                Dễ
                <span className="text-muted ms-2">
                  (Tối đa: {maxQuestions.totalEasy || 0})
                </span>
              </label>
              <input
                type="number"
                value={easyQuestions}
                onChange={(e) =>
                  handleDifficultyChange("easy", Number(e.target.value))
                }
                className="form-control"
                disabled={isTotalSelected || isChapterSelected}
                max={maxQuestions.totalEasy || 0}
                min={0}
              />
            </div>
            <div className="col">
              <label>
                Trung bình
                <span className="text-muted ms-2">
                  (Tối đa: {maxQuestions.totalMedium || 0})
                </span>
              </label>
              <input
                type="number"
                value={mediumQuestions}
                onChange={(e) =>
                  handleDifficultyChange("medium", Number(e.target.value))
                }
                className="form-control"
                disabled={isTotalSelected || isChapterSelected}
                max={maxQuestions.totalMedium || 0}
                min={0}
              />
            </div>
            <div className="col">
              <label>
                Khó
                <span className="text-muted ms-2">
                  (Tối đa: {maxQuestions.totalHard || 0})
                </span>
              </label>
              <input
                type="number"
                value={hardQuestions}
                onChange={(e) =>
                  handleDifficultyChange("hard", Number(e.target.value))
                }
                className="form-control"
                disabled={isTotalSelected || isChapterSelected}
                max={maxQuestions.totalHard || 0}
                min={0}
              />
            </div>
          </div>
        </div>

        {/* Chương */}
        <div className="mb-3">
          <h4>Số câu theo chương:</h4>
          <div className="d-flex flex-wrap">
            {chapterQuestions.map((chapter) => (
              <div
                key={chapter.chapterName}
                className="d-flex align-items-center mb-2 me-4"
                style={{ minWidth: "200px" }}
              >
                <span className="me-2">
                  {chapter.chapterName}:
                  <span className="text-muted ms-2">
                    (Tối đa: {chapter.totalQuestions})
                  </span>
                </span>
                <input
                  type="number"
                  value={chapter.selectedQuestions}
                  onChange={(e) =>
                    handleChapterChange(
                      chapter.chapterName,
                      Number(e.target.value)
                    )
                  }
                  className="form-control"
                  style={{ width: "80px" }}
                  disabled={isTotalSelected || isDifficultySelected}
                  max={chapter.totalQuestions}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <label>
            Tổng số câu đã chọn:
            <span className="fw-bold ms-2">{totalSelectedQuestions}</span>
          </label>
        </div>

        {/* Nút Submit */}
        <button type="submit" className="btn btn-primary">
          Thêm bài thi
        </button>
      </form>
    </div>
  );
}
