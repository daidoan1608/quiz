import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LessonList.css";

export default function LessonListChap() {
    const [favoriteChapters, setFavoriteChapters] = useState([]);
    const navigate = useNavigate();

    // Load favorite chapters from localStorage
    useEffect(() => {
        const savedFavorites = JSON.parse(localStorage.getItem("favoriteChapters")) || {};
        // Chuyển đổi đối tượng lưu trữ thành mảng
        const chaptersArray = Object.keys(savedFavorites).map(chapterId => ({
            chapterId,
            isFavorite: savedFavorites[chapterId].isFavorite,
            name: savedFavorites[chapterId].name, // Lấy tên chương từ localStorage
        }));
        setFavoriteChapters(chaptersArray);
    }, []);

    const handleRemoveFavorite = (chapterId) => {
        const savedFavorites = JSON.parse(localStorage.getItem("favoriteChapters")) || {};
        delete savedFavorites[chapterId]; // xóa chương khỏi object lưu trong localStorage
        localStorage.setItem("favoriteChapters", JSON.stringify(savedFavorites));

        // Cập nhật state bằng cách chuyển lại object thành array
        const updatedChaptersArray = Object.keys(savedFavorites).map(chapterId => ({
            chapterId,
            isFavorite: savedFavorites[chapterId].isFavorite,
            name: savedFavorites[chapterId].name,
        }));
        setFavoriteChapters(updatedChaptersArray); // giữ dạng array
    };


    return (
        <div className="favorite-page">
            <h2 className="title"></h2>
            <div className="container-re">
                {favoriteChapters.length === 0 ? (
                    <p>Bạn chưa có chương yêu thích nào.</p>
                ) : (
                    favoriteChapters.map((item) => (
                        <div className="card" key={item.chapterId}>
                            <div className="card-content-list">
                                <h3>{item.name}</h3> {/* Hiển thị tên chương */}
                                <div className="card-actions">
                                    <button
                                        className="card-button remove"
                                        onClick={() => handleRemoveFavorite(item.chapterId)}
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
