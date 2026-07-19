package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.dto.response.AdminCapabilitiesResponse;
import com.fita.vnua.quiz.model.entity.AdminGroupPermission;
import com.fita.vnua.quiz.model.entity.AdminUserGroup;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.repository.AdminGroupPermissionRepository;
import com.fita.vnua.quiz.repository.AdminUserGroupRepository;
import com.fita.vnua.quiz.service.AdminCapabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service("adminCapabilityService")
@RequiredArgsConstructor
public class AdminCapabilityServiceImpl implements AdminCapabilityService {
    private static final List<String> ADMIN_MENUS = List.of(
            "MENU_DASHBOARD",
            "MENU_NOTIFICATIONS",
            "MENU_DOCUMENTS",
            "MENU_USER_EXAMS",
            "MENU_USERS",
            "MENU_GROUPS",
            "MENU_EXAMS",
            "MENU_CATEGORIES",
            "MENU_SUBJECTS",
            "MENU_CHAPTERS",
            "MENU_QUESTIONS",
            "MENU_AUDIT_LOGS",
            "MENU_ADMIN_GROUPS"
    );

    private final AdminUserGroupRepository userGroupRepository;
    private final AdminGroupPermissionRepository permissionRepository;

    @Override
    @Transactional(readOnly = true)
    public AdminCapabilitiesResponse getCapabilities(User user) {
        if (user == null || user.getRole() == User.Role.USER) {
            return emptyCapabilities();
        }
        if (user.getRole() == User.Role.ADMIN) {
            return AdminCapabilitiesResponse.builder()
                    .menus(ADMIN_MENUS)
                    .subjects(Map.of())
                    .global(Map.of("*", List.of("*")))
                    .build();
        }

        List<AdminGroupPermission> permissions = permissionsFor(user);
        Set<String> menus = new TreeSet<>();
        Map<String, Map<String, Set<String>>> subjectSets = new TreeMap<>();
        Map<String, Set<String>> globalSets = new TreeMap<>();

        for (AdminGroupPermission permission : permissions) {
            String resource = normalize(permission.getResource());
            String action = normalize(permission.getAction());
            String scopeType = normalize(permission.getScopeType());

            if ("GLOBAL".equals(scopeType)) {
                globalSets.computeIfAbsent(resource, ignored -> new TreeSet<>()).add(action);
                if (resource.startsWith("MENU_") && "VIEW".equals(action)) {
                    menus.add(resource);
                }
                continue;
            }

            if ("SUBJECT".equals(scopeType) && permission.getScopeId() != null) {
                subjectSets
                        .computeIfAbsent(String.valueOf(permission.getScopeId()), ignored -> new TreeMap<>())
                        .computeIfAbsent(resource, ignored -> new TreeSet<>())
                        .add(action);
            }
        }

        return AdminCapabilitiesResponse.builder()
                .menus(List.copyOf(menus))
                .subjects(toNestedListMap(subjectSets))
                .global(toListMap(globalSets))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasPermission(User user, String resource, String action, String scopeType, Long scopeId) {
        if (user == null || Boolean.TRUE.equals(user.getDeleted())) {
            return false;
        }
        if (user.getRole() == User.Role.ADMIN) {
            return true;
        }
        String normalizedResource = normalize(resource);
        String normalizedAction = normalize(action);
        String normalizedScopeType = normalize(scopeType);

        return permissionsFor(user).stream().anyMatch(permission ->
                normalizedResource.equals(normalize(permission.getResource()))
                        && normalizedAction.equals(normalize(permission.getAction()))
                        && normalizedScopeType.equals(normalize(permission.getScopeType()))
                        && Objects.equals(scopeId, permission.getScopeId())
        );
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasAnyPermission(User user, String resource, String action) {
        if (user == null || Boolean.TRUE.equals(user.getDeleted())) {
            return false;
        }
        if (user.getRole() == User.Role.ADMIN) {
            return true;
        }
        String normalizedResource = normalize(resource);
        String normalizedAction = normalize(action);

        return permissionsFor(user).stream().anyMatch(permission ->
                normalizedResource.equals(normalize(permission.getResource()))
                        && normalizedAction.equals(normalize(permission.getAction()))
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> getAllowedSubjectIds(User user, String resource, String action) {
        if (user == null || Boolean.TRUE.equals(user.getDeleted())) {
            return List.of();
        }
        if (user.getRole() == User.Role.ADMIN) {
            return List.of();
        }
        String normalizedResource = normalize(resource);
        String normalizedAction = normalize(action);

        return permissionsFor(user).stream()
                .filter(permission -> "SUBJECT".equals(normalize(permission.getScopeType())))
                .filter(permission -> permission.getScopeId() != null)
                .filter(permission -> normalizedResource.equals(normalize(permission.getResource())))
                .filter(permission -> normalizedAction.equals(normalize(permission.getAction())))
                .map(AdminGroupPermission::getScopeId)
                .distinct()
                .sorted()
                .toList();
    }

    private List<AdminGroupPermission> permissionsFor(User user) {
        List<Long> groupIds = userGroupRepository.findByUserIdAndGroupActiveTrue(user.getUserId()).stream()
                .map(AdminUserGroup::getGroup)
                .map(group -> group.getId())
                .toList();
        if (groupIds.isEmpty()) {
            return List.of();
        }
        return permissionRepository.findByGroupIdInAndGroupActiveTrue(groupIds);
    }

    private AdminCapabilitiesResponse emptyCapabilities() {
        return AdminCapabilitiesResponse.builder()
                .menus(List.of())
                .subjects(Map.of())
                .global(Map.of())
                .build();
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toUpperCase();
    }

    private Map<String, List<String>> toListMap(Map<String, Set<String>> source) {
        Map<String, List<String>> result = new TreeMap<>();
        source.forEach((key, value) -> result.put(key, List.copyOf(value)));
        return result;
    }

    private Map<String, Map<String, List<String>>> toNestedListMap(Map<String, Map<String, Set<String>>> source) {
        Map<String, Map<String, List<String>>> result = new TreeMap<>();
        source.forEach((scopeId, resourceMap) -> result.put(scopeId, toListMap(resourceMap)));
        return result;
    }
}
