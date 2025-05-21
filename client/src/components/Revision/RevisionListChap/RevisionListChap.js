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
  const { isLoggedIn } = useAuth();

  // Lấy danh sách các chương từ API
  const getChapterBySubjectId = async (subjectId) => {
    try {
      setIsLoading(true);
      setError(null);
      const resp = await publicAxios.get(`public/chapters/subject/${subjectId}`);

      if (resp.data.status === "success") {
        setChapters(resp.data.data);
      } else {
        setError("Không tìm thấy thông tin chương.");
      }
    } catch (error) {
      setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
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

  const renderChaps = (chapters) => {
    if (!Array.isArray(chapters) || chapters.length === 0) {
      return null;
    }

    return chapters.map((item) => (
      <div
        key={item.chapterId}
        className="chapter-item"
        role="button"
        tabIndex={0}
        onClick={() => handleChapterClick(item)}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            handleChapterClick(item);
          }
        }}
      >
        <div className="chapter-header">
          <h3>
            {item.chapterNumber}. {item.name}
          </h3>
        </div>
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
