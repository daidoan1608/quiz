import React, { useEffect, useState } from "react";
import { publicAxios } from "../../api/axiosConfig";
import "./Home.css";

export default function Home() {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    getAllSubjects();
  }, []);

  const getAllSubjects = async () => {
    const resp = await publicAxios.get("public/subjects");
    console.log(resp.data.data);
    setSubjects(resp.data.data);
  };

  const displaySubjects = subjects.length >= 5
  ? subjects.slice(0, 5)
  : subjects;

  const elementSubjects = displaySubjects.length > 0 ? (
    displaySubjects.map((item, index) => (
      <div className="category" key={index}>
        <div className="container">
          <div className="course">
            <h3>{item.name}</h3>
          </div>
        </div>
      </div>
    ))
  ) : (
    <div className="no-subjects">
      Không có môn học
    </div>
  );

  return (
    <div>
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
          Chúng mình là một nhóm sinh viên đam mê công nghệ và giáo dục, với mục
          tiêu tạo ra một nền tảng học tập trực tuyến hiệu quả dành cho sinh
          viên. Qua dự án này, chúng mình muốn giúp các bạn sinh viên ôn tập,
          củng cố kiến thức và chuẩn bị tốt cho các kỳ thi.
        </p>
        <p>
          Dự án này không chỉ là một công cụ học tập thông thường, mà còn là một
          cộng đồng giúp các bạn chia sẻ tài liệu, bài giảng, bài tập và giải
          đáp thắc mắc. Chúng mình hy vọng rằng dự án sẽ giúp sinh viên tiết
          kiệm thời gian, nâng cao hiệu quả học tập và đạt được kết quả cao
          trong các kỳ thi.
        </p>
        <p>
          Nhóm chúng mình gồm những thành viên trẻ trung, năng động, với các kỹ
          năng về phát triển phần mềm, thiết kế web, và quản lý dự án. Chúng
          mình đã cùng nhau làm việc không ngừng để tạo ra một sản phẩm tốt
          nhất, sử dụng những công nghệ tiên tiến như ReactJS, Spring Fw và
          MySQL để xây dựng nền tảng này.
        </p>
        <p>
          Chúng mình tin rằng nền tảng học tập này sẽ là người bạn đồng hành
          tuyệt vời giúp các bạn sinh viên tự tin hơn trong việc ôn tập và chinh
          phục các mục tiêu học tập. Cùng chúng mình bước vào hành trình học tập
          đầy thú vị và hiệu quả!
        </p>
        <p>
          Đừng quên theo dõi chúng mình để cập nhật thêm nhiều tài liệu và bài
          học mới!
        </p>
      </div>
      <div className="category">
        <h2>Những môn học chúng mình hỗ trợ ôn tập</h2>
        {elementSubjects}
      </div>
    </div>
  );
}
