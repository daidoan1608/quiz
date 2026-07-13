package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.FavoriteDto;
import java.util.List;
import java.util.UUID;

public interface FavoriteService {
    FavoriteDto create(FavoriteDto favoriteDto, UUID currentUserId);
    FavoriteDto delete(FavoriteDto favoriteDto, UUID currentUserId);
    List<FavoriteDto> findFavoriteByUserID(UUID userID);
}
