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
import type { PlainRole } from "@/types/Role";
import { redirect, RedirectType } from "next/navigation";
import { Box, Paper } from "@mui/material";

export default function RolesDataGridClient({ rows }: { rows: PlainRole[] }) {
  const apiRef = useGridApiRef();
  const [localRows, setLocalRows] = React.useState<PlainRole[]>(() => rows);

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
                redirect(`./roles/${id}`, RedirectType.push);
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
        headerName: "ロール名",
        width: 180,
        flex: 1,
      },
      {
        field: "customId",
        headerName: "カスタムID",
        width: 140,
        flex: 0.8,
      },
      {
        field: "description",
        headerName: "説明",
        width: 250,
        flex: 1,
      },
      {
        field: "permissionBitmask",
        headerName: "権限ビットマスク",
        width: 160,
        type: "number",
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
