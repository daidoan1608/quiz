import React, { useEffect, useState } from 'react';
import './ReviewExam.css';
import Headers from '../../Header';

export default function ReviewExam() {
    const [examDetails, setExamDetails] = useState(null); // Thông tin bài thi
    const [selectedAnswers, setSelectedAnswers] = useState({}); // Câu trả lời đã chọn từ localStorage

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const examId = queryParams.get('examId'); // Lấy examId từ URL
        if (examId) {
            // Giả sử bạn đã có API để lấy chi tiết bài thi
            // Gọi API để lấy chi tiết bài thi từ server theo examId
            // setExamDetails(response.data);

            // Lấy câu trả lời đã chọn từ localStorage
            const savedAnswers = JSON.parse(localStorage.getItem('selectedAnswers')) || {};
            setSelectedAnswers(savedAnswers[examId] || {});
        }
    }, []);

    return (
        <>
            <Headers />
            <div className="category-review">
                <div className="review-card">
                    <div className="review-text">
                        <h1>KẾT QUẢ BÀI THI GẦN NHẤT!</h1>
                        {/* Thông tin kết quả bài thi */}
                        <p>Ngày thi: {examDetails?.date}</p>
                        <p>Câu đúng: {examDetails?.correctAnswers}</p>
                        <p>Thời gian: {examDetails?.timeSpent}</p>
                        <p>Điểm: {examDetails?.score}</p>
                    </div>
                </div>

                <div className="category-review-qa">
                    {examDetails?.questions.map((question, index) => {
                        const userAnswer = selectedAnswers[question.id];
                        const isCorrect = userAnswer === question.correctAnswer;
                        return (
                            <div className="question" key={index}>
                                <div className={`question-title ${isCorrect ? 'correct' : 'incorrect'}`}>
                                    Câu {index + 1}: {question.text}
                                </div>
                                <ul className="options">
                                    {question.options.map((option, optionIndex) => {
                                        const isSelected = userAnswer === option;
                                        return (
                                            <li key={optionIndex}>
                                                <span className={`option-circle ${isSelected ? 'selected' : ''}`}>
                                                    {option}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
