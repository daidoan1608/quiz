import React from 'react';
import { Route, Routes } from 'react-router-dom';
import '../styles/content.css';
import AddChapter from './ContentChapter/AddChapter';
import GetChapter from './ContentChapter/GetChapter';
import UpdateChapter from './ContentChapter/UpdateChapter';
import AddExam from './ContentExam/AddExam';
import GetExam from './ContentExam/GetExam';
import { ContentHeader } from './ContentHeader';
import ContentHome from './ContentHome/ContentHome';
import AddQuestion from './ContentQuestion/AddQuestion';
import GetQuestion from './ContentQuestion/GetQuestion';
import UpdateQuestion from './ContentQuestion/UpdateQuestion';
import AddChapterById from './ContentSubject/AddChapterById';
import AddQuestionById from './ContentSubject/AddQuestionById';
import AddSubject from './ContentSubject/AddSubject';
import ChooseChapter from './ContentSubject/ChooseChapter';
import ChooseQuestion from './ContentSubject/ChooseQuestion';
import GetSubject from './ContentSubject/GetSubject';
import UpdateSubject from './ContentSubject/UpdateSubject';
import AddUser from './ContentUser/AddUser';
import GetUser from './ContentUser/GetUser';
import UpdateUser from './ContentUser/UpdateUser';
import ImportInterface from './Import/ImportInterface';

export default function Content() {
  return (
    <>
    <div className='content'>
        <ContentHeader />
        <Routes>
          <Route path='/import' element={<ImportInterface />} />

          <Route path='/home' element={<ContentHome />} />
          <Route path='/admin/users' element={<GetUser />} />
          <Route path='/admin/add/user' element={<AddUser />} />
          <Route path='/update/users/:userId' element={<UpdateUser />} />

          <Route path='/admin/exams' element={<GetExam />} />
          <Route path='/admin/add/exams' element={<AddExam />} />

          <Route path='/subjects' element={<GetSubject />} />
          <Route path='/admin/subjects/:subjectId' element={<UpdateSubject />} />
          <Route path='/admin/subjects' element={<AddSubject />} />
          <Route path='/subjects/:subjectId' element={<ChooseChapter />} />
          <Route path='/subjects/addChapters/:subjectId' element={<AddChapterById />} />

          <Route path='/chapter/questions/:chapterId' element={<ChooseQuestion />} />
          <Route path='/chapter/addQuestions/:chapterId' element={<AddQuestionById />} />
          <Route path='/subject/chapters' element={<GetChapter />} />
          <Route path='/admin/add/chapter' element={<AddChapter />} />
          <Route path='/admin/chapters/:chapterId' element={<UpdateChapter />} />
          
          <Route path='/chapter/questions' element={<GetQuestion />} />
          <Route path='/admin/questions' element={<AddQuestion />} />
          <Route path='/admin/questions/:questionId' element={<UpdateQuestion />} />
        </Routes>
        </div>
        <div/>
    </>
  );
}
