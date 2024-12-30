import React, { useEffect, useState } from 'react';
import axiosGetSubject from '../../Api/userApi';
import { useNavigate } from 'react-router-dom';
import Pagination from '../Pagination'; // Đường dẫn tùy theo dự án của bạn

export default function GetSubject() {
    const [subjects, setSubjects] = useState([]);
    const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
    const [itemsPerPage] = useState(5); // Số mục trên mỗi trang
    const navigate = useNavigate();

    // Lấy tất cả môn học
    useEffect(() => {
        getAllSubject();
    }, []);

    // Hàm gọi API để lấy dữ liệu môn học
    const getAllSubject = async () => {
        try {
            const token = localStorage.getItem('token');  // Lấy token từ localStorage hoặc cookie
            const rep = await axiosGetSubject.get('public/subjects', {
                headers: {
                    'Authorization': `Bearer ${token}`,  // Thêm Bearer Token vào header
                },
            });
            setSubjects(rep.data);
        } catch (error) {
            console.error("Error fetching subjects:", error);
            alert("Không thể tải danh sách môn học!");
        }
    };

    // Hàm xóa môn học
    const deleteSubject = async (subjectId) => {
        try {
            const token = localStorage.getItem('token');
            await axiosGetSubject.delete(`/admin/subjects/${subjectId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            setSubjects((prevSubjects) => prevSubjects.filter(subject => subject.subjectId !== subjectId));
            alert('Môn học đã được xóa thành công!');
        } catch (error) {
            alert('Không thể xóa môn học!');
        }
    };

    // Hàm chuyển hướng đến trang chapters với subjectId
    const goToChapters = (subjectId) => {
        navigate(`/subjects/${subjectId}`);
    };

    // Tính toán dữ liệu hiển thị dựa trên trang hiện tại
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSubjects = subjects.slice(indexOfFirstItem, indexOfLastItem);

    // Render danh sách môn học
    const elementSubject = currentSubjects.map((item) => (
        <tr key={item.subjectId}>
            <td>{item.subjectId}</td>
            <td>{item.name}</td>
            <td>{item.description}</td>
            <td>
                <button
                    className="btn btn-danger mx-1"
                    onClick={() => deleteSubject(item.subjectId)}
                >
                    Xóa
                </button>
                <button
                    className="btn btn-warning mx-1"
                    onClick={() => goToChapters(item.subjectId)}
                >
                    Chọn chương
                </button>
                <button
                    className="btn btn-success mx-1"
                    onClick={() => navigate(`/admin/subjects/${item.subjectId}`)}
                >
                    Cập nhật
                </button>
            </td>
        </tr>
    ));

    return (
        <div>
            <h2>Quản lý môn học</h2>
            <button
                className="btn btn-primary mb-3 float-end"
                onClick={() => navigate('/admin/subjects')}
            >
                Thêm môn học
            </button>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Mã môn học</th>
                        <th>Tên môn học</th>
                        <th>Mô tả</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>{elementSubject}</tbody>
            </table>
            <Pagination
                totalPages={Math.ceil(subjects.length / itemsPerPage)}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
