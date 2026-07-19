package com.fita.vnua.quiz.service.impl;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

final class AdminSortHelper {
    private AdminSortHelper() {
    }

    static <T> List<T> sort(
            List<T> items,
            String sortBy,
            String sortDir,
            Map<String, Function<T, ? extends Comparable<?>>> accessors
    ) {
        if (sortBy == null || sortBy.isBlank()) {
            return items;
        }
        Function<T, ? extends Comparable<?>> accessor = accessors.get(sortBy);
        if (accessor == null) {
            return items;
        }

        Comparator<T> comparator = (left, right) -> compareValues(accessor.apply(left), accessor.apply(right));
        if (isDescending(sortDir)) {
            comparator = comparator.reversed();
        }
        return items.stream().sorted(comparator).toList();
    }

    @SuppressWarnings({"rawtypes", "unchecked"})
    private static int compareValues(Comparable left, Comparable right) {
        if (left == null && right == null) {
            return 0;
        }
        if (left == null) {
            return 1;
        }
        if (right == null) {
            return -1;
        }
        return left.compareTo(right);
    }

    private static boolean isDescending(String sortDir) {
        if (sortDir == null) {
            return false;
        }
        String normalizedSortDir = sortDir.trim().toLowerCase();
        return "desc".equals(normalizedSortDir) || "descend".equals(normalizedSortDir);
    }
}
