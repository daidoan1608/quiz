import React, { useEffect, useState } from 'react';
import axios from '../../Api/userApi'; // Sử dụng axios đã cấu hình từ file axios.js
import { useParams, useNavigate } from 'react-router-dom';

export default function UpdateQuestion() {
    const { questionId } = useParams(); // Lấy questionId từ URL
    const [question, setQuestion] = useState(null); // Dữ liệu câu hỏi
    const navigate = useNavigate();

    useEffect(() => {
        // Lấy dữ liệu câu hỏi
        const fetchQuestion = async () => {
            try {
                const token = localStorage.getItem('token'); // Lấy token từ localStorage
                const response = await axios.get(`/admin/questions/${questionId}`, {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : '',
                    },
                });
                setQuestion(response.data);
            } catch (error) {
                console.error('Error fetching question:', error);
                alert('Không thể tải câu hỏi!');
            }
        };

        fetchQuestion();
    }, [questionId]);

    const handleInputChange = (field, value) => {
        setQuestion({ ...question, [field]: value });
    };

    const handleAnswerChange = (index, field, value) => {
        const updatedAnswers = [...question.answers];
        updatedAnswers[index][field] = value;
        setQuestion({ ...question, answers: updatedAnswers });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token'); // Lấy token từ localStorage
            await axios.patch(`/admin/questions/${questionId}`, question, {
                headers: {
                    Authorization: token ? `Bearer ${token}` : '',
                },
            });
            alert('Cập nhật câu hỏi thành công!');
            navigate('/chapter/questions'); // Chuyển hướng về trang danh sách câu hỏi
        } catch (error) {
            console.error('Error updating question:', error);
            alert('Không thể cập nhật câu hỏi!');
        }
    };

    const handleCancel = () => {
        navigate('/chapter/questions'); // Quay lại trang danh sách câu hỏi
    };

    if (!question) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Cập Nhật Câu Hỏi</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="content" className="form-label">Nội dung câu hỏi</label>
                    <input
                        type="text"
                        className="form-control"
                        id="content"
                        value={question.content}
                        onChange={(e) => handleInputChange('content', e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="difficulty" className="form-label">Mức độ</label>
                    <select
                        className="form-control"
                        id="difficulty"
                        value={question.difficulty}
                        onChange={(e) => handleInputChange('difficulty', e.target.value)}
                        required
                    >
                        <option value="">Chọn mức độ</option>
                        <option value="EASY">Dễ</option>
                        <option value="MEDIUM">Trung bình</option>
                        <option value="HARD">Khó</option>
                    </select>
                </div>
                {question.answers.map((answer, index) => (
                    <div key={answer.optionId} className="mb-3">
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
                                onChange={() => {
                                    // Đặt tất cả isCorrect thành false, chỉ đáp án hiện tại thành true
                                    const updatedAnswers = question.answers.map((ans, i) => ({
                                        ...ans,
                                        isCorrect: i === index,
                                    }));
                                    setQuestion({ ...question, answers: updatedAnswers });
                                }}
                                checked={answer.isCorrect}
                                required
                            />
                            <label className="form-check-label">Đáp án đúng</label>
                        </div>
                    </div>
                ))}
                <div className="d-flex justify-content-start gap-2">
                    <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                        Hủy
                    </button>
                    <button type="submit" className="btn btn-primary">
                        Cập Nhật
                    </button>
                </div>
            </form>
        </div>
    );
}
