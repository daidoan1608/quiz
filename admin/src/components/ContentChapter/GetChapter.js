import React, { useEffect, useState } from 'react';
import {authAxios} from '../../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import Pagination from '../common/Pagination';
import { BiEdit, BiPlus, BiTrash } from 'react-icons/bi';
import '../../styles/responsiveTable.css'

export default function GetChapter() {
    const [chapters, setChapters] = useState([]);
    const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
    const [itemsPerPage] = useState(5); // Số mục trên mỗi trang
    const navigate = useNavigate();

    // Lấy danh sách chương
    useEffect(() => {
        fetchChapters();
    }, []);

    // Hàm lấy dữ liệu chương
    const fetchChapters = async () => {
        try {
            const response = await authAxios.get('/public/chapters');
            setChapters(response.data.data);
        } catch (error) {
            console.error('Lỗi API:', error.response?.data || error.message);
            alert('Không thể lấy danh sách chương!');
        }
    };

    // Hàm xóa chương
    const deleteChapter = async (chapterId) => {
        try {
            await authAxios.delete(`/admin/chapters/${chapterId}`);
            setChapters((prevChapters) => prevChapters.filter((chapter) => chapter.chapterId !== chapterId));
            alert('Xóa chương thành công!');
        } catch (error) {
            console.error('Lỗi khi xóa chương:', error.response?.data || error.message);
            alert('Không thể xóa chương!');
        }
    };

    // Tính toán dữ liệu hiển thị dựa trên trang hiện tại
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentChapters = chapters.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className='responsive-table'>
            <h2 className='heading-content'>Quản lý Chương</h2>

            {/* Nút chuyển đến trang thêm chương */}
            <button
                className="btn btn-primary mb-3 float-end"
                onClick={() => navigate('/admin/add/chapter')}
            >
            <BiPlus />  
            </button>

            {/* Bảng danh sách chương */}
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Mã chương</th>
                        <th>Tên chương</th>
                        <th>Mã môn học</th>
                        <th>Chương số</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {currentChapters.map((chapter) => (
                        <tr key={chapter.chapterId}>
                            <td data-label="Mã chương">{chapter.chapterId}</td>
                            <td data-label="Tên chương">{chapter.name}</td>
                            <td data-label="Mã môn học">{chapter.subjectId}</td>
                            <td data-label="Chương số">{chapter.chapterNumber}</td>
                            <td data-label="Action">
                                <button
                                    className="btn btn-danger mx-1"
                                    onClick={() => deleteChapter(chapter.chapterId)}
                                >
                                <BiTrash    />  
                                </button>
                                <button
                                    className="btn btn-success mx-1"
                                    onClick={() =>
                                        navigate(`/admin/chapters/${chapter.chapterId}`)
                                    }
                                >
                                <BiEdit />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Thành phần Pagination */}
            <Pagination
                totalPages={Math.ceil(chapters.length / itemsPerPage)}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
