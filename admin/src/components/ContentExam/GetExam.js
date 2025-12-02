import React, { useEffect, useState } from 'react';
import {authAxios} from '../../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import Pagination from '../common/Pagination';
import { BiPlus } from "react-icons/bi"; // Import các icon từ react-icons
import '../../styles/responsiveTable.css'

export default function GetExam() {
    const [exams, setExams] = useState([]); // Lưu danh sách bài thi
    const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
    const [itemsPerPage] = useState(7);
    const navigate = useNavigate();

    useEffect(() => {
        getAllExams();
    }, []);

    const getAllExams = async () => {
        try {
            const response = await authAxios.get("/admin/exams");
            setExams(response.data.data); // Lưu dữ liệu vào state
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
            <td data-label="Mã môn học">{item.subjectId}</td> {/* Mã môn học */}
            <td data-label="Tên đề thi">{item.title}</td> {/* Tên đề thi */}
            <td data-label="Mô tả"> {item.description||"Không có"}</td> {/* Mô tả đề thi */}
            <td data-label="Thời gian">{item.duration} phút</td> {/* Thời gian */}
            <td data-label="Số câu hỏi">{item.questions.length} câu hỏi</td> {/* Số câu hỏi */}
        </tr>
    ));

    return (
        <div className='responsive-table'>
            <h2 className='heading-content'>Quản lý bài thi</h2>

            {/* Nút "Thêm bài thi" góc trên bên phải */}
            <button
                className="btn btn-primary mb-3 float-end"
                onClick={() => navigate('/admin/add/exams')}
            >
            <BiPlus />
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
