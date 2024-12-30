import React, { useEffect, useState } from 'react';
import axiosGetExam from '../../Api/userApi';
import { useNavigate } from 'react-router-dom';
import Pagination from '../Pagination'; // Sử dụng thành phần Pagination đã tạo

export default function GetExam() {
    const [exams, setExams] = useState([]); // Lưu danh sách bài thi
    const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
    const [itemsPerPage] = useState(5); // Số bài thi hiển thị trên mỗi trang
    const navigate = useNavigate();

    useEffect(() => {
        getAllExams();
    }, []);

    const getAllExams = async () => {
        try {
            const response = await axiosGetExam.get("/public/admin/exams");
            setExams(response.data); // Lưu dữ liệu vào state
        } catch (error) {
            console.error('Error fetching exams: ', error);
        }
    };

    // Tính toán các bài thi hiển thị trên trang hiện tại
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentExams = exams.slice(indexOfFirstItem, indexOfLastItem);

    // Render dữ liệu ra bảng
    const elementExams = currentExams.map((item, index) => (
        <tr key={index}>
            <td>{item.subjectId}</td> {/* Mã môn học */}
            <td>{item.title}</td> {/* Tên đề thi */}
            <td>{item.description}</td> {/* Mô tả đề thi */}
            <td>{item.duration} phút</td> {/* Thời gian */}
            <td>{item.questions.length} câu hỏi</td> {/* Số câu hỏi */}
        </tr>
    ));

    return (
        <div>
            <h2>Quản lý bài thi</h2>

            {/* Nút "Thêm bài thi" góc trên bên phải */}
            <button
                className="btn btn-primary mb-3 float-end"
                onClick={() => navigate('/admin/add/exams')}
            >
                Thêm bài thi
            </button>

            <table className='table table-bordered'>
                <thead>
                    <tr>
                        <th>Mã môn học</th>
                        <th>Tên đề thi</th>
                        <th>Mô tả</th>
                        <th>Thời gian</th>
                        <th>Số câu hỏi</th>
                    </tr>
                </thead>
                <tbody>
                    {elementExams}
                </tbody>
            </table>

            {/* Phân trang */}
            <Pagination
                totalPages={Math.ceil(exams.length / itemsPerPage)} // Tổng số trang
                currentPage={currentPage} // Trang hiện tại
                onPageChange={setCurrentPage} // Hàm thay đổi trang
            />
        </div>
    );
}
