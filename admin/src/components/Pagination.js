// Pagination.js
import React from 'react';

export default function Pagination({ totalPages, currentPage, onPageChange }) {
    // Hàm chuyển trang lên 5 trang
    const handleNextFive = () => {
        if (currentPage + 5 <= totalPages) {
            onPageChange(currentPage + 5);
        } else {
            onPageChange(totalPages); // Chuyển đến trang cuối cùng nếu không đủ 5 trang
        }
    };

    // Hàm chuyển trang xuống 5 trang
    const handlePrevFive = () => {
        if (currentPage - 5 > 0) {
            onPageChange(currentPage - 5);
        } else {
            onPageChange(1); // Chuyển về trang đầu tiên nếu không đủ 5 trang
        }
    };

    return (
        <div className="pagination">
            <button
                className="btn btn-secondary mx-1"
                onClick={handlePrevFive}
            >
                &lt;&lt; {/* Hiển thị "<<" */}
            </button>
            
            {Array.from({ length: totalPages }, (_, index) => (
                <button
                    key={index}
                    className={`btn ${currentPage === index + 1 ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => onPageChange(index + 1)}
                >
                    {index + 1}
                </button>
            ))}
            
            <button
                className="btn btn-secondary mx-1"
                onClick={handleNextFive}
            >
                &gt;&gt; {/* Hiển thị ">>" */}
            </button>
        </div>
    );
}
