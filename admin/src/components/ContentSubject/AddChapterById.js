import React, { useState } from 'react';
import { authAxios } from '../../api/axiosConfig';
import { useNavigate, useParams } from 'react-router-dom';

export default function AddChapter() {
    const { subjectId } = useParams(); // Lấy subjectId từ URL
    const [name, setName] = useState('');
    const [chapterNumber, setChapterNumber] = useState('');
    const navigate = useNavigate();

    // Hàm gửi yêu cầu thêm chương
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const newChapter = {
                name,
                subjectId,
                chapterNumber
            };            
            // Gửi yêu cầu POST với Bearer Token
            await authAxios.post('/admin/chapters', newChapter);

            alert('Thêm chương thành công!');
            navigate(`/subjects/${subjectId}`);  // Quay lại trang danh sách chương
        } catch (error) {
            console.error('Lỗi khi thêm chương:', error.response?.data || error.message);
            alert('Không thể thêm chương!');
        }
    };

    // Hàm quay lại trang danh sách chương
    const handleCancel = () => {
        navigate(`/subjects/${subjectId}`);
    };

    return (
        <div>
            <h2>Thêm Chương</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Tên chương</label>
                    <input
                        type="text"
                        className="form-control"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="subjectId" className="form-label">Mã môn học</label>
                    <input
                        type="text"
                        className="form-control"
                        id="subjectId"
                        value={subjectId}
                        disabled
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="chapterNumber" className="form-label">Số chương</label>
                    <input
                        type="number"
                        className="form-control"
                        id="chapterNumber"
                        value={chapterNumber}
                        onChange={(e) => setChapterNumber(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary me-2">Thêm Chương</button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>Hủy</button>
            </form>
        </div>
    );
}
