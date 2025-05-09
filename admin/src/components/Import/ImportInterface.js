import React, { useEffect, useState } from "react";
import { authAxios } from "../../Api/axiosConfig";
import { useNavigate } from "react-router-dom";

const ImportInterface = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [isChaptersEmpty, setIsChaptersEmpty] = useState(false); // State to check if chapters are empty
  const navigate = useNavigate();

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await authAxios.get("/public/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khoa:", error);
    }
  };

  // Fetch subjects when category changes
  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find(cat => cat.categoryId === parseInt(selectedCategory));
      if (category && category.subjects) {
        setSubjects(category.subjects);
      } else {
        setSubjects([]);
      }
    } else {
      setSubjects([]);
      setSelectedSubject("");
    }
  }, [selectedCategory, categories]);

  // Fetch chapters when subject changes
  useEffect(() => {
    if (selectedSubject) {
      fetchChapters(selectedSubject);
    } else {
      setChapters([]);
      setSelectedChapter(""); // Reset selected chapter when subject changes
      setIsChaptersEmpty(false); // Reset the empty state when subject changes
    }
  }, [selectedSubject]);

  const fetchChapters = async (subjectId) => {
    try {
      const response = await authAxios.get(`/public/subject/chapters/${subjectId}`);
      if (response.data.data && response.data.data.length > 0) {
        setChapters(response.data.data); // Cập nhật danh sách chapters
        setIsChaptersEmpty(false); // Nếu có chương, set là không rỗng
      } else {
        setChapters([]); // Nếu không có chương, set mảng rỗng
        setIsChaptersEmpty(true); // Đánh dấu là không có chương
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách chương:", error);
      setIsChaptersEmpty(true); // Nếu có lỗi, đánh dấu là không có chương
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedCategory || !selectedSubject || !selectedChapter || !selectedFile) {
      alert("Vui lòng chọn đầy đủ các trường và file trước khi upload.");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("categoryId", selectedCategory);
    formData.append("subjectId", selectedSubject);
    formData.append("chapterId", selectedChapter);
  
    try {
      const response = await authAxios.post("admin/questions/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 200) {
        // Handle success response
        console.log("Upload thành công:", response.data.data);
        alert("Upload thành công!");
        navigate("/admin/questions");
      }
    } catch (error) {
      console.error("Lỗi khi upload file:", error);
      alert("Lỗi khi upload file. Vui lòng thử lại.");
    }
  };
  

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Import Data</h2>
      <div className="card p-4">
        {/* Dropdown for Department */}
        <div className="mb-3">
          <label htmlFor="categorySelect" className="form-label">
            Chọn khoa:
          </label>
          <select
            id="categorySelect"
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">-- Chọn khoa --</option>
            {categories.map((dept, index) => (
              <option key={index} value={dept.categoryId}>
                {dept.categoryName}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown for Subject */}
        <div className="mb-3">
          <label htmlFor="subjectSelect" className="form-label">
            Chọn môn học:
          </label>
          <select
            id="subjectSelect"
            className="form-select"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">-- Chọn môn học --</option>
            {subjects.map((subject, index) => (
              <option key={index} value={subject.subjectId}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown for Chapter */}
        {!isChaptersEmpty ? (
          <div className="mb-3">
            <label htmlFor="chapterSelect" className="form-label">
              Chọn chapter:
            </label>
            <select
              id="chapterSelect"
              className="form-select"
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
            >
              <option value="">-- Chọn chapter --</option>
              {chapters.map((chapter, index) => (
                <option key={index} value={chapter.chapterId}>
                  {chapter.name} (Chương {chapter.chapterNumber})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="alert alert-warning">
            Không có chương nào cho môn học này.
          </div>
        )}

        {/* File Input */}
        <div className="mb-3">
          <label htmlFor="fileInput" className="form-label">
            Chọn file để nhập:
          </label>
          <input
            type="file"
            className="form-control"
            id="fileInput"
            onChange={handleFileChange}
          />
        </div>

        {/* Display selected file */}
        {selectedFile && (
          <div className="alert alert-info mt-3">
            <strong>Tệp đã chọn:</strong> {selectedFile.name}
          </div>
        )}

        {/* Upload Button */}
        <div className="d-flex justify-content-end">
          <button className="btn btn-primary" onClick={handleUpload}>
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportInterface;
