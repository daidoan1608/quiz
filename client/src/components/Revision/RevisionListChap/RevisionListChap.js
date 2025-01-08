import React, { useEffect, useState } from "react";
import { publicAxios } from "../../../api/axiosConfig";
import "./RevisionListChap.css";
import { useLocation, useNavigate } from "react-router-dom";
import LoginPrompt from "../../User/LoginPrompt";
import { useAuth } from "../../Context/AuthProvider";

export default function RevisionListChap() {
  const [chapters, setChapters] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { subjectId } = location.state || {};
  const { isLoggedIn } = useAuth(); // Lấy trạng thái và hàm logout từ context
  

  const getChapterBySubjectId = async (subjectId) => {
    try {
      setIsLoading(true);
      setError(null);
      const resp = await publicAxios.get(
        `public/subject/chapters/${subjectId}`
      );

      if (resp.data.responseCode === "404") {
        setError(resp.data.responseMessage);
        setChapters([]);
      } else {
        setChapters(resp.data);
      }
    } catch (error) {
      setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
      setChapters([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (subjectId) {
      getChapterBySubjectId(subjectId);
    } else {
      setError("Không tìm thấy thông tin môn học");
      setIsLoading(false);
    }
  }, [subjectId]);

  // Handle chapter click
  const handleChapterClick = (chapter) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true); // Show login prompt
      return;
    }
    navigate("/chap", {
      state: {
        chapterId: chapter.chapterId,
      },
    });
  };

  const handleLoginRedirect = () => {
    navigate("/login"); // Redirect to login page
  };

  const handleCloseLoginPrompt = () => {
    setShowLoginPrompt(false); // Close login prompt
  };

  // Render chapters
  const renderChaps = (chapters) => {
    if (!Array.isArray(chapters) || chapters.length === 0) {
      return null;
    }

    return chapters.map((item) => (
      <div
        key={item.chapterId}
        className="chapter-item"
        onClick={() => handleChapterClick(item)}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            handleChapterClick(item);
          }
        }}
      >
        <h3>
          {item.chapterNumber}. {item.name}
        </h3>
      </div>
    ));
  };

  if (isLoading) {
    return (
      <div>
        <div className="subject-detail">
          <div className="loading">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {showLoginPrompt && (
        <LoginPrompt
          onLoginRedirect={handleLoginRedirect}
          onClose={handleCloseLoginPrompt}
        />
      )}
      <div className="subject-detail">
        {error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="chapters">{renderChaps(chapters)}</div>
        )}
      </div>
    </div>
  );
}
