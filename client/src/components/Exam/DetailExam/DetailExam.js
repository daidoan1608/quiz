import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
// import Headers from '../../Header';
import axiosLocalApi from "../../../api/local-api";
import './DetailExam.css'; // Import file CSS
import Footer from '../../Footer';
import Headers2 from '../../Headers2';

export default function DetailExam() {
    const [examData, setExamData] = useState(null);
    const [userAnswers, setUserAnswers] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const { examId, userExamId } = location.state || {};

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
                };
                const [examResponse, userAnswersResponse] = await Promise.all([
                    axiosLocalApi.get(`/exams/${examId}`, config),
                    axiosLocalApi.get(`/userexams/${userExamId}`, config)
                ]);
                setExamData(examResponse.data);
                setUserAnswers(userAnswersResponse.data);
            } catch (error) {
                setError(error.message || 'Error fetching exam data');
            } finally {
                setLoading(false);
            }
        };

        if (examId && userExamId) fetchData();
        else setError('Missing exam or user exam ID');
    }, [examId, userExamId]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!examData || !userAnswers) return <div>No data available</div>;

    const renderQuestions = () => {
        return examData.questions.map((question, questionIndex) => {
            const userAnswer = userAnswers.userAnswerDtos?.find(
                answer => answer.questionId === question.questionId
            );
            const correctAnswer = question.answers.find(answer => answer.isCorrect);

            return (
                <div key={question.questionId} className="mb-4">
                    <h3 className="font-bold"> {question.content}</h3> 
                    {/* Câu {questionIndex + 1}: */}
                    <div className="flex flex-col">
                        {question.answers.map((answer) => {
                            const isCorrect = answer.isCorrect;
                            const isUserAnswer = userAnswer?.answerId === answer.optionId;

                            return (
                                <div
                                    key={answer.optionId}
                                    className={`p-2 mb-2 border rounded-lg 
                                    ${isCorrect ? 'correct-answer' : 
                                    isUserAnswer ? 'incorrect-user-answer' : 'default-answer'}`}
                                >
                                    <span
                                        className={`${isCorrect ? 'text-black' : 'text-black'}`}
                                    >
                                        {answer.content}
                                    </span>
                                    {/* Nếu người dùng chọn đúng, thêm dấu tích xanh */}
                                    {isUserAnswer && isCorrect && (
                                        <span className="correct-icon ml-2">✔️</span>
                                    )}
                                    {/* Nếu người dùng chọn sai, thêm dấu X đỏ */}
                                    {isUserAnswer && !isCorrect && (
                                        <span className="incorrect-icon ml-2">❌</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        });
    };

    return (
        <>
            <Headers2 />
            <div className="p-4">
                <h2 className="text-xl font-bold mb-4">{examData.title}: {examData.subjectName}</h2>
                {renderQuestions()}
            </div>
            <Footer />
        </>
    );
}
