import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LessonList.css";

export default function LessonList() {
    const [favoriteSubjects, setFavoriteSubjects] = useState([]);
    const navigate = useNavigate();

    // Load favorite subjects from localStorage
    useEffect(() => {
        const savedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
        setFavoriteSubjects(savedFavorites); // Set the favorites to state
    }, []);

    const handleRemoveFavorite = (subjectId) => {
        const updatedFavorites = favoriteSubjects.filter(item => item.subjectId !== subjectId);
        setFavoriteSubjects(updatedFavorites);
        localStorage.setItem("favorites", JSON.stringify(updatedFavorites)); // Save the updated list to localStorage
    };

    return (
        <div className="favorite-page">
            <h2 className="title">Môn Học</h2>
            <div className="container-re">
                {favoriteSubjects.length === 0 ? (
                    <p>Bạn chưa có môn học yêu thích nào.</p>
                ) : (
                    favoriteSubjects.map((item) => (
                        <div className="card" key={item.subjectId}>
                            <div className="card-content-list">
                                <h3>{item.subjectName}</h3>

                                <div className="card-actions">
                                    <a href="/favoriteslistChap" className="favorites-link-list">
                                        Chương<i className="fa-solid fa-heart"></i>
                                    </a>
                                    <button
                                        className="card-button remove"
                                        onClick={() => handleRemoveFavorite(item.subjectId)}
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
