import { appMessage } from 'utils/appMessage';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from 'context/favorites/FavoritesContext';

export const useFavoritesModal = ({ onClose }) => {
  const { favorites, toggleFavorite, loading, error } = useFavorites();
  const navigate = useNavigate();

  const favoriteCountText =
    favorites.length > 0
      ? `${favorites.length} môn đã lưu để truy cập nhanh`
      : 'Lưu những môn bạn học thường xuyên để quay lại nhanh hơn.';

  const handleDelete = (subjectId, subjectName) => {
    toggleFavorite(subjectId, subjectName);
    appMessage.success('Đã xóa khỏi danh sách yêu thích.');
  };

  const handleOpenSubject = (subjectId) => {
    onClose();
    navigate(`/subjects/${subjectId}`, { state: { subjectId } });
  };

  const handleSmartPractice = (subject) => {
    onClose();
    navigate(`/subjects/${subject.subjectId}/practice`, {
      state: {
        subjectId: subject.subjectId,
        subjectName: subject.subjectName,
        chapters: subject.chapters || [],
      },
    });
  };

  return {
    error,
    favoriteCountText,
    favorites,
    handleDelete,
    handleOpenSubject,
    handleSmartPractice,
    loading,
  };
};

