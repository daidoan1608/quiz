import React from "react";
import "../../styles/pagination.css";

export default function Pagination({ totalPages, currentPage, onPageChange }) {
  const maxVisiblePages = 5; // Số nút trang tối đa muốn hiển thị (ví dụ: 5)

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

  // Hàm tạo danh sách các trang cần hiển thị
  const getPageNumbers = () => {
    let pages = [];

    // Nếu tổng số trang ít hơn hoặc bằng số trang tối đa hiển thị, hiển thị tất cả
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // --- Logic khi tổng số trang lớn hơn maxVisiblePages ---

    // Luôn hiển thị trang đầu tiên
    pages.push(1);

    // Số trang lân cận (vd: 2 trang bên trái và 2 trang bên phải trang hiện tại)
    const sidePages = Math.floor((maxVisiblePages - 3) / 2); // -3 vì có trang 1, trang cuối và 1 dấu ...

    let startPage = Math.max(2, currentPage - sidePages);
    let endPage = Math.min(totalPages - 1, currentPage + sidePages);

    // Căn chỉnh start/end để đảm bảo đủ maxVisiblePages ở giữa (nếu gần đầu hoặc cuối)
    if (currentPage - 1 < sidePages + 1) {
      // Gần đầu
      endPage = Math.min(totalPages - 1, maxVisiblePages - 1);
    } else if (totalPages - currentPage < sidePages + 1) {
      // Gần cuối
      startPage = Math.max(2, totalPages - maxVisiblePages + 2);
    }

    // Thêm dấu chấm lửng đầu tiên nếu startPage lớn hơn 2
    if (startPage > 2) {
      pages.push("...");
    }

    // Thêm các trang ở giữa
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Thêm dấu chấm lửng cuối cùng nếu endPage nhỏ hơn totalPages - 1
    if (endPage < totalPages - 1) {
      pages.push("...");
    }

    // Luôn hiển thị trang cuối cùng (nếu chưa có)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    // Loại bỏ các trang trùng lặp (nếu logic căn chỉnh vô tình thêm trang cuối trùng)
    pages = [...new Set(pages)];

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="pagination">
      {/* Nút về trang trước */}
      <button
        className="btn btn-secondary mx-1"
        onClick={handlePrevPage}
        disabled={currentPage === 1}
      >
        &lt;
      </button>

      {/* Hiển thị danh sách các trang và dấu chấm lửng */}
      {pageNumbers.map((page, index) => {
        if (page === "...") {
          return (
            <span key={`el-${index}`} className="pagination-ellipsis mx-1">
              ...
            </span>
          );
        }

        return (
          <button
            key={page}
            className={`btn mx-1 ${
              currentPage === page ? "btn-primary" : "btn-secondary"
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        );
      })}

      {/* Nút sang trang kế tiếp */}
      <button
        className="btn btn-secondary mx-1"
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
      >
        &gt;
      </button>
    </div>
  );
}
