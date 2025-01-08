import React from 'react';

export default function Pagination({ totalPages, currentPage, onPageChange }) {
    // Hàm chuyển sang trang tiếp theo
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    // Hàm chuyển về trang trước
    const handlePrevPage = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    return (
        <div className="pagination">
            {/* Nút về trang trước */}
            <button
                className="btn btn-secondary mx-1"
                onClick={handlePrevPage}
                disabled={currentPage === 1} // Vô hiệu hóa nếu đang ở trang đầu tiên
            >
                &lt; {/* Hiển thị "<" */}
            </button>
            
            {/* Hiển thị danh sách các trang */}
            {Array.from({ length: totalPages }, (_, index) => (
                <button
                    key={index}
                    className={`btn ${currentPage === index + 1 ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => onPageChange(index + 1)}
                >
                    {index + 1}
                </button>
            ))}
            
            {/* Nút sang trang kế tiếp */}
            <button
                className="btn btn-secondary mx-1"
                onClick={handleNextPage}
                disabled={currentPage === totalPages} // Vô hiệu hóa nếu đang ở trang cuối cùng
            >
                &gt; {/* Hiển thị ">" */}
            </button>
        </div>
    );
}
