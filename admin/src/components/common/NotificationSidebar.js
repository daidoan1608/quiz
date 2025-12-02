
// src/components/common/NotificationSidebar.js

import React from 'react';
import { IoClose } from "react-icons/io5";
import '../../styles/notificationSidebar.css';

export const NotificationSidebar = ({ isOpen, onClose }) => {
    return (
        <>
            {/* Overlay (Lớp phủ mờ) */}
            {isOpen && <div className="notification-overlay" onClick={onClose}></div>}

            {/* Sidebar thực tế */}
            <div className={`notification-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h3>Thông báo</h3>
                    <IoClose className="close-icon" size={24} onClick={onClose} />
                </div>
                <div className="sidebar-content">
                    {/* Ví dụ nội dung thông báo */}
                    <div className="notification-item">
                        <p>Thông báo 1: Đã có kết quả bài thi mới.</p>
                        <span className="timestamp">5 phút trước</span>
                    </div>
                    <div className="notification-item">
                        <p>Thông báo 2: Chương mới đã được thêm vào môn học A.</p>
                        <span className="timestamp">1 giờ trước</span>
                    </div>
                    {/* Thêm danh sách thông báo thực tế ở đây */}
                </div>
            </div>
        </>
    );
};