import { useCallback, useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { adminGroupApi, subjectApi } from "../../../api/services";
import { getApiErrorMessage } from "../../../api/axiosConfig";
import {
  ACTION_LABELS,
  RESOURCE_LABELS,
  permissionKey,
  subjectLabel,
} from "../utils/permissionLabels";

export const useUserGroupAssignment = ({
  isModalOpen,
  user,
  onCancel,
  onSuccess,
}) => {
  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [groupPermissions, setGroupPermissions] = useState({});
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const subjectMap = useMemo(
    () => new Map(subjects.map((subject) => [Number(subject.subjectId), subject])),
    [subjects]
  );

  const loadData = useCallback(async () => {
    if (!user?.userId) return;
    setLoading(true);
    try {
      const [allGroups, userGroups, subjectList] = await Promise.all([
        adminGroupApi.getAll(),
        adminGroupApi.getUserGroups(user.userId),
        subjectApi.getAll(),
      ]);
      const activeGroups = allGroups.filter((group) => group.active);
      const permissionsEntries = await Promise.all(
        activeGroups.map(async (group) => [
          group.id,
          await adminGroupApi.getPermissions(group.id),
        ])
      );
      setGroups(activeGroups);
      setSubjects(subjectList);
      setGroupPermissions(Object.fromEntries(permissionsEntries));
      setSelectedGroupIds(userGroups.map((group) => group.id));
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể tải nhóm quyền."));
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    if (isModalOpen) loadData();
  }, [isModalOpen, loadData]);

  const selectedPermissions = useMemo(() => {
    const map = new Map();
    selectedGroupIds.forEach((groupId) => {
      (groupPermissions[groupId] || []).forEach((permission) => {
        map.set(permissionKey(permission), permission);
      });
    });
    return Array.from(map.values());
  }, [groupPermissions, selectedGroupIds]);

  const previewRows = useMemo(
    () =>
      selectedPermissions
        .sort((a, b) => permissionKey(a).localeCompare(permissionKey(b)))
        .map((permission, index) => ({
          key: index,
          scope:
            permission.scopeType === "GLOBAL"
              ? "Toàn hệ thống"
              : subjectMap.has(Number(permission.scopeId))
                ? subjectLabel(subjectMap.get(Number(permission.scopeId)))
                : `Môn #${permission.scopeId}`,
          resource: RESOURCE_LABELS[permission.resource] || permission.resource,
          action: ACTION_LABELS[permission.action] || permission.action,
        })),
    [selectedPermissions, subjectMap]
  );

  const selectedGroups = groups.filter((group) =>
    selectedGroupIds.includes(group.id)
  );
  const selectedSubjectCount = new Set(
    selectedPermissions
      .filter(
        (permission) =>
          permission.scopeType === "SUBJECT" && permission.scopeId
      )
      .map((permission) => permission.scopeId)
  ).size;
  const selectedMenuCount = selectedPermissions.filter((permission) =>
    permission.resource?.startsWith("MENU_")
  ).length;

  const summary = useMemo(() => {
    const menus = new Set();
    const globalResources = new Set();
    const subjectResources = new Map();

    selectedPermissions.forEach((permission) => {
      const resource = RESOURCE_LABELS[permission.resource] || permission.resource;
      const action = ACTION_LABELS[permission.action] || permission.action;
      if (permission.resource?.startsWith("MENU_") && permission.action === "VIEW") {
        menus.add(resource);
        return;
      }
      if (permission.scopeType === "GLOBAL") {
        globalResources.add(`${resource}: ${action}`);
        return;
      }
      const subjectName = subjectMap.has(Number(permission.scopeId))
        ? subjectLabel(subjectMap.get(Number(permission.scopeId)))
        : `Môn #${permission.scopeId}`;
      const values = subjectResources.get(subjectName) || new Set();
      values.add(`${resource}: ${action}`);
      subjectResources.set(subjectName, values);
    });

    return {
      menus: Array.from(menus),
      globalResources: Array.from(globalResources),
      subjectResources: Array.from(subjectResources.entries()).map(
        ([subject, values]) => ({
          subject,
          values: Array.from(values),
        })
      ),
    };
  }, [selectedPermissions, subjectMap]);

  const save = async () => {
    setSaving(true);
    try {
      await adminGroupApi.assignUserGroups(user.userId, selectedGroupIds);
      message.success("Đã gán nhóm quyền.");
      onSuccess?.();
      onCancel();
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể gán nhóm quyền."));
    } finally {
      setSaving(false);
    }
  };

  return {
    groups,
    groupPermissions,
    selectedGroupIds,
    setSelectedGroupIds,
    loading,
    saving,
    selectedPermissions,
    previewRows,
    selectedGroups,
    selectedSubjectCount,
    selectedMenuCount,
    summary,
    save,
  };
};
