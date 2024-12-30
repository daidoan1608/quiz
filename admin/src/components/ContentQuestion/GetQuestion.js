import React, { useEffect, useState } from 'react';
import axiosGetQuestion from '../../Api/userApi';
import Pagination from '../Pagination'; // Sử dụng thành phần Pagination

export default function GetQuestion() {
    const [questions, setQuestions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
    const [itemsPerPage] = useState(5); // Số câu hỏi mỗi trang

    useEffect(() => {
        getAllQuestions();
    }, []);

    const getAllQuestions = async () => {
        try {
            const token = localStorage.getItem('token');  // Lấy token từ localStorage hoặc cookie
            const response = await axiosGetQuestion.get("/chapter/questions", {
                headers: {
                    'Authorization': `Bearer ${token}`,  // Thêm Bearer Token vào header
                }
            });
            setQuestions(response.data);
        } catch (error) {
            console.error("Error fetching questions:", error);
        }
    };

    const handleDelete = async (questionId) => {
        const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này?");
        if (confirmDelete) {
            try {
                const token = localStorage.getItem('token');
                await axiosGetQuestion.delete(`/admin/questions/${questionId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
                alert("Xóa câu hỏi thành công!");
                setQuestions((prevQuestions) => prevQuestions.filter((question) => question.questionId !== questionId));
            } catch (error) {
                console.error("Error deleting question:", error);
                alert("Không thể xóa câu hỏi!");
            }
        }
    };

    const renderAnswers = (answers) => {
        const columns = answers.map((answer, index) => (
            <td key={index}>{answer.content}</td>
        ));
        while (columns.length < 4) {
            columns.push(<td key={`empty-${columns.length}`}>-</td>);
        }
        return columns;
    };

    // Tính toán dữ liệu hiển thị theo trang hiện tại
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentQuestions = questions.slice(indexOfFirstItem, indexOfLastItem);

    const elementQuestion = currentQuestions.map((item) => (
        <tr key={item.questionId}>
            <td>{item.questionId}</td>
            <td>{item.content}</td>
            <td>{item.difficulty}</td>
            <td>{item.chapterName}</td>
            {renderAnswers(item.answers)}
            <td>
                {item.answers.find(answer => answer.isCorrect)?.content || "No correct answer"}
            </td>
            <td>
                <button
                    className="btn btn-danger mx-1"
                    onClick={() => handleDelete(item.questionId)}
                >
                    Xóa
                </button>
                <button
                    className="btn btn-success mx-1"
                    onClick={() => window.location.href = `/admin/questions/${item.questionId}`}
                >
                    Cập nhật
                </button>
            </td>
        </tr>
    ));

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Quản lý câu hỏi</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => window.location.href = "/admin/questions"}
                >
                    Thêm Câu Hỏi
                </button>
            </div>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Mã câu hỏi</th>
                        <th>Nội dung</th>
                        <th>Mức độ</th>
                        <th>Tên chương</th>
                        <th>Đáp án A</th>
                        <th>Đáp án B</th>
                        <th>Đáp án C</th>
                        <th>Đáp án D</th>
                        <th>Đáp án đúng</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {elementQuestion}
                </tbody>
            </table>

            {/* Thành phần Pagination */}
            <Pagination
                totalPages={Math.ceil(questions.length / itemsPerPage)}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
