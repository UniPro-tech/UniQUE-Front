"use client";
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";

export default function MembersDataGrid({
  rows,
  canUpdate,
}: {
  rows: GridRowsProp;
  canUpdate: boolean;
}) {
  const columns: GridColDef[] = [
    ...(canUpdate ? [{ field: "id", headerName: "ID", width: 250 }] : []),
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
    { field: "period", headerName: "所属期", editable: canUpdate, width: 150 },
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
  return (
    <div style={{ height: 600, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        sx={{
          maxWidth: "100%",
        }}
      />
    </div>
  );
}
