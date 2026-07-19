export const normalizeCapabilities = (value) => ({
  menus: Array.isArray(value?.menus) ? value.menus : [],
  subjects: value?.subjects && typeof value.subjects === "object" ? value.subjects : {},
  global: value?.global && typeof value.global === "object" ? value.global : {},
});

const normalize = (value) => String(value || "").trim().toUpperCase();

const hasWildcard = (actions = []) => actions.includes("*");

export const canMenu = (user, capabilities, menu) => {
  if (user?.role === "ADMIN") return true;
  return normalizeCapabilities(capabilities).menus.includes(normalize(menu));
};

export const canGlobal = (user, capabilities, resource, action) => {
  if (user?.role === "ADMIN") return true;
  const actions = normalizeCapabilities(capabilities).global?.[normalize(resource)] || [];
  return hasWildcard(actions) || actions.includes(normalize(action));
};

export const canOnSubject = (user, capabilities, subjectId, resource, action) => {
  if (user?.role === "ADMIN") return true;
  if (!subjectId) return false;
  const actions =
    normalizeCapabilities(capabilities).subjects?.[String(subjectId)]?.[normalize(resource)] || [];
  return hasWildcard(actions) || actions.includes(normalize(action));
};

export const canAnySubject = (user, capabilities, resource, action) => {
  if (user?.role === "ADMIN") return true;
  const normalized = normalizeCapabilities(capabilities);
  return Object.keys(normalized.subjects).some((subjectId) =>
    canOnSubject(user, normalized, subjectId, resource, action)
  );
};

export const canAny = (user, capabilities, resource, action) =>
  canGlobal(user, capabilities, resource, action) ||
  canAnySubject(user, capabilities, resource, action);

export const getAllowedSubjectIds = (user, capabilities, resource, action) => {
  if (user?.role === "ADMIN") return null;
  const normalized = normalizeCapabilities(capabilities);
  return Object.keys(normalized.subjects)
    .filter((subjectId) => canOnSubject(user, normalized, subjectId, resource, action))
    .map(Number)
    .filter(Number.isFinite);
};
