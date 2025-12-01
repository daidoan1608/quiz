import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Pagination from '../common/Pagination';
import { authAxios } from "../../api/axiosConfig";
import { BiEdit, BiTrash, BiCheckCircle, BiPlus } from "react-icons/bi";
import "../../styles/responsiveTable.css";

export default function GetCategory() {
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const navigate = useNavigate();

  // Lấy tất cả categories
  useEffect(() => {
    getAllCategory();
  }, []);

  const getAllCategory = async () => {
    try {
      const response = await authAxios.get("/public/categories");
      setCategories(response.data.data[0]);
    } catch (error) {
      console.error("Error fetching categories:", error);
      alert("Không thể tải danh sách thể loại!");
    }
  };

  // Hàm xóa category
  const deleteCategory = async (categoryId) => {
    try {
      await authAxios.delete(`/admin/categories/${categoryId}`);
      setCategories((prev) => prev.filter((c) => c.categoryId !== categoryId));
      alert("Khoa đã được xóa thành công!");
    } catch (error) {
      alert("Không thể xóa khoa!");
    }
  };

  // Chuyển hướng đến danh sách môn học trong category
  const goToSubjects = (categoryId) => {
    navigate(`/categories/${categoryId}`);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = categories.slice(indexOfFirstItem, indexOfLastItem);

  const elementCategory = currentCategories.map((item) => (
    <tr key={item.categoryId}>
      <td data-label="Mã Khoa">{item.categoryId}</td>
      <td data-label="Tên Khoa">{item.categoryName}</td>
      <td data-label="Mô tả">{item.categoryDescription || "Không có"}</td>
      <td data-label="Action">
        <button
          className="btn btn-danger mx-1"
          onClick={() => deleteCategory(item.categoryId)}
        >
          <BiTrash />
        </button>
        <button
          className="btn btn-warning mx-1"
          onClick={() => goToSubjects(item.categoryId)}
        >
          <BiCheckCircle />
        </button>
        <button
          className="btn btn-success mx-1"
          onClick={() => navigate(`/categories/update/${item.categoryId}`)}
        >
          <BiEdit />
        </button>
      </td>
    </tr>
  ));

  return (
    <div className="responsive-table">
      <h2 className="heading-content">Quản lý khoa</h2>
      <button
        className="btn btn-primary mb-3 float-end"
        onClick={() => navigate("/categories/add")}
      >
        <BiPlus />
      </button>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Mã khoa</th>
            <th>Tên khoa</th>
            <th>Mô tả</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>{elementCategory}</tbody>
      </table>
      <Pagination
        totalPages={Math.ceil(categories.length / itemsPerPage)}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
