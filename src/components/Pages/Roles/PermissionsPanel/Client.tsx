"use client";

import React, { useState } from "react";
import { PermissionResponse, PlainRole, Role } from "@/types/Role";
import {
  Grid,
  FormControlLabel,
  Checkbox,
  Typography,
  Stack,
  Button,
} from "@mui/material";
import { PermissionBitsFields, PermissionTexts } from "@/types/Permission";

export default function PermissionsPanelClient({
  role,
  permissions,
}: {
  role: PlainRole;
  permissions: PermissionResponse;
}) {
  const [bits, setBits] = useState<number>(
    typeof permissions?.permissionsBit === "number"
      ? permissions.permissionsBit
      : role.permissionBit ?? 0
  );

  const names = Object.keys(PermissionBitsFields).filter((k) =>
    isNaN(Number(k))
  );

  const handleToggle =
    (bit: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      setBits((prev) => (checked ? prev | bit : prev & ~bit));
    };

  const onSave = React.useCallback(async () => {
    const roleInstance = new Role(
      role.id,
      role.custom_id,
      role.name,
      role.permissionBit,
      role.isSystem,
      role.isEnable,
      role.createdAt,
      role.updatedAt
    );
    roleInstance.permissionBit = bits;
    await roleInstance.save();
  }, [bits, role]);

  return (
    <Stack spacing={2}>
      <Grid
        container
        spacing={2}
        sx={{
          p: 2,
          backgroundColor: "#f5f5f5",
          borderRadius: 4,
          border: 1,
          borderColor: "lightgray",
        }}
      >
        {names.map((name) => {
          const bit = (PermissionBitsFields as never)[name] as number;
          const label = (PermissionTexts as never)[name] ?? name;
          const checked = (bits & bit) === bit;
          return (
            <Grid size={{ xs: 12, md: 6, lg: 4, xl: 2 }} key={name}>
              <FormControlLabel
                control={
                  <Checkbox checked={checked} onChange={handleToggle(bit)} />
                }
                label={label}
              />
            </Grid>
          );
        })}
      </Grid>
      <Stack direction={"row"}>
        <Button variant="contained" color="primary" onClick={onSave}>
          <Typography variant="button">変更を保存</Typography>
        </Button>
      </Stack>
    </Stack>
  );
}
