import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Lấy subjectId từ URL
import axiosLocalApi from '../../../api/local-api'; // Đảm bảo axios đã cấu hình đúng
// import '../style/RevisionSubject.css';

export default function RevisionSubject() {
    const { subjectId } = useParams(); // Lấy subjectId từ URL
    const [subject, setSubject] = useState(null);

    useEffect(() => {
        // Gọi API để lấy thông tin môn học theo subjectId
        const getSubjectDetails = async () => {
            try {
                const resp = await axiosLocalApi.get(`/public/subjects/${subjectId}`);
                setSubject(resp.data); // Lưu thông tin môn học vào state
            } catch (error) {
                console.error('Lỗi khi gọi API:', error);
            }
        };

        getSubjectDetails();
    }, [subjectId]); // Khi subjectId thay đổi, gọi lại API

    if (!subject) {
        return <div>Loading...</div>; // Nếu chưa có dữ liệu, hiển thị loading
    }

    return (
        <div className="subject-detail">
            <h2>{subject.name}</h2> {/* Hiển thị tên môn học */}
            <p>{subject.description}</p> {/* Hiển thị mô tả môn học */}
            {/* Bạn có thể hiển thị thêm thông tin ở đây */}
        </div>
    );
}