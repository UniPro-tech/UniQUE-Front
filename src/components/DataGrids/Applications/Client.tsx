"use client";
import {
  DataGrid,
  DataGridProps,
  GridActionsCellItem,
  GridColDef,
  GridRowId,
  useGridApiRef,
} from "@mui/x-data-grid";
import React from "react";
import EditIcon from "@mui/icons-material/Edit";
import { jaJP } from "@mui/x-data-grid/locales";
import type { ApplicationWithOwner } from "@/types/Application";
import { redirect, RedirectType } from "next/navigation";
import { Box, Paper, Link as MuiLink } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export default function ApplicationsDataGridClient({
  rows,
}: {
  rows: ApplicationWithOwner[];
}) {
  const apiRef = useGridApiRef();
  const [localRows, setLocalRows] = React.useState<ApplicationWithOwner[]>(
    () => rows,
  );

  React.useEffect(() => {
    setLocalRows(rows);
  }, [rows]);

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
              key={"edit-row"}
              icon={<EditIcon />}
              label="編集"
              onClick={() => {
                redirect(`./applications/${id}`, RedirectType.push);
              }}
            />,
          ];
        },
      },
      {
        field: "id",
        headerName: "ID",
        width: 200,
        flex: 0.5,
      },
      {
        field: "name",
        headerName: "アプリケーション名",
        width: 200,
        flex: 1,
      },
      {
        field: "description",
        headerName: "説明",
        width: 250,
        flex: 1,
      },
      {
        field: "websiteUrl",
        headerName: "Webサイト",
        width: 200,
        flex: 1,
        renderCell: (params) => {
          if (!params.value) return null;
          return (
            <MuiLink
              href={params.value as string}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {params.value as string}
              </span>
              <OpenInNewIcon fontSize="small" />
            </MuiLink>
          );
        },
      },
      {
        field: "privacyPolicyUrl",
        headerName: "プライバシーポリシー",
        width: 200,
        flex: 1,
        renderCell: (params) => {
          if (!params.value) return null;
          return (
            <MuiLink
              href={params.value as string}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {params.value as string}
              </span>
              <OpenInNewIcon fontSize="small" />
            </MuiLink>
          );
        },
      },
      {
        field: "ownerDisplayName",
        headerName: "所有者",
        width: 200,
        flex: 0.8,
        renderCell: (params) => {
          const displayName = params.row.ownerDisplayName;
          const customId = params.row.ownerCustomId;
          if (!displayName && !customId) return "不明";
          return `${displayName} (${customId})`;
        },
      },
    ];
  }, []);

  const initialState = React.useMemo<
    NonNullable<DataGridProps["initialState"]>
  >(
    () => ({
      sorting: {
        sortModel: [{ field: "name", sort: "asc" }],
      },
      columns: {
        columnVisibilityModel: {
          id: false,
        },
      },
      pagination: {
        paginationModel: {
          pageSize: 10,
          page: 0,
        },
      },
    }),
    [],
  );

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <Box sx={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={localRows}
          columns={columns}
          apiRef={apiRef}
          disableRowSelectionOnClick
          initialState={initialState}
          ignoreValueFormatterDuringExport
          localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
          pageSizeOptions={[5, 10, 25, 50]}
          density="comfortable"
        />
      </Box>
    </Paper>
  );
}
