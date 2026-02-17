"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import {
  updateRole,
  UpdateRoleFormData,
} from "@/app/dashboard/roles/[id]/action";
import { PermissionBitsFields, PermissionTexts } from "@/types/Permission";
import type { PlainRole } from "@/types/Role";

interface RoleEditFormProps {
  role: PlainRole;
}

// 権限のグループ化
const permissionGroups = [
  {
    title: "ユーザー管理",
    permissions: [
      PermissionBitsFields.USER_READ,
      PermissionBitsFields.USER_CREATE,
      PermissionBitsFields.USER_UPDATE,
      PermissionBitsFields.USER_DELETE,
      PermissionBitsFields.USER_DISABLE,
    ],
  },
  {
    title: "アプリケーション管理",
    permissions: [
      PermissionBitsFields.APP_READ,
      PermissionBitsFields.APP_UPDATE,
      PermissionBitsFields.APP_DELETE,
      PermissionBitsFields.APP_SECRET_ROTATE,
    ],
  },
  {
    title: "システム管理",
    permissions: [
      PermissionBitsFields.TOKEN_REVOKE,
      PermissionBitsFields.AUDIT_READ,
      PermissionBitsFields.CONFIG_UPDATE,
      PermissionBitsFields.KEY_MANAGE,
    ],
  },
  {
    title: "RBAC・セキュリティ",
    permissions: [
      PermissionBitsFields.ROLE_MANAGE,
      PermissionBitsFields.PERMISSION_MANAGE,
      PermissionBitsFields.SESSION_MANAGE,
      PermissionBitsFields.MFA_MANAGE,
    ],
  },
];

export default function RoleEditForm({ role }: RoleEditFormProps) {
  const [formData, setFormData] = useState<UpdateRoleFormData>({
    customId: role.customId || "",
    name: role.name || "",
    description: role.description || "",
    permissionBitmask: role.permissionBitmask || 0,
    isDefault: role.isDefault || false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: keyof UpdateRoleFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  };

  const handlePermissionToggle = (permission: PermissionBitsFields) => {
    setFormData((prev) => ({
      ...prev,
      permissionBitmask: prev.permissionBitmask ^ permission,
    }));
    setSuccess(false);
  };

  const isPermissionChecked = (permission: PermissionBitsFields) => {
    return (formData.permissionBitmask & permission) !== 0;
  };

  const getPermissionName = (permission: PermissionBitsFields): string => {
    const key = PermissionBitsFields[
      permission
    ] as keyof typeof PermissionTexts;
    return PermissionTexts[key] || "不明な権限";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // バリデーション
    if (!formData.customId.trim()) {
      setError("カスタムIDを入力してください");
      setLoading(false);
      return;
    }

    if (!formData.name.trim()) {
      setError("ロール名を入力してください");
      setLoading(false);
      return;
    }

    try {
      const result = await updateRole(role.id, formData);

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "更新に失敗しました");
      }
    } catch (err) {
      setError("予期しないエラーが発生しました");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleIsDefaultToggle = (v: boolean) => {
    setFormData((prev) => ({ ...prev, isDefault: v }));
    setError(null);
    setSuccess(false);
  };

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        基本情報編集
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={3}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" onClose={() => setSuccess(false)}>
              ロールを更新しました
            </Alert>
          )}

          <TextField
            label="カスタムID"
            fullWidth
            required
            value={formData.customId}
            onChange={(e) => handleChange("customId", e.target.value)}
            helperText="ロールを識別するためのユニークなIDを入力してください（例: admin, member）"
            disabled={loading}
          />

          <TextField
            label="ロール名"
            fullWidth
            required
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            helperText="ロールの表示名を入力してください"
            disabled={loading}
          />

          <TextField
            label="説明"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            helperText="ロールの説明を入力してください（任意）"
            disabled={loading}
          />

          <Divider />

          <FormControlLabel
            control={
              <Checkbox
                checked={!!formData.isDefault}
                onChange={(e) => handleIsDefaultToggle(e.target.checked)}
                disabled={loading}
              />
            }
            label="新規ユーザーにデフォルトで付与する"
          />

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              権限設定
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              このロールに付与する権限を選択してください
            </Typography>

            {permissionGroups.map((group) => (
              <Box key={group.title} sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  color="primary"
                  sx={{ mt: 2, mb: 1 }}
                >
                  {group.title}
                </Typography>
                <FormGroup>
                  {group.permissions.map((permission) => (
                    <FormControlLabel
                      key={permission}
                      control={
                        <Checkbox
                          checked={isPermissionChecked(permission)}
                          onChange={() => handlePermissionToggle(permission)}
                          disabled={loading}
                        />
                      }
                      label={getPermissionName(permission)}
                    />
                  ))}
                </FormGroup>
              </Box>
            ))}

            <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
              選択された権限ビットマスク: {formData.permissionBitmask}
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              startIcon={
                loading ? <CircularProgress size={20} /> : <SaveIcon />
              }
              disabled={loading}
            >
              {loading ? "保存中..." : "変更を保存"}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
}
