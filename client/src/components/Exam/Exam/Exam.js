import React, { useState, useEffect, useRef } from 'react';
import axiosLocalApi from "../../../api/local-api"; // Giả sử bạn đã cấu hình axios đúng
import { useNavigate, useLocation } from 'react-router-dom';
import './Exam.css';
import Headers from '../../Header';
import Footer from '../../Footer';
// import { Footer } from 'antd/es/layout/layout';

export default function Exam() {
  const [questions, setexamQuestionAnswers] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState([]);
  const [duration, setDuration] = useState([]);
  const [title, setTitle] = useState([]);
  const [subjectName , setSubjectName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { examId , startTime } = location.state || {};
  const questionRefs = useRef([]); // Tạo refs cho từng câu hỏi  
  const accessToken = localStorage.getItem('accessToken');

  useEffect(() => {
    const getAllQuestionsByExamId = async () => {
      try {
        console.log('accessToken', accessToken);
        const response = await axiosLocalApi.get(`/exams/${examId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setSubjectName(response.data.subjectName);
        setTitle(response.data.title);
        setDuration(response.data.duration);
        setTimeLeft(response.data.duration * 60);
        setexamQuestionAnswers(response.data.questions);
        questionRefs.current = response.data.questions.map(() => React.createRef());
      } catch (error) {
        if (error.response && error.response.status === 403) {
          console.error('Không có quyền truy cập.');
          alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          navigate('/login'); // Điều hướng người dùng đến trang đăng nhập
        } else {
          console.error('Lỗi khi lấy dữ liệu:', error);
          alert('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
        }
      }
    };
    getAllQuestionsByExamId()
    
  }, [examId]);

  
  
  useEffect(() => {
    if (timeLeft === 0) {
      handleSubmit();
    }
    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);



  // Hàm xử lý khi click vào số câu hỏi trong bảng trả lời
  const scrollToQuestion = (index) => {
    if (questionRefs.current[index] && questionRefs.current[index].current) {
      questionRefs.current[index].current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answerIndex,
    });
  };

  const handleSubmit = async () => {
    let userId = '';
    try {
    const resp = await axiosLocalApi.post('/auth/introspect', {
        token: localStorage.getItem('accessToken'),
        tokenType: 'access_token',
      });
      
        userId = resp.data.userId;
      }catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
      }
    const endTime = new Date().toISOString(); // Thời gian kết thúc (hiện tại)
    const correctAnswers = questions.reduce((count, question, index) => {
      const userAnswerIndex = selectedAnswers[index];
      if (userAnswerIndex !== undefined) {
        const selectedAnswer = question.answers[userAnswerIndex];
        return selectedAnswer.isCorrect ? count + 1 : count;
      }
      return count;
    }, 0);
  
    const score = (correctAnswers / questions.length) * 100;
  
    const userAnswerDtos = Object.entries(selectedAnswers).map(([questionIndex, answerIndex]) => {
      const question = questions[questionIndex];
      if (!question) return null; // Nếu câu hỏi không tồn tại, bỏ qua
      const answer = question.answers[answerIndex];
      if (!answer) return null; // Nếu đáp án không tồn tại, bỏ qua
      return {
        questionId: question.questionId, // Lấy questionId
        answerId: answer.answerId || answer.optionId, // Lấy answerId hoặc optionId
      };
    }).filter(Boolean); // Loại bỏ các giá trị null
  
    const payload = {
      userExamDto: {
        userId,
        examId,
        startTime,
        endTime,
        score,
      },
      userAnswerDtos,
    };
  
    try {

      const response = await axiosLocalApi.post("/userexams", payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const userExamId = response.data.userExamId;
      if (response.status === 200) {
        alert("Nộp bài thành công!");
        navigate("/result", {
          state: {
            examId,
            userExamId,
            correctAnswers,
            timeTaken: duration * 60 - timeLeft,
            totalQuestions: questions.length,
          },
        });
      } else {
        alert("Nộp bài thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi nộp bài:", error);
      alert("Đã xảy ra lỗi khi nộp bài.");
    }
  };
  

  const elementexamQuestionAnswers = questions?.map((item, questionIndex) => {
    return (
      <div 
        key={item.questionId} 
        className="container-end"
        ref={questionRefs.current[questionIndex]} // Thêm ref cho mỗi câu hỏi
      >
        <div className="question">Câu {questionIndex + 1}: {item.content}</div>
        <div className="options">
          {item.answers?.map((answer, answerIndex) => {
            const isSelected = selectedAnswers[questionIndex] === answerIndex;
            return (
              <label key={answer.optionId} style={{ display: 'block', margin: '5px 0' }}>
                <input
                  type="radio"
                  name={`question-${questionIndex}`}
                  value={answerIndex}
                  checked={isSelected}
                  onChange={() => handleAnswerSelect(questionIndex, answerIndex)}
                  style={{
                    marginRight: '5px',
                    cursor: 'pointer',
                  }}
                />
                <span
                  style={{
                    backgroundColor: isSelected ? 'lightblue' : 'transparent',
                    padding: '5px 10px',
                    border: isSelected ? '2px solid blue' : '1px solid grey',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    display: 'inline-block',
                    fontWeight: 'bold',
                  }}
                >
                  {answer.content}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    );
  });

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <>
      <Headers />
      <div className="category-center">
        <div className="table-left">
          <div className="info">
            <p><span>BÀI THI MÔN:</span> {subjectName} </p>
            <p><span>ĐỀ THI:</span> {title} </p>
            <p><span>SỐ CÂU:</span> {questions.length}</p>
            <p><span>THỜI GIAN:</span> {duration} Phút </p>
          </div>
          <div className="timer">
            <h2>Thời gian còn lại</h2>
            <span>{`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</span>
          </div>
        </div>
        <div className="table-right">
          <div className="answer-sheet">
            <p><span>BẢNG TRẢ LỜI</span></p>
            {[...Array(questions.length)].map((_, idx) => (
              <div
                key={idx}
                className={`number ${selectedAnswers[idx] !== undefined ? 'selected' : ''}`}
                onClick={() => scrollToQuestion(idx)} // Thêm sự kiện onClick
                style={{ cursor: 'pointer' }} // Thêm con trỏ để chỉ ra có thể click
              >
                {idx + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="category-end">
        {elementexamQuestionAnswers}
        <button className="submit-btn" onClick={handleSubmit}>Nộp bài</button>
      </div>
      <Footer />
    </>
  );
}