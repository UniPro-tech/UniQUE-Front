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
import CheckIcon from "@mui/icons-material/Check";
import { Button, darken } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { jaJP } from "@mui/x-data-grid/locales";
import { User } from "@/types/User";
import { FormStatus } from "@/components/Pages/Settings/Cards/Base";
import DeleteDialog from "@/components/Dialogs/Delete";
import { saveUser, deleteUser } from "@/lib/resources/Users";
import ApproveRegistApplyDialog from "@/components/Dialogs/ApproveRegistApply";

export default function MembersDataGrid({
  rows,
  beforeJoined = false,
}: {
  rows: User[] | User<"Simple">[];
  beforeJoined?: boolean;
}) {
  const apiRef = useGridApiRef();
  const [hasUnsavedRows, setHasUnsavedRows] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [localRows, setLocalRows] = React.useState<User[] | User<"Simple">[]>(
    () =>
      beforeJoined
        ? rows.filter((row) => row.email.startsWith("temp_"))
        : rows.filter((row) => !row.email.startsWith("temp_")),
  );
  React.useEffect(() => {
    setLocalRows(
      beforeJoined
        ? rows.filter((row) => row.email.startsWith("temp_"))
        : rows.filter((row) => !row.email.startsWith("temp_")),
    );
  }, [rows, beforeJoined]);
  const canUpdate = rows.length > 0 && !("isSuspended" in rows[0]) === false;
  const [undeletedRows, setUndeletedRows] = React.useState<GridRowId>();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const handleDelete = async (
    _prevState: FormStatus | null,
    formData: FormData | null,
  ) => {
    try {
      if (!undeletedRows) {
        const res: FormStatus = {
          status: "error",
          message: "削除対象が選択されていません",
        };
        return res;
      }
      await deleteUser(String(undeletedRows));
      // remove row from grid data
      setLocalRows((prev) =>
        prev.filter((r) => String(r.id) !== String(undeletedRows)),
      );
      apiRef.current?.updateRows([{ id: undeletedRows, _action: "delete" }]);
      setUndeletedRows(undefined);
      setDeleteDialogOpen(false);
      const res: FormStatus = {
        status: "success",
        message: "メンバーを削除しました",
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
  const [approveDialogOpen, setApproveDialogOpen] = React.useState(false);
  const [approvedUser, setApprovedUser] = React.useState<
    User | User<"Simple"> | null
  >(null);
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
              getActions: ({
                id,
                row,
              }: {
                id: GridRowId;
                row: GridValidRowModel;
              }) => {
                if (beforeJoined) {
                  return [
                    <GridActionsCellItem
                      key={"approve"}
                      icon={<CheckIcon />}
                      label="Approve"
                      onClick={() => {
                        setApprovedUser(
                          localRows.find((u) => String(u.id) === String(id)) ||
                            null,
                        );
                        setApproveDialogOpen(true);
                      }}
                    />,
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
                } else {
                  return [
                    <GridActionsCellItem
                      key={"discard-changes"}
                      icon={<RestoreIcon />}
                      label="Discard changes"
                      disabled={
                        unsavedChangesRef.current.unsavedRows[id] === undefined
                      }
                      onClick={() => {
                        apiRef.current?.updateRows([
                          unsavedChangesRef.current.rowsBeforeChange[id],
                        ]);
                        delete unsavedChangesRef.current.rowsBeforeChange[id];
                        delete unsavedChangesRef.current.unsavedRows[id];
                        setHasUnsavedRows(
                          Object.keys(unsavedChangesRef.current.unsavedRows)
                            .length > 0,
                        );
                      }}
                    />,
                    <GridActionsCellItem
                      key={"delete-row"}
                      icon={<DeleteIcon />}
                      label="Delete"
                      onClick={() => {
                        unsavedChangesRef.current.unsavedRows[id] = {
                          ...row,
                          _action: "delete",
                        };
                        if (!unsavedChangesRef.current.rowsBeforeChange[id]) {
                          unsavedChangesRef.current.rowsBeforeChange[id] = row;
                        }
                        setHasUnsavedRows(true);
                        apiRef.current?.updateRows([row]); // to trigger row render
                      }}
                    />,
                  ];
                }
              },
            },
            { field: "id", headerName: "ID", width: 250 },
          ] as GridColDef[])
        : []),
      { field: "name", headerName: "名前", editable: canUpdate, width: 150 },
      {
        field: "customId",
        headerName: "カスタムID",
        editable: canUpdate,
        width: 150,
      },
      {
        field: "email",
        headerName: "メールアドレス",
        editable: canUpdate,
        width: 250,
      },
      ...(canUpdate
        ? [
            {
              field: "externalEmail",
              headerName: "外部メールアドレス",
              width: 250,
              editable: canUpdate,
            },
          ]
        : []),
      {
        field: "period",
        headerName: "所属期",
        editable: canUpdate,
        width: 150,
      },
      ...(canUpdate
        ? ([
            {
              field: "isEnable",
              headerName: "有効状態",
              width: 100,
              type: "boolean",
              editable: canUpdate,
            },
            {
              field: "isSuspended",
              headerName: "停止状態",
              width: 100,
              type: "boolean",

              editable: canUpdate,
            },
            {
              field: "suspendedReason",
              headerName: "停止理由",
              width: 200,
              editable: canUpdate,
            },
            {
              field: "suspendedUntil",
              headerName: "停止解除日",
              width: 150,
              type: "dateTime",

              editable: canUpdate,
              valueGetter: (value: Date) => {
                return value ? new Date(value) : null;
              },
            },
          ] as GridColDef[])
        : []),
      {
        field: "joinedAt",
        headerName: "参加日時",
        width: 150,
        type: "dateTime",
        editable: canUpdate,
        valueGetter: (value: Date) => {
          return value ? new Date(value) : null;
        },
      },
      ...(canUpdate
        ? ([
            {
              field: "createdAt",
              headerName: "作成日時",
              width: 150,
              type: "dateTime",
              valueGetter: (value: Date) => {
                return value ? new Date(value) : null;
              },
            },
            {
              field: "updatedAt",
              headerName: "更新日時",
              width: 150,
              type: "dateTime",
              valueGetter: (value: Date) => {
                return value ? new Date(value) : null;
              },
            },
          ] as GridColDef[])
        : []),
    ];
  }, [unsavedChangesRef, apiRef, canUpdate, beforeJoined, localRows]);

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
            await deleteUser(String(row.id));
            apiRef.current?.updateRows([{ id: row.id, _action: "delete" }]);
            setLocalRows((prev) =>
              prev.filter((r) => String(r.id) !== String(row.id)),
            );
          } else {
            const saved = await saveUser(row as unknown as User);
            apiRef.current?.updateRows([saved]);
            setLocalRows((prev) =>
              prev.map((r) => (String(r.id) === String(saved.id) ? saved : r)),
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
    } catch {
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
      {canUpdate && !beforeJoined && (
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
          ignoreValueFormatterDuringExport
          initialState={{
            columns: {
              columnVisibilityModel: {
                email: !beforeJoined,
                isSuspended: !beforeJoined,
                suspendedReason: !beforeJoined,
                suspendedUntil: !beforeJoined,
              },
            },
          }}
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
          autoHeight
        />
      </div>
      <DeleteDialog
        open={deleteDialogOpen}
        dataAction={handleDelete}
        handleClose={() => setDeleteDialogOpen(false)}
        title="メンバー"
      />
      <ApproveRegistApplyDialog
        open={approveDialogOpen}
        handleClose={() => setApproveDialogOpen(false)}
        user={approvedUser as User | null}
      />
    </div>
  );
}
