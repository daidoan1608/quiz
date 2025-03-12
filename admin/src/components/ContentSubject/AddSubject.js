import React, { useState, useEffect } from 'react';
import { authAxios } from '../../Api/axiosConfig';
import { useNavigate } from 'react-router-dom';

export default function AddSubject() {
    const [newSubject, setNewSubject] = useState({
        categoryId: '',
        name: '',
        description: ''
    });
    const [categories, setCategories] = useState([]); // Lưu danh sách khoa
    const navigate = useNavigate();

    // Hàm lấy danh sách khoa
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await authAxios.get("/public/categories");
                setCategories(response.data); // Lưu danh sách khoa vào state
            } catch (error) {
                console.error('Lỗi khi lấy danh sách khoa: ', error);
                alert('Không thể lấy danh sách khoa!');
            }
        };

        fetchCategories();
    }, []);

    // Hàm thêm môn học mới
    const addSubject = async (e) => {
        e.preventDefault();
        try {
            const response = await authAxios.post("/admin/subjects", newSubject);
            console.log('Thêm môn học thành công: ', response.data);
            setNewSubject({
                categoryId: '',
                name: '',
                description: ''
            });
            navigate('/subjects'); // Quay về trang danh sách môn học sau khi thêm
        } catch (error) {
            console.error('Lỗi khi thêm môn học: ', error);
            alert('Không thể thêm môn học!');
        }
    };

    return (
        <div>
            <h2>Thêm môn học</h2>
            <form onSubmit={addSubject}>
                {/* Dropdown chọn khoa */}
                <div className="form-group mb-3">
                    <label> Chọn Khoa</label>
                    <select
                        className="form-control"
                        value={newSubject.categoryId}
                        onChange={(e) => setNewSubject({ ...newSubject, categoryId: e.target.value })}
                        required
                    >
                        <option value="">-- Chọn Khoa --</option>
                        {categories.map((category) => (
                            <option key={category.categoryId} value={category.categoryId}>
                                {category.categoryName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tên môn học */}
                <div className="form-group mb-3">
                    <label>Tên môn học:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={newSubject.name}
                        onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                        required
                    />
                </div>

                {/* Mô tả môn học */}
                <div className="form-group mb-3">
                    <label>Mô tả:</label>
                    <textarea
                        className="form-control"
                        value={newSubject.description}
                        onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                        required = {false}
                    />
                </div>

                {/* Nút lưu */}
                <button type="submit" className="btn btn-success">Lưu</button>
                {/* Nút hủy */}
                <button type="button" className="btn btn-secondary mx-2" onClick={() => navigate('/subjects')}>Hủy</button>
            </form>
        </div>
    );
}
