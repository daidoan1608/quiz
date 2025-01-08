// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useParams, useNavigate } from 'react-router-dom';
// import Pagination from '../Pagination'; // Thành phần phân trang

// export default function ChooseChapter() {
//     const { subjectId } = useParams(); // Lấy subjectId từ URL
//     const navigate = useNavigate(); // Dùng để điều hướng
//     const [chapters, setChapters] = useState([]);
//     const [filteredChapters, setFilteredChapters] = useState([]); // Dữ liệu chương sau khi lọc
//     const [searchTerm, setSearchTerm] = useState(''); // Từ khóa tìm kiếm
//     const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
//     const [itemsPerPage] = useState(5); // Số lượng chương trên mỗi trang

//     // Lấy dữ liệu các chương
//     useEffect(() => {
//         if (subjectId) {
//             fetchChapters(subjectId);
//         }
//     }, [subjectId]);

//     // Lọc chương theo từ khóa
//     useEffect(() => {
//         const filtered = chapters.filter((chapter) =>
//             chapter.name.toLowerCase().includes(searchTerm.toLowerCase())
//         );
//         setFilteredChapters(filtered);
//     }, [searchTerm, chapters]);

//     // Hàm gọi API để lấy danh sách các chương
//     const fetchChapters = async (subjectId) => {
//         try {
//             const response = await axios.get(`http://localhost:8080/public/subject/chapters/${subjectId}`);
//             if (response.data && response.data.length > 0) {
//                 setChapters(response.data);
//                 setFilteredChapters(response.data);
//             } else {
//                 setChapters([]);
//                 setFilteredChapters([]);
//                 alert('Không có chương nào cho môn học này!');
//             }
//         } catch (error) {
//             console.error('Lỗi khi lấy danh sách chương:', error.response?.data || error.message);
//             alert('Không thể lấy danh sách chương!');
//         }
//     };

//     // Hàm xóa chương
//     const deleteChapter = async (chapterId) => {
//         const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa chương này?");
//         if (!confirmDelete) return;

//         try {
//             await axios.delete(`http://localhost:8080/public/admin/chapters/${chapterId}`);
//             setChapters(chapters.filter((chapter) => chapter.chapterId !== chapterId));
//             alert('Xóa chương thành công!');
//         } catch (error) {
//             console.error('Lỗi khi xóa chương:', error.response?.data || error.message);
//             alert('Không thể xóa chương!');
//         }
//     };

//     // Tính toán dữ liệu hiển thị theo trang hiện tại
//     const indexOfLastItem = currentPage * itemsPerPage;
//     const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//     const currentChapters = filteredChapters.slice(indexOfFirstItem, indexOfLastItem);

//     return (
//         <div>
//             <div className="d-flex justify-content-between align-items-center mb-3">
//                 <h2>Danh sách chương</h2>
//                 <button
//                     className="btn btn-primary"
//                     onClick={() => navigate(`/public/subjects/addChapters/${subjectId}`)}
//                 >
//                     Thêm chương
//                 </button>
//             </div>

//             {/* Thanh tìm kiếm */}
//             <div className="mb-3">
//                 <input
//                     type="text"
//                     className="form-control"
//                     placeholder="Tìm kiếm chương theo tên..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//             </div>

//             {/* Kiểm tra xem có chương nào không */}
//             {filteredChapters.length === 0 ? (
//                 <p>Không tìm thấy chương nào phù hợp.</p>
//             ) : (
//                 <>
//                     <table className="table table-bordered">
//                         <thead>
//                             <tr>
//                                 <th>Mã chương</th>
//                                 <th>Tên chương</th>
//                                 <th>Chương số</th>
//                                 <th>Thao tác</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {currentChapters.map((chapter) => (
//                                 <tr key={chapter.chapterId}>
//                                     <td>{chapter.chapterId}</td>
//                                     <td>{chapter.name}</td>
//                                     <td>{chapter.chapterNumber}</td>
//                                     <td>
//                                         <button
//                                             className="btn btn-danger me-2"
//                                             onClick={() => deleteChapter(chapter.chapterId)}
//                                         >
//                                             Xóa
//                                         </button>
//                                         <button
//                                             className="btn btn-warning me-2"
//                                             onClick={() => navigate(`/chapter/questions/${chapter.chapterId}`)}
//                                         >
//                                             Chọn câu hỏi
//                                         </button>
//                                         <button
//                                             className="btn btn-success"
//                                             onClick={() => navigate(`/public/admin/chapters/${chapter.chapterId}`)}
//                                         >
//                                             Cập nhật
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>

//                     {/* Thành phần Pagination */}
//                     <Pagination
//                         totalPages={Math.ceil(filteredChapters.length / itemsPerPage)}
//                         currentPage={currentPage}
//                         onPageChange={setCurrentPage}
//                     />
//                 </>
//             )}
//         </div>
//     );
// }
