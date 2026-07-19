import { useCallback, useEffect, useMemo, useState } from "react";
import { Form, message } from "antd";
import { adminGroupApi, subjectApi } from "../../../api/services";
import { getApiErrorMessage } from "../../../api/axiosConfig";
import { PRESETS } from "../constants";
import {
  buildPermissionSummary,
  keyOf,
  keyToPermission,
  permissionToKey,
  subjectLabel,
} from "../utils/permissionUtils";

export const useAdminGroups = () => {
  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [permissionKeys, setPermissionKeys] = useState(new Set());
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [selectedPresetKeys, setSelectedPresetKeys] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const permissions = useMemo(
    () => Array.from(permissionKeys).map(keyToPermission),
    [permissionKeys]
  );

  const subjectMap = useMemo(
    () => new Map(subjects.map((subject) => [subject.subjectId, subject])),
    [subjects]
  );

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      setGroups(await adminGroupApi.getAll());
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể tải nhóm quyền."));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSubjects = useCallback(async () => {
    setLoadingSubjects(true);
    try {
      setSubjects(await subjectApi.getAll());
    } catch (error) {
      message.warning(
        getApiErrorMessage(error, "Không thể tải danh sách môn học.")
      );
    } finally {
      setLoadingSubjects(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
    fetchSubjects();
  }, [fetchGroups, fetchSubjects]);

  const openModal = async (group = null) => {
    setEditingGroup(group);
    form.setFieldsValue(group || { active: true });
    const nextPermissions = group?.id
      ? await adminGroupApi.getPermissions(group.id)
      : [];
    setPermissionKeys(new Set(nextPermissions.map(permissionToKey)));
    setSelectedSubjectIds(
      Array.from(
        new Set(
          nextPermissions
            .filter((permission) => permission.scopeType === "SUBJECT" && permission.scopeId)
            .map((permission) => permission.scopeId)
        )
      )
    );
    setSelectedPresetKeys([]);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const saveGroup = async (values) => {
    try {
      const saved = await adminGroupApi.save({ ...editingGroup, ...values });
      await adminGroupApi.savePermissions(saved.id, permissions);
      message.success("Đã lưu nhóm quyền.");
      setModalOpen(false);
      fetchGroups();
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể lưu nhóm quyền."));
    }
  };

  const removeGroup = async (groupId) => {
    try {
      await adminGroupApi.remove(groupId);
      message.success("Đã xóa nhóm quyền.");
      fetchGroups();
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể xóa nhóm quyền."));
    }
  };

  const setPermission = (scopeType, scopeId, resource, action, checked) => {
    const key = keyOf(scopeType, scopeId, resource, action);
    setPermissionKeys((prev) => {
      const next = new Set(prev);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const isChecked = (scopeType, scopeId, resource, action) =>
    permissionKeys.has(keyOf(scopeType, scopeId, resource, action));

  const applyPreset = (presetKey) => {
    const preset = PRESETS.find((item) => item.key === presetKey);
    if (!preset) return;
    if (selectedSubjectIds.length === 0) {
      message.warning("Chọn ít nhất một môn trước khi áp dụng preset theo môn.");
      return;
    }

    setPermissionKeys((prev) => {
      const next = new Set(prev);
      preset.permissions.forEach(([resource, action, scopeType]) => {
        if (scopeType === "SUBJECT") {
          selectedSubjectIds.forEach((subjectId) =>
            next.add(keyOf("SUBJECT", subjectId, resource, action))
          );
        } else {
          next.add(keyOf("GLOBAL", null, resource, action));
        }
      });
      return next;
    });
  };

  const applySelectedPresets = () => {
    if (selectedPresetKeys.length === 0) {
      message.warning("Chọn ít nhất một mẫu quyền.");
      return;
    }
    selectedPresetKeys.forEach(applyPreset);
  };

  const clearSubjectPermissions = (subjectId) => {
    setPermissionKeys((prev) => {
      const next = new Set(prev);
      Array.from(next)
        .filter((key) => key.startsWith(`SUBJECT:${subjectId}:`))
        .forEach((key) => next.delete(key));
      return next;
    });
  };

  const handleSubjectSelection = (nextSubjectIds) => {
    const removedSubjectIds = selectedSubjectIds.filter(
      (subjectId) => !nextSubjectIds.includes(subjectId)
    );
    removedSubjectIds.forEach(clearSubjectPermissions);
    setSelectedSubjectIds(nextSubjectIds);
  };

  const previewRows = useMemo(
    () =>
      permissions
        .sort((a, b) => permissionToKey(a).localeCompare(permissionToKey(b)))
        .map((permission, index) => ({
          ...permission,
          key: index,
          scope:
            permission.scopeType === "GLOBAL"
              ? "Toàn hệ thống"
              : subjectMap.has(permission.scopeId)
                ? subjectLabel(subjectMap.get(permission.scopeId))
                : `Môn #${permission.scopeId}`,
        })),
    [permissions, subjectMap]
  );

  const summary = useMemo(
    () => buildPermissionSummary(permissions, subjectMap),
    [permissions, subjectMap]
  );

  return {
    groups,
    subjects,
    loading,
    loadingSubjects,
    editingGroup,
    selectedSubjectIds,
    selectedPresetKeys,
    setSelectedPresetKeys,
    modalOpen,
    form,
    subjectMap,
    previewRows,
    summary,
    fetchGroups,
    openModal,
    closeModal,
    saveGroup,
    removeGroup,
    setPermission,
    isChecked,
    applySelectedPresets,
    clearSubjectPermissions,
    handleSubjectSelection,
  };
};
