import React, { useState } from 'react';
import {authAxios} from '../../Api/axiosConfig';
import { useNavigate } from 'react-router-dom';

export default function AddUser() {
    const [newUser, setNewUser] = useState({
        username: '',
        fullName: '',
        email: '',
        password: '',
        role: '',
    });
    const navigate = useNavigate();

    // Hàm thêm người dùng
    const addUser = async (e) => {
        e.preventDefault();
        try {
            await authAxios.post('/admin/add/users', newUser);
            alert('Thêm người dùng thành công!');
            navigate('/admin/users'); // Điều hướng đến trang quản lý user
        } catch (error) {
            console.error('Lỗi khi thêm người dùng:', error.response?.data || error.message);
            alert('Không thể thêm người dùng!');
        }
    };

    return (
        <div>
            <h2>Thêm User</h2>
            <form onSubmit={addUser}>
                <div className="form-group">
                    <label>Tên tài khoản:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Họ và tên:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={newUser.fullName}
                        onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        className="form-control"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Mật khẩu:</label>
                    <input
                        type="password"
                        className="form-control"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Role:</label>
                    <select
                        className="form-control"
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        required
                    >
                        <option value="">Chọn role</option>
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-success mt-3">
                    Lưu
                </button>
                <button
                    type="button"
                    className="btn btn-secondary mt-3 mx-2"
                    onClick={() => navigate('/admin/users')} // Điều hướng đến trang quản lý user
                >
                    Hủy
                </button>
            </form>
        </div>
    );
}
