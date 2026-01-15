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
import RestoreIcon from "@mui/icons-material/Restore";
import { Button, darken } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { jaJP } from "@mui/x-data-grid/locales";
import { FormStatus } from "@/components/Pages/Settings/Cards/Base";
import DeleteDialog from "@/components/Dialogs/Delete";
import { PlainRole, Role } from "@/types/Role";

export default function RolesDataGridClient({
  rows,
  canUpdate,
}: {
  rows: PlainRole[];
  canUpdate: boolean;
}) {
  const apiRef = useGridApiRef();
  const [hasUnsavedRows, setHasUnsavedRows] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [localRows, setLocalRows] = React.useState<PlainRole[]>(() => rows);
  React.useEffect(() => {
    setLocalRows(rows);
  }, [rows]);
  const [undeletedRows, setUndeletedRows] = React.useState<GridRowId | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const handleDelete = async (
    _prevState: FormStatus | null,
    _formData: FormData | null
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
      const roleToDelete = new Role(String(undeletedRows), "", "", 0);
      await roleToDelete.delete();
      // remove row from grid data
      setLocalRows((prev) =>
        prev.filter((r) => String(r.id) !== String(undeletedRows))
      );
      apiRef.current?.updateRows([{ id: undeletedRows, _action: "delete" }]);
      setUndeletedRows(null);
      setDeleteDialogOpen(false);
      const res: FormStatus = {
        status: "success",
        message: "ロールを削除しました",
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
      ...(canUpdate
        ? ([
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
          ] as GridColDef[])
        : []),
      { field: "id", headerName: "ID", width: 250 },
      {
        field: "name",
        headerName: "ロール名",
        editable: canUpdate,
        width: 200,
      },
      {
        field: "custom_id",
        headerName: "カスタムID",
        editable: canUpdate,
        width: 150,
      },
      {
        field: "permissionBit",
        headerName: "権限ビット",
        editable: canUpdate,
        width: 140,
        type: "number",
      },
      {
        field: "isSystem",
        headerName: "システム",
        editable: canUpdate,
        width: 120,
        type: "boolean",
      },
      {
        field: "isEnable",
        headerName: "有効",
        editable: canUpdate,
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
  }, [canUpdate]);

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
        },
      },
    }),
    []
  );

  const processRowUpdate = React.useCallback<
    NonNullable<DataGridProps["processRowUpdate"]>
  >((newRow, oldRow) => {
    const rowId = newRow.id;

    unsavedChangesRef.current.unsavedRows[rowId] = newRow;
    if (!unsavedChangesRef.current.rowsBeforeChange[rowId]) {
      unsavedChangesRef.current.rowsBeforeChange[rowId] = oldRow;
    }
    setHasUnsavedRows(true);
    return newRow;
  }, []);

  const discardChanges = React.useCallback(() => {
    setHasUnsavedRows(false);
    Object.values(unsavedChangesRef.current.rowsBeforeChange).forEach((row) => {
      apiRef.current?.updateRows([row]);
    });
    unsavedChangesRef.current = {
      unsavedRows: {},
      rowsBeforeChange: {},
    };
  }, [apiRef]);

  const saveChanges = React.useCallback(async () => {
    try {
      setIsSaving(true);
      // persist changes to API
      const unsaved = Object.values(unsavedChangesRef.current.unsavedRows);

      for (const row of unsaved) {
        try {
          if (row._action === "delete") {
            const roleToDelete = new Role(String(row.id), "", "", 0);
            await roleToDelete.delete();
            apiRef.current?.updateRows([{ id: row.id, _action: "delete" }]);
            setLocalRows((prev) =>
              prev.filter((r) => String(r.id) !== String(row.id))
            );
          } else {
            const plain = row as unknown as PlainRole;
            const roleInst = new Role(
              String(plain.id),
              plain.custom_id || "",
              plain.name || "",
              plain.permissionBit || 0,
              plain.isSystem,
              plain.isEnable,
              plain.createdAt ? new Date(plain.createdAt) : undefined,
              plain.updatedAt ? new Date(plain.updatedAt) : undefined
            );
            const savedRole = await roleInst.save();
            const savedPlain = savedRole.toPlainObject();
            apiRef.current?.updateRows([
              savedPlain as unknown as GridValidRowModel,
            ]);
            setLocalRows((prev) =>
              prev.map((r) =>
                String(r.id) === String(savedPlain.id) ? savedPlain : r
              )
            );
          }
        } catch (err) {
          // ignore single row error but mark overall as failed later if needed
          console.error("Save/Delete row failed:", err);
        }
      }

      setIsSaving(false);

      setHasUnsavedRows(false);
      unsavedChangesRef.current = {
        unsavedRows: {},
        rowsBeforeChange: {},
      };
    } catch (_error) {
      // TODO: ErrorHandling
      setIsSaving(false);
    }
  }, [apiRef]);

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
      {canUpdate && (
        <div style={{ marginBottom: 8 }}>
          <Button
            disabled={!hasUnsavedRows}
            loading={isSaving}
            onClick={saveChanges}
            startIcon={<SaveIcon />}
            loadingPosition="start"
          >
            <span>変更を保存</span>
          </Button>
          <Button
            disabled={!hasUnsavedRows || isSaving}
            onClick={discardChanges}
            startIcon={<RestoreIcon />}
          >
            変更を元に戻す
          </Button>
        </div>
      )}
      <div style={{ height: 400 }}>
        <DataGrid
          rows={localRows}
          columns={columns}
          apiRef={apiRef}
          disableRowSelectionOnClick
          processRowUpdate={processRowUpdate}
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
          loading={isSaving}
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
