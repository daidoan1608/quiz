package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.FavoriteDto;
import com.fita.vnua.quiz.model.entity.Favorite;

import java.util.List;
import java.util.UUID;

public interface FavoriteService {
    FavoriteDto create(FavoriteDto favoriteDto);
    FavoriteDto delete(FavoriteDto favoriteDto);
    List<FavoriteDto> findFavoriteByUserID(UUID userID);
}
