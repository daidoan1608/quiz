import { ACTION_LABELS, RESOURCE_LABELS } from "../constants";

export const keyOf = (scopeType, scopeId, resource, action) =>
  `${scopeType}:${scopeId || ""}:${resource}:${action}`;

export const permissionToKey = (permission) =>
  keyOf(permission.scopeType, permission.scopeId, permission.resource, permission.action);

export const keyToPermission = (key) => {
  const [scopeType, scopeId, resource, action] = key.split(":");
  return {
    scopeType,
    scopeId: scopeType === "GLOBAL" ? null : Number(scopeId),
    resource,
    action,
  };
};

export const subjectLabel = (subject) =>
  `${subject.name || subject.subjectName || `Môn #${subject.subjectId}`} (ID: ${subject.subjectId})`;

export const buildPermissionSummary = (permissions, subjectMap) => {
  const menus = new Set();
  const globalResources = new Set();
  const subjectResources = new Map();

  permissions.forEach((permission) => {
    if (permission.resource?.startsWith("MENU_") && permission.action === "VIEW") {
      menus.add(RESOURCE_LABELS[permission.resource] || permission.resource);
    } else if (permission.scopeType === "GLOBAL") {
      globalResources.add(
        `${RESOURCE_LABELS[permission.resource] || permission.resource}: ${ACTION_LABELS[permission.action] || permission.action}`
      );
    } else {
      const subjectName = subjectMap.has(permission.scopeId)
        ? subjectLabel(subjectMap.get(permission.scopeId))
        : `Môn #${permission.scopeId}`;
      const values = subjectResources.get(subjectName) || new Set();
      values.add(
        `${RESOURCE_LABELS[permission.resource] || permission.resource}: ${ACTION_LABELS[permission.action] || permission.action}`
      );
      subjectResources.set(subjectName, values);
    }
  });

  return {
    menus: Array.from(menus),
    globalResources: Array.from(globalResources),
    subjectResources: Array.from(subjectResources.entries()).map(([subject, values]) => ({
      subject,
      values: Array.from(values),
    })),
  };
};
