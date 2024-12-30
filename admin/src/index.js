import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Content from './components/Content';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
        <Routes>
          <Route path='/auth/login' element={<Login />} />
          <Route path='/LogOut' element={<Login />} />
          <Route path='/' element={<App />}>
            <Route path='/home' element={<Content />}/>
            <Route path='/admin/users' element={<Content />} />
            <Route path='/admin/add/user' element={<Content />} />
            <Route path='/update/users/:userId' element={<Content />} />
            
            
            <Route path='/admin/exams' element={<Content />} />
            <Route path='/admin/add/exams' element={<Content />} />
            
            <Route path='/subjects' element={<Content />} />
            <Route path='/admin/subjects/:subjectId' element={<Content />} />
            <Route path='/admin/subjects' element={<Content />} />
            <Route path='/subjects/:subjectId' element={<Content />} />
            <Route path='/subjects/addChapters/:subjectId' element={<Content />} />
            <Route path='/chapter/questions/:chapterId' element={<Content />} />
            <Route path='/chapter/addQuestions/:chapterId' element={<Content />} />
            
            <Route path='/subject/chapters' element={<Content />} />
            <Route path='/admin/add/chapter' element={<Content />} />
            <Route path='/admin/chapters/:chapterId' element={<Content />} />
            
            <Route path='/chapter/questions' element={<Content />} />
            <Route path='/admin/questions' element={<Content />} />
            <Route path='/admin/questions/:questionId' element={<Content />} />
          </Route>
        </Routes>
        
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
