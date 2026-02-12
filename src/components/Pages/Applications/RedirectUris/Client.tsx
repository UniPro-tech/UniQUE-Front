"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowId,
  DataGridProps,
} from "@mui/x-data-grid";
import { jaJP } from "@mui/x-data-grid/locales";
import { enqueueSnackbar } from "notistack";

export default function RedirectUrisClient({
  applicationId,
  initialUris,
}: {
  applicationId: string;
  initialUris?: string[];
}) {
  const [uris, setUris] = useState<string[]>(initialUris ?? []);
  const [newUri, setNewUri] = useState("");
  const [saving, setSaving] = useState(false);

  // client-side calls go through our Next.js proxy route to avoid CORS
  const proxyBase = "/api/applications";

  useEffect(() => {
    // keep initialUris as source of truth on mount
    setUris(initialUris ?? []);
  }, [initialUris]);

  const addUri = async () => {
    if (!newUri) return;
    setSaving(true);
    try {
      const res = await fetch(
        `${proxyBase}/${encodeURIComponent(applicationId)}/redirect_uris`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ uri: newUri }),
        },
      );
      if (!res.ok) throw new Error("failed");
      setUris((s) => [...s, newUri]);
      setNewUri("");
      enqueueSnackbar("追加しました", { variant: "success" });
    } catch (e) {
      enqueueSnackbar("追加に失敗しました", { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const deleteUri = async (uri: string) => {
    if (!confirm(`"${uri}" を削除していい？`)) return;
    try {
      const res = await fetch(
        `${proxyBase}/${encodeURIComponent(applicationId)}/redirect_uris?uri=${encodeURIComponent(uri)}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error("failed");
      setUris((s) => s.filter((u) => u !== uri));
      enqueueSnackbar("削除しました", { variant: "success" });
    } catch (e) {
      enqueueSnackbar("削除に失敗しました", { variant: "error" });
    }
  };

  const rows = uris.map((u) => ({ id: u, uri: u }));

  const columns = React.useMemo<GridColDef[]>(() => {
    return [
      {
        field: "actions",
        headerName: "操作",
        type: "actions",
        width: 100,
        sortable: false,
        filterable: false,
        getActions: ({ id }: { id: GridRowId }) => {
          return [
            <GridActionsCellItem
              key={"delete-row"}
              icon={<DeleteIcon />}
              label="削除"
              onClick={() => deleteUri(String(id))}
            />,
          ];
        },
      },
      {
        field: "uri",
        headerName: "Redirect URI",
        width: 600,
        flex: 1,
        sortable: true,
        renderCell: (params) => {
          return (
            <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
              {params.value as string}
            </Typography>
          );
        },
      },
    ];
  }, [uris]);

  const initialState = React.useMemo<
    NonNullable<DataGridProps["initialState"]>
  >(
    () => ({
      sorting: { sortModel: [{ field: "uri", sort: "asc" }] },
      pagination: { paginationModel: { pageSize: 10, page: 0 } },
    }),
    [],
  );

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1">Redirect URIs</Typography>

      <Paper sx={{ width: "100%", p: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems="center"
        >
          <TextField
            label="Redirect URI"
            value={newUri}
            size="small"
            onChange={(e) => setNewUri(e.target.value)}
            sx={{ minWidth: 360, flex: 1 }}
          />
          <Button
            variant="contained"
            onClick={addUri}
            disabled={saving || !newUri}
            sx={{ whiteSpace: "nowrap" }}
          >
            追加
          </Button>
        </Stack>

        <Box sx={{ mt: 2 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            disableRowSelectionOnClick
            initialState={initialState}
            pageSizeOptions={[5, 10, 25, 50]}
            density="comfortable"
            localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
            autoHeight
            rowHeight={56}
            sx={{
              borderRadius: 1,
              "& .MuiDataGrid-cell": { py: 1.25 },
              "& .MuiDataGrid-columnHeaders": (theme) => ({
                backgroundColor: theme.palette.grey[50],
              }),
            }}
          />
        </Box>
      </Paper>
    </Stack>
  );
}
