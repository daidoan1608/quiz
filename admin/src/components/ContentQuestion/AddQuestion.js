import React, { useState, useEffect } from 'react';
import { authAxios } from '../../Api/axiosConfig';
import { useNavigate } from 'react-router-dom';

export default function AddQuestion() {
    const [content, setContent] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [chapterId, setChapterId] = useState('');
    const [answers, setAnswers] = useState([
        { content: '', isCorrect: false },
        { content: '', isCorrect: false },
        { content: '', isCorrect: false },
        { content: '', isCorrect: false },
    ]);
    const [categories, setCategories] = useState([]);
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    const [chapters, setChapters] = useState([]);

    const navigate = useNavigate();

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await authAxios.get("/public/categories");
                setCategories(response.data.data[0] || []);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    // Update subjects when category changes
    useEffect(() => {
        if (categoryId) {
            const selectedCategory = categories.find(cat => cat.categoryId === Number(categoryId));
            setFilteredSubjects(selectedCategory ? selectedCategory.subjects || [] : []);
            // Reset subject and chapter selection when category changes
            setSubjectId('');
            setChapterId('');
            setChapters([]);
        } else {
            setFilteredSubjects([]);
            setSubjectId('');
            setChapterId('');
            setChapters([]);
        }
    }, [categoryId, categories]);

    // Fetch chapters when subjectId changes
    useEffect(() => {
        const fetchChapters = async (subjectId) => {
            if (!subjectId) {
                setChapters([]);
                setChapterId('');
                return;
            }
            try {
                const response = await authAxios.get(`/public/subjects/${subjectId}`);
                if (response.data.status === 'success') {
                    setChapters(response.data.data.chapters || []);
                } else {
                    setChapters([]);
                    alert("Không có chương nào cho môn học này!");
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách chương:", error);
                alert("Không thể lấy danh sách chương!");
                setChapters([]);
            }
            setChapterId('');
        };
        fetchChapters(subjectId);
    }, [subjectId]);

    // Filter chapters by selected chapterId is automatic by selection

    // Handle answer content or correctness change
    const handleAnswerChange = (index, field, value) => {
        if (field === 'isCorrect' && value === true) {
            // Only one answer can be correct
            const updatedAnswers = answers.map((ans, i) => ({
                ...ans,
                isCorrect: i === index,
            }));
            setAnswers(updatedAnswers);
        } else {
            const updatedAnswers = [...answers];
            updatedAnswers[index][field] = value;
            setAnswers(updatedAnswers);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const newQuestion = {
                content,
                difficulty,
                categoryId: Number(categoryId),
                subjectId: Number(subjectId),
                chapterId: Number(chapterId),
                answers,
            };

            await authAxios.post("/admin/questions", newQuestion);
            alert("Thêm câu hỏi thành công!");
            navigate("/chapter/questions");
        } catch (error) {
            console.error("Error adding question:", error);
            alert("Không thể thêm câu hỏi!");
        }
    };

    return (
        <div>
            <h2>Thêm Câu Hỏi</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="categoryId" className="form-label">Chọn Khoa</label>
                    <select
                        className="form-control"
                        id="categoryId"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        required
                    >
                        <option value="">--Chọn khoa--</option>
                        {categories.map((category) => (
                            <option key={category.categoryId} value={category.categoryId}>
                                {category.categoryName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label htmlFor="subjectId" className="form-label">Chọn Môn</label>
                    <select
                        className="form-control"
                        id="subjectId"
                        value={subjectId}
                        onChange={(e) => setSubjectId(e.target.value)}
                        required
                        disabled={filteredSubjects.length === 0}
                    >
                        <option value="">--Chọn môn--</option>
                        {filteredSubjects.map((subject) => (
                            <option key={subject.subjectId} value={subject.subjectId}>
                                {subject.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label htmlFor="chapterId" className="form-label">Chọn Chương</label>
                    <select
                        className="form-control"
                        id="chapterId"
                        value={chapterId}
                        onChange={(e) => setChapterId(e.target.value)}
                        required
                        disabled={chapters.length === 0}
                    >
                        <option value="">--Chọn chương--</option>
                        {chapters.map((chapter) => (
                            <option key={chapter.chapterId} value={chapter.chapterId}>
                                {chapter.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label htmlFor="content" className="form-label">Nội dung câu hỏi</label>
                    <input
                        type="text"
                        className="form-control"
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="difficulty" className="form-label">Mức độ</label>
                    <select
                        className="form-control"
                        id="difficulty"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        required
                    >
                        <option value="">--Chọn mức độ--</option>
                        <option value="EASY">Dễ</option>
                        <option value="MEDIUM">Trung bình</option>
                        <option value="HARD">Khó</option>
                    </select>
                </div>

                {answers.map((answer, index) => (
                    <div key={index} className="mb-3">
                        <label className="form-label">Đáp án {String.fromCharCode(65 + index)}</label>
                        <input
                            type="text"
                            className="form-control"
                            value={answer.content}
                            onChange={(e) => handleAnswerChange(index, 'content', e.target.value)}
                            required
                        />
                        <div className="form-check">
                            <input
                                type="radio"
                                className="form-check-input"
                                name="isCorrect"
                                onChange={() => handleAnswerChange(index, 'isCorrect', true)}
                                checked={answer.isCorrect}
                                required
                            />
                            <label className="form-check-label">Đáp án đúng</label>
                        </div>
                    </div>
                ))}

                <button type="submit" className="btn btn-primary">Thêm Câu Hỏi</button>
            </form>
        </div>
    );
}
