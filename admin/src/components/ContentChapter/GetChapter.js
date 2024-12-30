import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Pagination from '../Pagination'; // Sử dụng thành phần Pagination đã xây dựng

export default function GetChapter() {
    const [chapters, setChapters] = useState([]);
    const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
    const [itemsPerPage] = useState(5); // Số mục trên mỗi trang
    const navigate = useNavigate();

    // Lấy token từ localStorage hoặc từ nơi bạn lưu trữ token
    const token = localStorage.getItem('token'); // Ví dụ lấy từ localStorage

    // Lấy danh sách chương
    useEffect(() => {
        fetchChapters();
    }, []);

    // Hàm lấy dữ liệu chương
    const fetchChapters = async () => {
        try {
            const response = await axios.get('http://localhost:8080/public/subject/chapters', {
                headers: {
                    Authorization: `Bearer ${token}`  // Thêm Bearer Token vào header
                }
            });
            setChapters(response.data);
        } catch (error) {
            console.error('Lỗi API:', error.response?.data || error.message);
            alert('Không thể lấy danh sách chương!');
        }
    };

    // Hàm xóa chương
    const deleteChapter = async (chapterId) => {
        try {
            await axios.delete(`http://localhost:8080/admin/chapters/${chapterId}`, {
                headers: {
                    Authorization: `Bearer ${token}`  // Thêm Bearer Token vào header
                }
            });
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
        <div>
            <h2>Quản lý Chương</h2>

            {/* Nút chuyển đến trang thêm chương */}
            <button
                className="btn btn-primary mb-3 float-end"
                onClick={() => navigate('/admin/add/chapter')}
            >
                Thêm chương
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
                            <td>{chapter.chapterId}</td>
                            <td>{chapter.name}</td>
                            <td>{chapter.subjectId}</td>
                            <td>{chapter.chapterNumber}</td>
                            <td>
                                <button
                                    className="btn btn-danger mx-1"
                                    onClick={() => deleteChapter(chapter.chapterId)}
                                >
                                    Xóa
                                </button>
                                <button
                                    className="btn btn-success mx-1"
                                    onClick={() =>
                                        navigate(`/admin/chapters/${chapter.chapterId}`)
                                    }
                                >
                                    Cập nhật
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
