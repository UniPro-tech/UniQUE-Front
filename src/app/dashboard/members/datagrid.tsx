"use client";
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";

export default function MembersDataGrid({
  rows,
  isRoot,
}: {
  rows: GridRowsProp;
  isRoot: boolean;
}) {
  const columns: GridColDef[] = [
    ...(isRoot ? [{ field: "id", headerName: "ID", width: 250 }] : []),
    { field: "name", headerName: "名前", width: 150 },
    { field: "customId", headerName: "カスタムID", width: 150 },
    { field: "email", headerName: "メールアドレス", width: 250 },
    ...(isRoot
      ? [
          {
            field: "externalEmail",
            headerName: "外部メールアドレス",
            width: 250,
          },
        ]
      : []),
    { field: "period", headerName: "所属期", width: 150 },
    ...(isRoot
      ? ([
          {
            field: "isEnable",
            headerName: "有効状態",
            width: 100,
            type: "boolean",
          },
          {
            field: "isSuspended",
            headerName: "停止状態",
            width: 100,
            type: "boolean",
          },
          {
            field: "suspendedReason",
            headerName: "停止理由",
            width: 200,
          },
          {
            field: "suspendedUntil",
            headerName: "停止解除日",
            width: 150,
            type: "dateTime",
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
      valueGetter: (value: Date) => {
        return value ? new Date(value) : null;
      },
    },
    ...(isRoot
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
