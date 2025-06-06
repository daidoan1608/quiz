import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BiCheckCircle } from 'react-icons/bi';
import { authAxios } from '../../Api/axiosConfig';
import Pagination from '../Pagination';
import "../../styles/responsiveTable.css";

export default function GetUserExam() {
    const [userExams, setUserExams] = useState([]);
    const [userInfoMap, setUserInfoMap] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserExams();
    }, []);

    const fetchUserExams = async () => {
        try {
            const response = await authAxios.get('/admin/userexams');
            const data = response.data.data || [];
            setUserExams(data);

            // Lấy tất cả userId duy nhất
            const uniqueUserIds = [...new Set(data.map(item => item.userExamDto.userId))];

            // Gọi API lấy thông tin user
            uniqueUserIds.forEach(userId => {
                fetchUserInfo(userId);
            });
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu user exams: ', error);
        }
    };

    const fetchUserInfo = async (userId) => {
        try {
            const response = await authAxios.get(`/user/${userId}`);
            const userData = response.data.data; // Truy cập đúng vào "data" trong JSON
            setUserInfoMap((prev) => ({
                ...prev,
                [userId]: userData
            }));
        } catch (error) {
            console.error(`Lỗi khi lấy thông tin user ${userId}: `, error);
            setUserInfoMap((prev) => ({
                ...prev,
                [userId]: { username: 'Không có', fullName: 'Không có' }
            }));
        }
    };

    const handleViewExam = (userExamId) => {
        navigate(`/userexam/${userExamId}`);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUserExams = userExams.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="container mt-4 responsive-table">
            <h2 className="mb-4 heading-content">Quản lý bài thi người dùng</h2>

            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Môn học</th>
                        <th>Đề thi</th>
                        <th>Thời gian bắt đầu</th>
                        <th>Thời gian kết thúc</th>
                        <th>Điểm</th>
                        <th>User ID</th>
                        <th>Username</th>
                        <th>Họ tên</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {currentUserExams.map((item, index) => {
                        const exam = item.userExamDto;
                        const userInfo = userInfoMap[exam.userId] || {};

                        return (
                            <tr key={exam.userExamId || index}>
                                <td data-label="Môn học">{item.subjectName}</td>
                                <td data-label="Đề thi">{item.title}</td>
                                <td data-label="Thời gian bắt đầu">{new Date(exam.startTime).toLocaleString()}</td>
                                <td data-label="Thời gian kết thúc">{new Date(exam.endTime).toLocaleString()}</td>
                                <td data-label="Điểm">{exam.score}</td>
                                <td data-label="User ID">{exam.userId}</td>
                                <td data-label="Username">{userInfo.username || 'Đang tải...'}</td>
                                <td data-label="Họ tên">{userInfo.fullName || 'Đang tải...'}</td>
                                <td data-label="Action">
                                    <BiCheckCircle
                                        size={24}
                                        color="green"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleViewExam(exam.userExamId)}
                                        title="Xem chi tiết bài thi"
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <Pagination
                totalPages={Math.ceil(userExams.length / itemsPerPage)}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
