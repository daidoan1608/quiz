import React, { useEffect, useState } from "react";
import { publicAxios } from "../../api/axiosConfig";
import { Pagination } from "antd";
import "./Home.css";

export default function Home() {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    getAllSubjects();
  }, []);

  const getAllSubjects = async () => {
    try {
      const resp = await publicAxios.get("public/subjects");
      setSubjects(resp.data.data || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách môn học:", error);
    }
  };

  const currentSubjects = subjects.slice(0, 5);

  const elementSubjects = currentSubjects.length > 0 ? (
    currentSubjects.map((item, index) => (
      <div className="category" key={index}>
        <div className="container">
          <div className="course">
            <h3>{item.name}</h3>
          </div>
        </div>
      </div>
    ))
  ) : (
    <div className="no-subjects">Không có môn học</div>
  );

  return (
    <div>
      <main className="position-relative main-background">
        <div
          className="position-absolute start-50 translate-middle-x text-center text-white px-3 main-text"
          style={{
            top: "10%",
            width: "100%",
            transform: "translateX(-50%)",
          }}
        >
          <h1
            className="fw-bold"
            style={{
              position: "absolute",
              top: "0",
              left: "2%",
              color: "#336699",
              fontSize: "4.5rem",
              textShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
            }}
          >
            TRẮC NGHIỆM ONLINE
          </h1>
          <div className="text-detail" style={{ textAlign: "left", marginTop: "8rem", paddingLeft: "2%" }}>
            <p>Rèn luyện mỗi ngày, tự tin đạt điểm cao</p>
            <p>Học chủ động</p>
            <p>Bám sát chương trình</p>
            <p>Sẵn sàng cho kỳ thi</p>
          </div>
        </div>
      </main>

      <div className="container-fluid mt-5">
        <div className="row">
          <div className="col-12 content-intro">
            <h2 className="text-center my-4">Giới thiệu về Team Dự Án Web Thực Tập</h2>
            <p>
              Chúng mình là một nhóm sinh viên đam mê công nghệ và giáo dục, với mục tiêu tạo ra một nền tảng học tập trực tuyến hiệu quả dành cho sinh viên.
            </p>
            <p>
              Dự án này không chỉ là một công cụ học tập thông thường, mà còn là một cộng đồng giúp các bạn chia sẻ tài liệu, bài giảng, bài tập và giải đáp thắc mắc.
            </p>
            <p>
              Nhóm chúng mình gồm những thành viên trẻ trung, năng động, với các kỹ năng về phát triển phần mềm, thiết kế web, và quản lý dự án. Chúng mình đã cùng nhau làm việc không ngừng để tạo ra một sản phẩm tốt nhất.
            </p>
            <p>
              Chúng mình tin rằng nền tảng học tập này sẽ là người bạn đồng hành tuyệt vời giúp các bạn sinh viên tự tin hơn trong việc ôn tập và chinh phục các mục tiêu học tập.
            </p>
            <p>
              Đừng quên theo dõi chúng mình để cập nhật thêm nhiều tài liệu và bài học mới!
            </p>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <h2 className="text-center my-4" style={{ color: "#0088a9" }}>
              Những môn học chúng mình hỗ trợ ôn tập
            </h2>
            {elementSubjects}
            <div className="d-flex justify-content-center mt-4">
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
