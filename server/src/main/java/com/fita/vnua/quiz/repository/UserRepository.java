package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    @Query("SELECT u FROM User u WHERE u.username LIKE %:searchText% OR u.fullName LIKE %:searchText%")
    List<User> findByUsernameContainingOrFullNameContaining(@Param("searchText") String keyword);

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

}
