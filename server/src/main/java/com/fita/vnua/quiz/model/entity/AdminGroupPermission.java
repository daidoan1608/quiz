package com.fita.vnua.quiz.model.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(
        name = "admin_group_permission",
        uniqueConstraints = @UniqueConstraint(columnNames = {"group_id", "scope_type", "scope_id", "resource", "action"})
)
public class AdminGroupPermission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "group_id", nullable = false)
    private AdminGroup group;

    @Column(name = "scope_type", nullable = false, length = 50)
    private String scopeType;

    @Column(name = "scope_id")
    private Long scopeId;

    @Column(nullable = false, length = 80)
    private String resource;

    @Column(nullable = false, length = 50)
    private String action;
}
