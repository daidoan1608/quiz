import React, { useEffect, useState } from "react";
import { publicAxios } from "../../api/axiosConfig";
import { Pagination } from "antd";
import "./Home.css";
import { useLanguage } from "../../components/Context/LanguageProvider";
import subjectTranslations from "../../Languages/subjectTranslations";

export default function Home() {
  const [subjects, setSubjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const { texts, language } = useLanguage();

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
  currentSubjects.map((item, index) => {
    const translatedName =
      subjectTranslations?.[item.name]?.[language] || item.name;

    return (
      <div className="category" key={index}>
        <div className="container">
          <div className="course">
            <h3>{translatedName}</h3>
          </div>
        </div>
      </div>
    );
  })
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
            {texts.onlineTest}
          </h1>
          <div className="text-detail" style={{ textAlign: "left", marginTop: "8rem", paddingLeft: "2%" }}>
            <p>{texts.slogan1}</p>
            <p>{texts.slogan2}</p>
            <p>{texts.slogan3}</p>
            <p>{texts.slogan4}</p>
          </div>
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
    </div>
  );
}