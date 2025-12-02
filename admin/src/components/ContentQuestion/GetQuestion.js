import React, { useEffect, useState } from "react";
import { authAxios } from "../../api/axiosConfig";
import Pagination from "../common/Pagination";
import { BiEdit, BiTrash, BiPlus } from "react-icons/bi";
import { CiImport } from "react-icons/ci";
import "../../styles/GetQuestion.css";
import "../../styles/responsiveTable.css";

export default function GetQuestion() {
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [itemsPerPage] = useState(7); // Số câu hỏi mỗi trang

  useEffect(() => {
    getAllQuestions();
  }, []);

  const getAllQuestions = async () => {
    try {
      const response = await authAxios.get("/admin/questions");
      setQuestions(response.data.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
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
        console.error("Error deleting question:", error);
        alert("Không thể xóa câu hỏi!");
      }
    }
  };

  const renderAnswers = (answers) => {
    const columns = answers.map((answer, index) => (
      <td
        data-label={`Đáp án ${String.fromCharCode(65 + index)}`}
        key={index}
        className="truncated-text"
      >
        {answer.content}
      </td>
    ));
    while (columns.length < 4) {
      columns.push(
        <td key={`empty-${columns.length}`} className="truncated-text">
          -
        </td>
      );
    }
    return columns;
  };

  // Tính toán dữ liệu hiển thị theo trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentQuestions = questions.slice(indexOfFirstItem, indexOfLastItem);

  const elementQuestion = currentQuestions.map((item) => (
    <tr key={item.questionId}>
      <td data-label="Mã câu hỏi" className="truncated-text">
        {item.questionId}
      </td>
      <td data-label="Nội dung" className="truncated-text" titel={item.content}>
        {item.content}
      </td>
      <td data-label="Mức độ" className="truncated-text">
        {item.difficulty}
      </td>
      <td data-label="Tên chương" className="truncated-text">
        {item.chapterName}
      </td>
      {renderAnswers(item.answers)}
      <td data-label="Đáp án đúng" className="truncated-text">
        {item.answers.find((answer) => answer.isCorrect)?.content ||
          "No correct answer"}
      </td>
      <td data-label="Action">
        <button
          className="btn btn-danger mx-1"
          onClick={() => handleDelete(item.questionId)}
        >
          <BiTrash />
        </button>
        <button
          className="btn btn-success mx-1"
          onClick={() =>
            (window.location.href = `/admin/questions/${item.questionId}`)
          }
        >
          <BiEdit />
        </button>
      </td>
    </tr>
  ));

  return (
    <div className="responsive-table">
      <h2 className="heading-content">Quản lý câu hỏi</h2>
      <div>
        <button
          className="btn btn-primary mb-3 float-end"
          onClick={() => (window.location.href = "/admin/questions")}
        >
          <BiPlus />
        </button>
        <button
          className="btn btn-primary mb-3 float-end mx-2"
          onClick={() => (window.location.href = "/import")}
        >
          <CiImport />
          Import
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
            <th>Action</th>
          </tr>
        </thead>
        <tbody>{elementQuestion}</tbody>
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
