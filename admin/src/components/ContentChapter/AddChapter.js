import React, { useEffect, useState } from "react";
import { authAxios } from "../../Api/axiosConfig";
import { useNavigate } from "react-router-dom";

export default function AddChapter() {
  const [categories, setCategories] = useState([]); // Danh sách khoa và môn học
  const [selectedCategory, setSelectedCategory] = useState(""); // Khoa được chọn
  const [subjects, setSubjects] = useState([]); // Danh sách môn học theo khoa được chọn
  const [selectedSubject, setSelectedSubject] = useState(""); // Môn học được chọn
  const [name, setName] = useState(""); // Tên chương
  const [chapterNumber, setChapterNumber] = useState(""); // Số chương
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories(); // Lấy danh sách khoa và môn học khi component được mount
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await authAxios.get("/public/categories");
      setCategories(response.data); // Lưu dữ liệu vào state
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khoa:", error);
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId); // Lưu khoa được chọn
    setSelectedSubject(""); // Reset môn học được chọn

    // Tìm danh sách môn học thuộc khoa được chọn
    const selectedCategoryData = categories.find(
      (category) => category.categoryId === parseInt(categoryId)
    );
    setSubjects(selectedCategoryData ? selectedCategoryData.subjects : []);
  };

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value); // Lưu môn học được chọn
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCategory || !selectedSubject || !name || !chapterNumber) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      const newChapter = {
        name,
        subjectId: selectedSubject,
        chapterNumber,
      };

      // Gửi dữ liệu đến API
      await authAxios.post("/admin/chapters", newChapter);
      alert("Thêm chương thành công!");
      navigate("/subject/chapters"); // Quay lại trang danh sách chương
    } catch (error) {
      console.error("Lỗi khi thêm chương:", error);
      alert("Không thể thêm chương. Vui lòng thử lại.");
    }
  };

  // Hàm quay lại trang danh sách chương
  const handleCancel = () => {
    navigate("/subject/chapters");
  };

  return (
    <div>
      <h2>Thêm Chương</h2>
      <form onSubmit={handleSubmit}>
        {/* Dropdown chọn khoa */}
        <div className="mb-3">
          <label htmlFor="categorySelect" className="form-label">
            Chọn Khoa
          </label>
          <select
            id="categorySelect"
            className="form-select"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="">-- Chọn Khoa --</option>
            {categories.map((category) => (
              <option key={category.categoryId} value={category.categoryId}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown chọn môn học */}
        <div className="mb-3">
          <label htmlFor="subjectSelect" className="form-label">
            Chọn Môn Học
          </label>
          <select
            id="subjectSelect"
            className="form-select"
            value={selectedSubject}
            onChange={handleSubjectChange}
            disabled={!selectedCategory || subjects.length === 0} // Vô hiệu hóa nếu chưa chọn khoa
          >
            <option value="">-- Chọn Môn Học --</option>
            {subjects.map((subject) => (
              <option key={subject.subjectId} value={subject.subjectId}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tên chương */}
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            Tên chương
          </label>
          <input
            type="text"
            className="form-control"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Số chương */}
        <div className="mb-3">
          <label htmlFor="chapterNumber" className="form-label">
            Số chương
          </label>
          <input
            type="number"
            className="form-control"
            id="chapterNumber"
            value={chapterNumber}
            onChange={(e) => setChapterNumber(e.target.value)}
            required
          />
        </div>

        {/* Nút lưu */}
        <button type="submit" className="btn btn-primary me-2">
          Thêm Chương
        </button>
        {/* Nút hủy */}
        <button type="button" className="btn btn-secondary" onClick={handleCancel}>
          Hủy
        </button>
      </form>
    </div>
  );
}
