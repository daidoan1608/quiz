import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from '../common/Pagination';
import { authAxios } from '../../api/axiosConfig';
import { BiEdit, BiTrash, BiCheckCircle, BiPlus } from 'react-icons/bi';
import '../../styles/responsiveTable.css'

export default function GetSubject() {
    const [subjects, setSubjects] = useState([]);
    const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
    const [itemsPerPage] = useState(7); // Số mục trên mỗi trang
    const navigate = useNavigate();

    // Lấy tất cả môn học
    useEffect(() => {
        getAllSubject();
    }, []);

    // Hàm gọi API để lấy dữ liệu môn học
    const getAllSubject = async () => {
        try {
            const rep = await authAxios.get('public/subjects');
            setSubjects(rep.data.data);
        } catch (error) {
            console.error("Error fetching subjects:", error);
            alert("Không thể tải danh sách môn học!");
        }
    };

    // Hàm xóa môn học
    const deleteSubject = async (subjectId) => {
        try {
            await authAxios.delete(`/admin/subjects/${subjectId}`);
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
            <td data-label="Mã môn học">{item.subjectId}</td>
            <td data-label="Tên môn học">{item.name}</td>
            <td data-label="Mô tả">{item.description||"Không có"}</td>
            <td data-label="Action">
                <button
                    className="btn btn-danger mx-1"
                    onClick={() => deleteSubject(item.subjectId)}
                >
                <BiTrash />
                </button>
                <button
                    className="btn btn-warning mx-1"
                    onClick={() => goToChapters(item.subjectId)}
                >
                <BiCheckCircle />
                </button>
                <button
                    className="btn btn-success mx-1"
                    onClick={() => navigate(`/admin/subjects/${item.subjectId}`)}
                >
                <BiEdit />
                </button>
            </td>
        </tr>
    ));

    return (
        <div className='responsive-table'>
            <h2 className='heading-content'>Quản lý môn học</h2>
            <button
                className="btn btn-primary mb-3 float-end"
                onClick={() => navigate('/admin/subjects')}
            >
            <BiPlus/>
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
