"use client";
import {
  DataGrid,
  DataGridProps,
  GridActionsCellItem,
  gridClasses,
  GridColDef,
  GridRowId,
  GridValidRowModel,
  useGridApiRef,
} from "@mui/x-data-grid";
import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { darken } from "@mui/material";
import { jaJP } from "@mui/x-data-grid/locales";
import { FormStatus } from "@/components/Pages/Settings/Cards/Base";
import DeleteDialog from "@/components/Dialogs/Delete";
import { User } from "@/types/User";
import { PlainRole, Role } from "@/types/Role";

export default function RoleUsersDataGridClient({
  role,
  rows,
}: {
  role: PlainRole;
  rows: User[] | User<"Simple">[];
}) {
  const apiRef = useGridApiRef();
  const [localRows, setLocalRows] = React.useState<User[] | User<"Simple">[]>(
    () => rows,
  );
  React.useEffect(() => {
    setLocalRows(rows);
  }, [rows]);
  const [undeletedRows, setUndeletedRows] = React.useState<GridRowId | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const handleDelete = async (
    _prevState: FormStatus | null,
    _formData: FormData | null,
  ) => {
    try {
      if (!undeletedRows) {
        const res: FormStatus = {
          status: "error",
          message: "削除対象が選択されていません",
        };
        return res;
      }
      // use Role class to delete
      const roleInstance = new Role(
        role.id,
        role.custom_id,
        role.name,
        role.permissionBit,
        role.isSystem,
        role.isEnable,
        role.createdAt,
        role.updatedAt,
      );
      await roleInstance.unassignUser(undeletedRows as string);
      // remove row from grid data
      setLocalRows((prev) =>
        prev.filter((r) => String(r.id) !== String(undeletedRows)),
      );
      apiRef.current?.updateRows([{ id: undeletedRows, _action: "delete" }]);
      setUndeletedRows(null);
      setDeleteDialogOpen(false);
      const res: FormStatus = {
        status: "success",
        message: "ロールの割り当てを削除しました",
      };
      return res;
    } catch (error) {
      const res: FormStatus = {
        status: "error",
        message: `削除に失敗しました: ${String(error)}`,
      };
      return res;
    }
  };

  const unsavedChangesRef = React.useRef<{
    unsavedRows: Record<GridRowId, GridValidRowModel>;
    rowsBeforeChange: Record<GridRowId, GridValidRowModel>;
  }>({
    unsavedRows: {},
    rowsBeforeChange: {},
  });
  const columns = React.useMemo<GridColDef[]>(() => {
    return [
      {
        field: "actions",
        headerName: "操作",
        type: "actions",
        getActions: ({ id }: { id: GridRowId }) => {
          return [
            <GridActionsCellItem
              key={"delete-row"}
              icon={<DeleteIcon />}
              label="Delete"
              onClick={() => {
                setUndeletedRows(id);
                setDeleteDialogOpen(true);
              }}
            />,
          ];
        },
      },
      { field: "id", headerName: "ID", width: 250 },
      {
        field: "name",
        headerName: "ユーザー名",
        width: 200,
      },
      {
        field: "customId",
        headerName: "カスタムID",
        width: 150,
      },
      {
        field: "isSystem",
        headerName: "システム",
        width: 120,
        type: "boolean",
      },
      {
        field: "isEnable",
        headerName: "有効",
        width: 120,
        type: "boolean",
      },

      {
        field: "createdAt",
        headerName: "作成日時",
        width: 180,
        type: "dateTime",
        valueGetter: (value: Date) => {
          return value ? new Date(value) : null;
        },
      },
      {
        field: "updatedAt",
        headerName: "更新日時",
        width: 180,
        type: "dateTime",
        valueGetter: (value: Date) => {
          return value ? new Date(value) : null;
        },
      },
    ];
  }, []);

  const initialState = React.useMemo<
    NonNullable<DataGridProps["initialState"]>
  >(
    () => ({
      sorting: {
        sortModel: [{ field: "name", sort: "desc" }],
      },
      columns: {
        columnVisibilityModel: {
          id: false,
          isSystem: false,
          isEnable: false,
          createdAt: false,
          updatedAt: false,
        },
      },
    }),
    [],
  );

  const getRowClassName = React.useCallback<
    NonNullable<DataGridProps["getRowClassName"]>
  >(({ id }) => {
    const unsavedRow = unsavedChangesRef.current.unsavedRows[id];
    if (unsavedRow) {
      if (unsavedRow._action === "delete") {
        return "row--removed";
      }
      return "row--edited";
    }
    return "";
  }, []);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ height: 400 }}>
        <DataGrid
          rows={localRows}
          columns={columns}
          apiRef={apiRef}
          disableRowSelectionOnClick
          initialState={initialState}
          ignoreValueFormatterDuringExport
          showToolbar
          sx={{
            [`& .${gridClasses.row}.row--removed`]: {
              backgroundColor: (theme) => {
                if (theme.palette.mode === "light") {
                  return "rgba(255, 170, 170, 0.3)";
                }
                return darken("rgba(255, 170, 170, 1)", 0.7);
              },
            },
            [`& .${gridClasses.row}.row--edited`]: {
              backgroundColor: (theme) => {
                if (theme.palette.mode === "light") {
                  return "rgba(255, 254, 176, 0.3)";
                }
                return darken("rgba(255, 254, 176, 1)", 0.6);
              },
            },
          }}
          localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
          getRowClassName={getRowClassName}
        />
      </div>
      <DeleteDialog
        open={deleteDialogOpen}
        dataAction={handleDelete}
        handleClose={() => setDeleteDialogOpen(false)}
        title="ロール"
      />
    </div>
  );
}
