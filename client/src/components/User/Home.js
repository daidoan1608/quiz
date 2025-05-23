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
      <div id="banner">
        <div className="text-banner">
          <h1 className="heading-banner">{texts.onlineTest}</h1>
          <p className="desc-banner">{texts.slogan1}</p>
          <p className="desc-banner">{texts.slogan2}</p>
          <p className="desc-banner">{texts.slogan3}</p>
          <p className="desc-banner">{texts.slogan4}</p>
        </div>
      </div>

      <div className="container-fluid">
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