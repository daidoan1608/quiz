import React, { useEffect, useState } from "react";
import axiosLocalApi from "../../api/local-api";
import { useNavigate } from "react-router-dom"; // Thêm hook useNavigate để chuyển hướng
import "./Home.css";
import Footer from "../Footer";
import Headers from "../Header";

export default function Home() {
  const [subjects, setSubjects] = useState([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate(); // Khởi tạo hook useNavigate

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setIsLoggedIn(true);
    }
    getAllSubjects();
  }, []);

  const getAllSubjects = async () => {
    const resp = await axiosLocalApi.get("public/subjects");
    setSubjects(resp.data);
  };

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleRegisterClick = () => {
    setIsRegisterModalOpen(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("user");
    navigate("/"); // Chuyển hướng về trang chủ khi đăng xuất
  };

  const elementSubjects = subjects.map((item, index) => {
    return (
      <div className="category" key={index}>
        <div className="container">
          <div className="course">
            <a href="/">{item.name}</a>
          </div>
        </div>
      </div>
    );
  });

  return (
    <div>
      <Headers />
      <main className="main-content">
        <div className="image-container">
          <h1>TRẮC NGHIỆM ONLINE</h1>
          <p>Rèn luyện mỗi ngày, tự tin điểm cao</p>
          <img
            alt="Illustration of a person studying online with a computer"
            height={400}
            src="banner.jpg"
            width={800}
          />
        </div>
      </main>
      <div className="school-introduction">
        <h2>Giới thiệu về Team Dự Án Web Thực Tập</h2>
        <p>
          Chúng mình là một nhóm sinh viên với niềm đam mê và nhiệt huyết trong
          việc phát triển công nghệ. Với mục tiêu tạo ra một nền tảng học tập
          hiệu quả, chúng tôi đã hợp tác để xây dựng một trang web thực tập giúp
          sinh viên ôn tập và nâng cao kiến thức.{" "}
        </p>
        <p>
          {" "}
          Dự án này không chỉ đơn giản là một công cụ học tập, mà còn là nơi
          sinh viên có thể chia sẻ tài liệu, bài giảng, bài tập và giải đáp thắc
          mắc với nhau. Chúng tôi hy vọng dự án này sẽ giúp các bạn sinh viên
          tối ưu hóa quá trình học tập, tiết kiệm thời gian và nâng cao hiệu quả
          học tập của mình.
        </p>
        <p>
          Chúng mình sẽ đồng hành cùng sinh viên trên con đường chinh phục tri
          thức và chuẩn bị cho tương lai tươi sáng.
        </p>
      </div>
      <div className="category">
        <h2>Những môn học chúng mình hỗ trợ ôn tập</h2>
        {elementSubjects}
      </div>
      <Footer />
    </div>
  );
}
