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

    @Query("""
            SELECT u FROM User u
            WHERE (:deleted IS NULL OR u.deleted = :deleted)
            AND (:role IS NULL OR u.role = :role)
            AND (:authProvider IS NULL OR u.authProvider = :authProvider)
            AND (:emailVerified IS NULL OR u.emailVerified = :emailVerified)
            AND (
                :keyword IS NULL OR :keyword = ''
                OR LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(u.phone) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR CAST(u.userId AS string) LIKE CONCAT('%', :keyword, '%')
            )
            """)
    List<User> filterUsers(
            @Param("keyword") String keyword,
            @Param("role") User.Role role,
            @Param("authProvider") User.AuthProvider authProvider,
            @Param("emailVerified") Boolean emailVerified,
            @Param("deleted") Boolean deleted
    );

    List<User> findByDeletedFalse();

    List<User> findByDeletedTrue();

    long countByDeletedFalse();

    long countByRoleAndDeletedFalse(User.Role role);

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsUserByUsername(String username);

    boolean existsUserByEmail(String email);
}
