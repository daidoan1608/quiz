import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subjectApi } from 'api/services/subjectApi';
import { useFavorites } from 'context/favorites/FavoritesContext';
import { useLanguage } from 'context/language/LanguageProvider';
import { buildSubjectDetailLocation } from '../utils/subjectNavigation';
import {
  getCategoryName as resolveCategoryName,
  getSubjectProgress,
  getSubjectStatus,
} from '../utils/subjectPresentation';

const PAGE_SIZE = 6;

export const useSubjects = () => {
  const { favorites, toggleFavorite } = useFavorites();
  const { texts } = useLanguage();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [subjectsData, categoriesData] = await Promise.all([
          subjectApi.getPublicSubjects(),
          subjectApi.getPublicCategories(),
        ]);

        setSubjects(subjectsData || []);
        setCategories(categoriesData ? categoriesData.flat() : []);
      } catch (error) {
        console.error('Lỗi khi tải danh sách môn học:', error);
        setSubjects([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredSubjects = useMemo(() => {
    let result = subjects;

    if (selectedCategory) {
      result = result.filter(
        (subject) => subject.categoryId === selectedCategory
      );
    }

    if (searchQuery.trim()) {
      const keyword = searchQuery.trim().toLowerCase();
      result = result.filter((subject) =>
        String(subject.name || '')
          .toLowerCase()
          .includes(keyword)
      );
    }

    return result;
  }, [searchQuery, selectedCategory, subjects]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const paginatedSubjects = filteredSubjects.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const clearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    setIsMobileSidebarOpen(false);
  };

  const handleOpenSubject = (subject) => {
    navigate(buildSubjectDetailLocation(subject));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCategoryName = (category) =>
    resolveCategoryName({ category, texts });

  const getProgress = getSubjectProgress;
  const getStatus = (subject) => getSubjectStatus({ subject, texts });

  return {
    categories,
    clearFilters,
    currentPage,
    favorites,
    filteredSubjects,
    getCategoryName,
    getProgress,
    getStatus,
    handleOpenSubject,
    handlePageChange,
    isMobileSidebarOpen,
    loading,
    pageSize: PAGE_SIZE,
    paginatedSubjects,
    searchQuery,
    selectedCategory,
    setIsMobileSidebarOpen,
    setSearchQuery,
    setSelectedCategory,
    texts,
    toggleFavorite,
  };
};
