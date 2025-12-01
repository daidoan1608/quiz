import React, { useEffect, useState } from "react";
import { authAxios } from "../../api/axiosConfig";
import { useParams, useNavigate } from "react-router-dom";
import Pagination from '../common/Pagination';
import { BiEdit, BiTrash, BiPlus } from "react-icons/bi";

export default function ChooseQuestion() {
  const { chapterId } = useParams(); // Lấy chapterId từ URL
  const navigate = useNavigate(); // Sử dụng để chuyển hướng
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [itemsPerPage] = useState(5); // Số câu hỏi hiển thị trên mỗi trang

  // Lấy danh sách câu hỏi theo chapterId
  useEffect(() => {
    if (chapterId) {
      fetchQuestions(chapterId);
    }
  }, [chapterId]);

  const fetchQuestions = async (chapterId) => {
    try {
      const response = await authAxios.get(
        `/public/questions/chapter/${chapterId}`
      );
      if (response.data.data && response.data.data.length > 0) {
        setQuestions(response.data.data || []);
      } else {
        setQuestions([]); // Trường hợp không có câu hỏi nào
        alert("Không có câu hỏi nào cho chương này!");
      }
    } catch (error) {
      console.error(
        "Lỗi khi lấy danh sách câu hỏi:",
        error.response?.data || error.message
      );
      alert("Không thể lấy danh sách câu hỏi!");
    }
  };

  const handleDelete = async (questionId) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa câu hỏi này?"
    );
    if (confirmDelete) {
      try {
        await authAxios.delete(`/admin/questions/${questionId}`);
        alert("Xóa câu hỏi thành công!");
        setQuestions((prevQuestions) =>
          prevQuestions.filter((question) => question.questionId !== questionId)
        );
      } catch (error) {
        console.error(
          "Lỗi khi xóa câu hỏi:",
          error.response?.data || error.message
        );
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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Danh sách câu hỏi</h2>
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/chapter/addQuestions/${chapterId}`)}
        >
          <BiPlus />{" "}
        </button>
      </div>

      {questions.length === 0 ? (
        <p>Không có câu hỏi nào cho chương này.</p>
      ) : (
        <>
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
              {currentQuestions.map((question) => (
                <tr key={question.questionId}>
                  <td>{question.questionId}</td>
                  <td>{question.content}</td>
                  <td>{question.difficulty}</td>
                  <td>{question.chapterName}</td>
                  {renderAnswers(question.answers)}
                  <td>
                    {question.answers.find((answer) => answer.isCorrect)
                      ?.content || "-"}
                  </td>
                  <td>
                    <button
                      className="btn btn-danger mx-1"
                      onClick={() => handleDelete(question.questionId)}
                    >
                      <BiTrash />{" "}
                    </button>
                    <button
                      className="btn btn-success mx-1"
                      onClick={() =>
                        navigate(`/admin/questions/${question.questionId}`)
                      }
                    >
                      <BiEdit />{" "}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Thành phần Pagination */}
          <Pagination
            totalPages={Math.ceil(questions.length / itemsPerPage)}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
