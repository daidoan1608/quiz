import React, { useState } from 'react';
import axios from '../../Api/userApi'; // Đảm bảo axios đã được cấu hình đúng cho API
import { useNavigate } from 'react-router-dom';

export default function AddQuestion() {
    const [content, setContent] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [chapterId, setChapterId] = useState('');
    const [answers, setAnswers] = useState([
        { content: '', isCorrect: false },
        { content: '', isCorrect: false },
        { content: '', isCorrect: false },
        { content: '', isCorrect: false },
    ]);
    const navigate = useNavigate();

    // Lấy token từ localStorage hoặc nơi bạn lưu trữ token
    const token = localStorage.getItem('token'); // Ví dụ lấy từ localStorage

    const handleAnswerChange = (index, field, value) => {
        const updatedAnswers = [...answers];
        updatedAnswers[index][field] = value;
        setAnswers(updatedAnswers);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const newQuestion = {
                content,
                difficulty,
                chapterId: Number(chapterId),
                answers,
            };

            // Thêm Bearer Token vào header của yêu cầu API
            await axios.post("/admin/questions", newQuestion, {
                headers: {
                    Authorization: `Bearer ${token}`, // Thêm Bearer Token vào header
                }
            });
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
                        <option value="">Chọn mức độ</option>
                        <option value="EASY">Dễ</option>
                        <option value="MEDIUM">Trung bình</option>
                        <option value="HARD">Khó</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="chapterId" className="form-label">ID Chương</label>
                    <input
                        type="number"
                        className="form-control"
                        id="chapterId"
                        value={chapterId}
                        onChange={(e) => setChapterId(e.target.value)}
                        required
                    />
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
