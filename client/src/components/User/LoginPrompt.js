// LoginPrompt.js
import React from 'react';
import './LoginPrompt.css'; // Importing the CSS file

const LoginPrompt = ({ onLoginRedirect, onClose }) => {
    return (
        <div className="login-overlay">
            <div className="login-prompt">
                <p className="login-message">
                    Bạn cần đăng nhập để thực hiện thao tác này.
                </p>
                <div style={{ textAlign: "center" }}>
                    <button
                        onClick={onLoginRedirect}
                        className="button" // Use common button class
                    >
                        Đăng nhập ngay
                    </button>
                    <button
                        onClick={onClose}
                        className="button" // Use common button class
                        style={{
                            backgroundColor: "#ccc", // Different background for close button
                            color: "#000",
                            marginLeft: '10px', // Add some margin for spacing
                        }}
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPrompt;
