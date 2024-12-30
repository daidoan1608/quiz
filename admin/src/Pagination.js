// Pagination.js
import React from 'react';

export default function Pagination({ totalPages, currentPage, onPageChange }) {
    return (
        <div className="pagination">
            {Array.from({ length: totalPages }, (_, index) => (
                <button
                    key={index}
                    className={`btn ${currentPage === index + 1 ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => onPageChange(index + 1)}
                >
                    {index + 1}
                </button>
            ))}
        </div>
    );
}
