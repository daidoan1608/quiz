import React from "react";
import { Route, Routes } from "react-router-dom";
import "../styles/content.css";
import AddChapter from "../components/ContentChapter/AddChapter";
import GetChapter from "../components/ContentChapter/GetChapter";
import UpdateChapter from "../components/ContentChapter/UpdateChapter";
import AddExam from "../components/ContentExam/AddExam";
import GetExam from "../components/ContentExam/GetExam";
import { ContentHeader } from "../components/common/ContentHeader";
import ContentHome from "../components/ContentHome/ContentHome";
import AddQuestion from "../components/ContentQuestion/AddQuestion";
import GetQuestion from "../components/ContentQuestion/GetQuestion";
import UpdateQuestion from "../components/ContentQuestion/UpdateQuestion";
import AddChapterById from "../components/ContentSubject/AddChapterById";
import AddQuestionById from "../components/ContentSubject/AddQuestionById";
import AddSubject from "../components/ContentSubject/AddSubject";
import ChooseChapter from "../components/ContentSubject/ChooseChapter";
import ChooseQuestion from "../components/ContentSubject/ChooseQuestion";
import GetSubject from "../components/ContentSubject/GetSubject";
import UpdateSubject from "../components/ContentSubject/UpdateSubject";
import AddUser from "../components/ContentUser/AddUser";
import GetUser from "../components/ContentUser/GetUser";
import UpdateUser from "../components/ContentUser/UpdateUser";
import ImportInterface from "../components/Import/ImportInterface";
import GetUserExam from "../components/ContentExamUser/GetUserExam";
import GetUserExambyId from "../components/ContentExamUser/GetUserExambyId";
import GetCategories from "../components/ContentCategories/GetCategories";
import UpdateCategory from "../components/ContentCategories/UpdateCategories";
import AddCategories from "../components/ContentCategories/AddCategories";
export default function Content() {
  return (
    <>
      <div className="content">
        <ContentHeader />
        <Routes>
          <Route path="/import" element={<ImportInterface />} />

          <Route path="/home" element={<ContentHome />} />
          <Route path="/admin/users" element={<GetUser />} />
          <Route path="/admin/add/user" element={<AddUser />} />
          <Route path="/update/users/:userId" element={<UpdateUser />} />

          <Route path="/admin/exams" element={<GetExam />} />
          <Route path="/admin/add/exams" element={<AddExam />} />

          <Route path="/categories" element={<GetCategories />} />
          <Route path="/categories/add" element={<AddCategories />} />
          <Route
            path="/categories/update/:categoryId"
            element={<UpdateCategory />}
          />

          <Route path="/subjects" element={<GetSubject />} />
          <Route
            path="/admin/subjects/:subjectId"
            element={<UpdateSubject />}
          />
          <Route path="/admin/subjects" element={<AddSubject />} />
          <Route path="/subjects/:subjectId" element={<ChooseChapter />} />
          <Route
            path="/subjects/addChapters/:subjectId"
            element={<AddChapterById />}
          />

          <Route
            path="/chapter/questions/:chapterId"
            element={<ChooseQuestion />}
          />
          <Route
            path="/chapter/addQuestions/:chapterId"
            element={<AddQuestionById />}
          />
          <Route path="/subject/chapters" element={<GetChapter />} />
          <Route path="/admin/add/chapter" element={<AddChapter />} />
          <Route
            path="/admin/chapters/:chapterId"
            element={<UpdateChapter />}
          />

          <Route path="/chapter/questions" element={<GetQuestion />} />
          <Route path="/admin/questions" element={<AddQuestion />} />
          <Route
            path="/admin/questions/:questionId"
            element={<UpdateQuestion />}
          />

          <Route path="/admin/userexams" element={<GetUserExam />} />
          <Route path="/userexam/:userExamId" element={<GetUserExambyId />} />
        </Routes>
      </div>
      <div />
    </>
  );
}
