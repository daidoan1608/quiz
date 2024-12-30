import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosGetSubject from '../../Api/userApi';

export default function UpdateSubject() {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const [subject, setSubject] = useState({ name: '', description: '' });

    // Lấy thông tin môn học ban đầu
    useEffect(() => {
        getSubjectDetails();
    }, []);

    const getSubjectDetails = async () => {
        try {
            // Lấy Bearer Token từ localStorage
            const token = localStorage.getItem('token');

            const res = await axiosGetSubject.get(`/subjects/${subjectId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`, // Thêm Bearer Token vào header
                }
            });
            setSubject(res.data);
        } catch (error) {
            alert('Không thể lấy thông tin môn học!');
        }
    };

    // Cập nhật thông tin môn học
    const handleUpdate = async () => {
        try {
            // Lấy Bearer Token từ localStorage
            const token = localStorage.getItem('token');

            await axiosGetSubject.patch(`/admin/subjects/${subjectId}`, subject, {
                headers: {
                    'Authorization': `Bearer ${token}`, // Thêm Bearer Token vào header
                }
            });
            alert('Môn học đã được cập nhật thành công!');
            navigate('/subjects');
        } catch (error) {
            alert('Không thể cập nhật môn học!');
        }
    };

    // Xử lý thay đổi dữ liệu
    const handleChange = (e) => {
        const { name, value } = e.target;
        setSubject((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div>
            <h2>Cập nhật thông tin môn học</h2>
            <form>
                <div className="mb-3">
                    <label className="form-label">Tên môn học</label>
                    <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={subject.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Mô tả</label>
                    <textarea
                        className="form-control"
                        name="description"
                        value={subject.description}
                        onChange={handleChange}
                        required
                    ></textarea>
                </div>
                <button type="button" className="btn btn-primary" onClick={handleUpdate}>
                    Cập nhật
                </button>
                <button
                    type="button"
                    className="btn btn-secondary mx-2"
                    onClick={() => navigate('/subjects')}
                >
                    Hủy
                </button>
            </form>
        </div>
    );
}
