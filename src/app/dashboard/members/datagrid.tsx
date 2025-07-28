"use client";
import * as React from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import {
  GridRowModes,
  DataGrid,
  GridActionsCellItem,
  GridValidRowModel,
  GridRowModesModel,
  GridRowId,
  GridRowModel,
  GridEventListener,
  GridRowEditStopReasons,
  GridRowsProp,
  GridSlotProps,
  Toolbar,
  ToolbarButton,
} from "@mui/x-data-grid";
import { Alert, Snackbar, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { ulid } from "ulid";

declare module "@mui/x-data-grid" {
  interface ToolbarPropsOverrides {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
      newModel: (oldModel: GridRowModesModel) => GridRowModesModel
    ) => void;
  }
}

function EditToolbar(props: GridSlotProps["toolbar"]) {
  const { setRows, setRowModesModel } = props;

  const handleAddClick = () => {
    const id = ulid();
    const newUser = {
      id,
      custom_id: "",
      name: "",
      email: "",
      external_email: "",
      period: "",
      isNew: true,
    };
    setRows((oldRows) => [...oldRows, newUser]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "name" },
    }));
  };

  return (
    <Toolbar>
      <Tooltip title="Add record">
        <ToolbarButton onClick={handleAddClick}>
          <AddIcon fontSize="small" />
        </ToolbarButton>
      </Tooltip>
    </Toolbar>
  );
}

export default function DataGridContents({
  rows: rowProps,
}: {
  rows: GridValidRowModel[];
}) {
  type actionStatusType = "success" | "error" | null;
  const [actionStatus, setActionStatus] = React.useState<{
    type: actionStatusType;
    message: string | null;
  }>({
    type: null,
    message: null,
  });
  const [rows, setRows] = React.useState<GridValidRowModel[]>(rowProps);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id: GridRowId) => async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/users/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    if (res.ok) {
      setRows(rows.filter((row) => row.id !== id));
      setActionStatus({
        type: "success",
        message: "User deleted successfully.",
      });
    }
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rowProps.find((row) => row.id === id);
    if (editedRow!.isNew) {
      setRows(rowProps.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = async (newRow: GridRowModel) => {
    let updatedRow = { ...newRow, isNew: false };
    try {
      if (newRow.isNew) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(updatedRow),
        });
        if (!res.ok) {
          setActionStatus({
            type: "error",
            message: (await res.json()).message,
          });
          return;
        }
        const data = await res.json();
        updatedRow = { ...updatedRow, ...data, isNew: false };
        setActionStatus({
          type: "success",
          message: "User created successfully.",
        });
      } else {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/users/${newRow.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(updatedRow),
          }
        );
        if (!res.ok) {
          setActionStatus({
            type: "error",
            message: (await res.json()).message,
          });
          return;
        }
        setActionStatus({ type: "success", message: "ユーザー更新したよ！" });
        setRows(
          rowProps.map((row) => (row.id === newRow.id ? updatedRow : row))
        );
      }
      return updatedRow;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "保存失敗した…";
      setActionStatus({ type: "error", message: errorMsg });
      return newRow;
    }
  };

  const handleClose = () => {
    setActionStatus({ type: null, message: null });
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns = [
    {
      field: "custom_id",
      headerName: "ID",
      width: 90,
      editable: true,
      require: true,
    },
    {
      field: "name",
      headerName: "Name",
      width: 150,
      editable: true,
      require: true,
    },
    {
      field: "email",
      headerName: "Email",
      width: 200,
      editable: true,
      require: true,
    },
    {
      field: "external_email",
      headerName: "External Email",
      width: 200,
      editable: true,
      require: true,
      type: "email",
    },
    {
      field: "period",
      headerName: "Period",
      width: 150,
      editable: true,
      require: true,
    },
    {
      field: "id",
      headerName: "UUID",
      width: 300,
      editable: false,
      require: true,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      cellClassName: "actions",
      getActions: ({ id }: { id: string }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              material={{
                sx: {
                  color: "primary.main",
                },
              }}
              onClick={handleSaveClick(id)}
              key={`save-${id}`}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
              key={`cancel-${id}`}
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
            key={`edit-${id}`}
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
            key={`delete-${id}`}
          />,
        ];
      },
    },
  ];

  return (
    <>
      <DataGrid
        rows={rows}
        // @ts-expect-error This is a bug in the types, it should accept GridValidRowModel[]
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        slots={{ toolbar: EditToolbar }}
        slotProps={{
          // @ts-expect-error This type is overridden in the module augmentation
          toolbar: { setRows, setRowModesModel },
        }}
        showToolbar
      />
      {actionStatus.type && (
        <Snackbar
          open={actionStatus.type !== null}
          onClose={handleClose}
          autoHideDuration={2400}
        >
          <Alert
            onClose={handleClose}
            severity={actionStatus.type}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {actionStatus.message}
          </Alert>
        </Snackbar>
      )}
    </>
  );
}
