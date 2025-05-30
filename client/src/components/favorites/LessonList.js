import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LessonList.css";
import { useLanguage } from "../Context/LanguageProvider";

export default function LessonList() {
    const [favoriteSubjects, setFavoriteSubjects] = useState([]);
    const navigate = useNavigate();
    const { texts } = useLanguage();

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
            <h2 className="title">{texts.listSubject}</h2>
            <div className="container-re">
                {favoriteSubjects.length === 0 ? (
                    <p>{texts.noFavorites}</p>
                ) : (
                    favoriteSubjects.map((item) => (
                        <div className="card" key={item.subjectId}>
                            <div className="card-content-list">
                                <h3>{item.subjectName}</h3>

                                <div className="card-actions">
                                    <button
                                        className="card-button remove"
                                        onClick={() => handleRemoveFavorite(item.subjectId)}
                                    >
                                        {texts.delete}
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
