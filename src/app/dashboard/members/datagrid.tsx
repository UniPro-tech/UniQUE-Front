"use client";
import { DataGrid } from "@mui/x-data-grid";

import { GridValidRowModel } from "@mui/x-data-grid";

export default function DataGridContents({
  rows,
}: {
  rows: GridValidRowModel[];
}) {
  return (
    <DataGrid
      rows={rows}
      columns={[
        { field: "custom_id", headerName: "ID", width: 90 },
        { field: "name", headerName: "Name", width: 150 },
        { field: "email", headerName: "Email", width: 200 },
        { field: "external_email", headerName: "External Email", width: 200 },
        { field: "period", headerName: "Period", width: 150 },
        { field: "id", headerName: "UUID", width: 300 },
      ]}
    />
  );
}
