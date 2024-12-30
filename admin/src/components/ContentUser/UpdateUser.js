import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function UpdateUser() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState({ fullName: '', email: '', role: 'USER' });

    // Lấy token từ localStorage hoặc từ nơi bạn lưu trữ token
    const token = localStorage.getItem('token'); // Ví dụ lấy từ localStorage

    // Hàm lấy thông tin người dùng
    const fetchUserDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`  // Thêm Bearer Token vào header
                }
            });
            setUser({
                fullName: response.data.fullName,
                email: response.data.email,
                role: response.data.role || '', // Đảm bảo lấy đúng role của người dùng
            });
        } catch (error) {
            console.error('Lỗi khi lấy thông tin người dùng:', error.response?.data || error.message);
            alert('Không thể lấy thông tin người dùng!');
        }
    };

    // Hàm cập nhật thông tin người dùng
    const handleUpdate = async () => {
        try {
            const updatedUser = { 
                fullName: user.fullName, 
                email: user.email, 
                role: user.role // Gửi role thay vì mật khẩu
            };
            console.log(updatedUser);
            await axios.patch(`http://localhost:8080/update/users/${userId}`, updatedUser, {
                headers: {
                    Authorization: `Bearer ${token}`  // Thêm Bearer Token vào header
                }
            });
            alert('Cập nhật thông tin người dùng thành công!');
            navigate('/admin/users'); // Quay lại trang danh sách người dùng
        } catch (error) {
            console.error('Lỗi khi cập nhật thông tin người dùng:', error.response?.data || error.message);
            alert('Không thể cập nhật thông tin người dùng!');
        }
    };

    useEffect(() => {
        fetchUserDetails();
    }, [userId]);

    return (
        <div>
            <h2>Cập nhật thông tin người dùng</h2>
            <form onSubmit={(e) => e.preventDefault()}>
                <div className="mb-3">
                    <label htmlFor="fullName" className="form-label">Họ và tên</label>
                    <input
                        type="text"
                        className="form-control"
                        id="fullName"
                        value={user.fullName}
                        onChange={(e) => setUser({ ...user, fullName: e.target.value })}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={user.email}
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="role" className="form-label">Vai trò</label>
                    <select
                        className="form-control"
                        id="role"
                        value={user.role}
                        onChange={(e) => setUser({ ...user, role: e.target.value })}
                    >
                        <option value="ADMIN">ADMIN</option>
                        <option value="USER">USER</option>
                    </select>
                </div>
                <button className="btn btn-primary" onClick={handleUpdate}>
                    Cập nhật
                </button>
            </form>
        </div>
    );
}
