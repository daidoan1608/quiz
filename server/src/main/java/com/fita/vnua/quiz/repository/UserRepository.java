package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    @Query("SELECT u FROM User u WHERE u.deleted = false AND (u.username LIKE %:searchText% OR u.fullName LIKE %:searchText%)")
    List<User> findByUsernameContainingOrFullNameContaining(@Param("searchText") String keyword);

    @Query("""
            SELECT u FROM User u
            WHERE u.deleted = false
              AND (
                   LOWER(u.username) LIKE LOWER(CONCAT('%', :searchText, '%'))
                OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :searchText, '%'))
                OR LOWER(u.email) LIKE LOWER(CONCAT('%', :searchText, '%'))
                OR CAST(u.userId AS string) LIKE CONCAT('%', :searchText, '%')
              )
            """)
    List<User> searchActiveUsersForNotification(
            @Param("searchText") String keyword,
            org.springframework.data.domain.Pageable pageable
    );

    List<User> findByDeletedFalse();

    List<User> findByDeletedTrue();

    long countByDeletedFalse();

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsUserByUsername(String username);

    boolean existsUserByEmail(String email);
}
