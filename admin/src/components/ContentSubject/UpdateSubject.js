import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {authAxios} from '../../api/axiosConfig';

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
            const res = await authAxios.get(`public/subjects/${subjectId}`);
            setSubject(res.data.data);
            console.log(res.data.data);
        } catch (error) {
            alert('Không thể lấy thông tin môn học!');
        }
    };

    // Cập nhật thông tin môn học
    const handleUpdate = async () => {
        try {
            await authAxios.patch(`/admin/subjects/${subjectId}`, subject);
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
