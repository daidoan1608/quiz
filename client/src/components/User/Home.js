import React, { useEffect, useState } from "react";
import { publicAxios } from "../../api/axiosConfig";
import { Pagination } from "antd";
import "./Home.css";
import { useLanguage } from "../../components/Context/LanguageProvider";


export default function Home() {
  const [subjects, setSubjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const { texts } = useLanguage();


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
    <div className="no-subjects">{texts.noSubjects}</div>
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
            className="fw-bold "
            style={{
              position: "relative",
              color: "#336699",
              left: "2vw", // giữ lệch trái tương đối
              fontSize: "5vw", // kích thước chữ theo độ rộng màn hình
              textShadow: "0 0 1vw rgba(255, 255, 255, 0.8)",
              marginTop: "1rem", // tránh bị dính sát trên
            }}
          >
            {texts.onlineTest}
          </h1>


          {/* color: "#336699", text-primary
           // textAlign: "left",
              // marginTop: "8rem",
              // paddingLeft: "2%"*/}
          <h2
            className="fw-normal"
            style={{
              position: "relative",
              color: "#336699",
              fontSize: "clamp(0.6rem, 3.5vw, 2rem)",
              marginTop: "1rem",
              lineHeight: 1.3,
              textAlign: "left",
              left: "6vw",
            }}
          >
            <span style={{ display: "block" }}>{texts.slogan1}</span>
            <span style={{ display: "block" }}>{texts.slogan2}</span>
            <span style={{ display: "block" }}>{texts.slogan3}</span>
            <span style={{ display: "block" }}>{texts.slogan4}</span>
          </h2>






        </div>
      </main>


      <div className="container-fluid mt-5">
        <div className="row">
          <div className="col-12 content-intro">
            <h2 className="text-center my-4">{texts.introTitle}</h2>
            <p>{texts.intro1}</p>
            <p>{texts.intro2}</p>
            <p>{texts.intro3}</p>
            <p>{texts.intro4}</p>
            <p>{texts.intro5}</p>
          </div>
        </div>


        <div className="row">
          <div className="col-12">
            <h2 className="text-center my-4" style={{ color: "#0088a9" }}>
              {texts.subjectsTitle}
            </h2>
            {elementSubjects}
            <div className="d-flex justify-content-center mt-4">
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}
