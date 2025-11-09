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
import { User } from "@/types/User";
import { FormStatus } from "../Pages/Settings/Cards/Base";
import DeleteDialog from "../Dialogs/Delete";

export default function MembersDataGrid({
  rows,
  canUpdate,
  beforeJoined = false,
}: {
  rows: User[];
  canUpdate: boolean;
  beforeJoined?: boolean;
}) {
  const apiRef = useGridApiRef();
  const [hasUnsavedRows, setHasUnsavedRows] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [undeletedRows, setUndeletedRows] = React.useState<GridRowId>();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const handleDelete = async (
    _prevState: FormStatus | null,
    formData: FormData | null
  ) => {
    // TODO: Implement delete logic here
    setDeleteDialogOpen(false);
    return null;
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
                      icon={<DeleteIcon />}
                      label="Delete"
                      onClick={() => {
                        setDeleteDialogOpen(true);
                      }}
                    />,
                  ];
                } else {
                  return [
                    <GridActionsCellItem
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
                            .length > 0
                        );
                      }}
                    />,
                    <GridActionsCellItem
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
  }, [unsavedChangesRef, apiRef]);

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
      // Persist updates in the database
      setIsSaving(true);
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });

      setIsSaving(false);
      const rowsToDelete = Object.values(
        unsavedChangesRef.current.unsavedRows
      ).filter((row) => row._action === "delete");
      if (rowsToDelete.length > 0) {
        rowsToDelete.forEach((row) => {
          apiRef.current?.updateRows([row]);
        });
      }

      setHasUnsavedRows(false);
      unsavedChangesRef.current = {
        unsavedRows: {},
        rowsBeforeChange: {},
      };
    } catch (error) {
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
  console.log(beforeJoined);

  if (beforeJoined) {
    rows = rows.filter((row) => {
      return row.email.startsWith("temp_");
    });
  } else {
    rows = rows.filter((row) => {
      return !row.email.startsWith("temp_");
    });
  }

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
          rows={rows}
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
        />
      </div>
      <DeleteDialog
        open={deleteDialogOpen}
        dataAction={handleDelete}
        handleClose={() => setDeleteDialogOpen(false)}
        title="メンバー"
      />
    </div>
  );
}
