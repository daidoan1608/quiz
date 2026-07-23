package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.generator.FavoriteId;
import com.fita.vnua.quiz.model.dto.FavoriteDto;
import com.fita.vnua.quiz.model.entity.Favorite;
import com.fita.vnua.quiz.model.entity.Subject;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.repository.CategoryRepository;
import com.fita.vnua.quiz.repository.FavoriteRepository;
import com.fita.vnua.quiz.repository.SubjectRepository;
import com.fita.vnua.quiz.repository.UserRepository;
import com.fita.vnua.quiz.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements FavoriteService {
    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public FavoriteDto create(FavoriteDto favoriteDto, UUID currentUserId) {
        // Lấy User hoặc ném ngoại lệ nếu không tìm thấy
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        if (Boolean.TRUE.equals(user.getDeleted())) {
            throw new CustomApiException("Không tìm thấy người dùng", HttpStatus.NOT_FOUND);
        }

        // Lấy Subject hoặc ném ngoại lệ nếu không tìm thấy
        Subject subject = subjectRepository.findById(favoriteDto.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy môn học"));
        if (Boolean.TRUE.equals(subject.getDeleted()) || Boolean.TRUE.equals(subject.getCategory().getDeleted())) {
            throw new CustomApiException("Không tìm thấy môn học", HttpStatus.NOT_FOUND);
        }

        // Tạo entity Favorite mới
        Favorite favorite = new Favorite();
        FavoriteId favoriteId = new FavoriteId();
        favoriteId.setUserId(user.getUserId());
        favoriteId.setSubjectId(subject.getSubjectId());

        favorite.setId(favoriteId);
        favorite.setUser(user);
        favorite.setSubject(subject);

        // Lưu favorite vào DB
        Favorite savedFavorite = favoriteRepository.save(favorite);

        // Chuẩn bị FavoriteDto trả về
        FavoriteDto resultDto = new FavoriteDto();
        resultDto.setUserId(savedFavorite.getUser().getUserId());
        resultDto.setSubjectId(savedFavorite.getSubject().getSubjectId());
        resultDto.setSubjectName(savedFavorite.getSubject().getName());

        return resultDto;
    }

    @Override
    public FavoriteDto delete(FavoriteDto favoriteDto, UUID currentUserId) {
        UUID userId = currentUserId;
        Long subjectId = favoriteDto.getSubjectId();

        FavoriteId favoriteId = new FavoriteId();
        favoriteId.setUserId(userId);
        favoriteId.setSubjectId(subjectId);

        // Tìm favorite theo composite key
        Favorite favorite = favoriteRepository.findById(favoriteId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy môn học yêu thích"));

        favoriteRepository.delete(favorite);

        FavoriteDto resultDto = new FavoriteDto();
        resultDto.setUserId(userId);
        resultDto.setSubjectId(subjectId);
        resultDto.setSubjectName(favorite.getSubject().getName());
        return resultDto;
    }

    @Override
    public List<FavoriteDto> findFavoriteByUserID(UUID userID) {
        List<Favorite> favorites = favoriteRepository.findByUserIdWithSubjectAndCategory(userID);

        return favorites.stream()
                .filter(fav -> !Boolean.TRUE.equals(fav.getSubject().getDeleted()))
                .filter(fav -> !Boolean.TRUE.equals(fav.getSubject().getCategory().getDeleted()))
                .map(fav -> {
            FavoriteDto dto = new FavoriteDto();
            dto.setUserId(fav.getUser().getUserId());
            dto.setSubjectId(fav.getSubject().getSubjectId());
            dto.setSubjectName(fav.getSubject().getName());
            dto.setCategoryId(fav.getSubject().getCategory().getCategoryId());
            return dto;
        }).toList();
    }


}
